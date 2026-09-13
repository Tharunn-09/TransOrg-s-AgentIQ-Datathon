/**
 * Enterprise Speech Synthesis & Voice Intelligence Engine
 * Handles Web Speech API with Chromium bug workarounds:
 * - Anti-Garbage Collection reference retention
 * - 5-second interval speechSynthesis.resume() heartbeat (fixes Chrome 15s freeze bug)
 * - Automatic voice selection (prefers natural English voices)
 * - Audio Context introductory chime for instant acoustic feedback
 * - Safe sentence chunking for unlimited length narration
 */

let heartbeatTimer: any = null;
let audioCtx: AudioContext | null = null;

// Audio context chime for instant audible confirmation
function playIntroChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.debug('Audio chime skipped:', e);
  }
}

// Clean markdown and special symbols from text
export function sanitizeForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*_#`~>]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link to label
    .replace(/[₹$€£]/g, ' rupees ')
    .replace(/(\d+)\s*%/g, '$1 percent')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get the best available English voice
export function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize high-quality natural voices
  const preferred = voices.find(
    (v) =>
      (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online'))) ||
      v.name.includes('Samantha') ||
      v.name.includes('Jenny') ||
      v.name.includes('Guy') ||
      v.name.includes('David') ||
      v.name.includes('Zira')
  );

  if (preferred) return preferred;

  // Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
  return anyEnglish || voices[0] || null;
}

// Split text into digestible chunks for the speech engine
function chunkText(text: string): string[] {
  const clean = sanitizeForSpeech(text);
  if (!clean) return [];

  // Match sentences or clauses up to ~160 characters
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).length <= 160) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      current = trimmed;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [clean];
}

/**
 * Stop any ongoing speech synthesis and heartbeat timers
 */
export function stopSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (typeof window !== 'undefined') {
    (window as any).__agentiq_active_utterance = null;
  }
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.debug('Speech cancel error:', e);
  }
}

/**
 * Speak full text narrative with Chromium keep-alive heartbeat and voice selection
 */
export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError('Speech synthesis not supported on this device');
    return;
  }

  stopSpeech();

  const chunks = chunkText(text);
  if (chunks.length === 0) return;

  // Play subtle chime for instant acoustic user confirmation
  playIntroChime();

  // Chromium resume fix before speak
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    console.debug('Speech resume err:', e);
  }

  // Heartbeat to prevent Chrome 15s pause bug
  heartbeatTimer = setInterval(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }
  }, 4500);

  let currentChunkIndex = 0;
  let hasStarted = false;

  const speakNextChunk = () => {
    if (currentChunkIndex >= chunks.length) {
      stopSpeech();
      if (onEnd) onEnd();
      return;
    }

    const chunkStr = chunks[currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkStr);
    if (typeof window !== 'undefined') {
      (window as any).__agentiq_active_utterance = utterance; // Prevent GC
    }

    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }
    };

    utterance.onend = () => {
      currentChunkIndex++;
      speakNextChunk();
    };

    utterance.onerror = (evt) => {
      console.warn('Speech synthesis utterance error:', evt);
      // If error is 'canceled' or 'interrupted', don't cascade errors
      if (evt.error === 'canceled' || evt.error === 'interrupted') {
        stopSpeech();
        if (onEnd) onEnd();
      } else {
        currentChunkIndex++;
        if (currentChunkIndex < chunks.length) {
          speakNextChunk();
        } else {
          stopSpeech();
          if (onError) onError(evt);
          if (onEnd) onEnd();
        }
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
      // Double resume in case browser queued it in suspended state
      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 50);
    } catch (e) {
      console.error('Error in window.speechSynthesis.speak:', e);
      if (onError) onError(e);
      if (onEnd) onEnd();
    }
  };

  // Ensure voices are loaded
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      speakNextChunk();
    };
    // Timeout fallback if onvoiceschanged doesn't fire
    setTimeout(() => {
      if (!hasStarted && currentChunkIndex === 0) {
        speakNextChunk();
      }
    }, 150);
  } else {
    speakNextChunk();
  }
}

/**
 * Check if the engine is currently speaking
 */
export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
