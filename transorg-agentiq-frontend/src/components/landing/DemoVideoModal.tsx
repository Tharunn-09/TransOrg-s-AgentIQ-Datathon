import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, ArrowRight, Sparkles, Clock } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void;
}

const CHAPTERS = [
  { label: '0:00 Landing Page', time: 0 },
  { label: '0:15 MFA Auth', time: 15 },
  { label: '0:32 Executive Overview', time: 32 },
  { label: '0:50 Isolation Forest', time: 50 },
  { label: '1:10 Graph AI Rings', time: 70 },
  { label: '1:30 Regulatory SAR', time: 90 },
];

export default function DemoVideoModal({ isOpen, onClose, onLaunch }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        togglePlay();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const jumpTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#061017]/90 backdrop-blur-xl transition-opacity"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-forsythia/40 bg-[#10232B]/98 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(255,200,1,0.18)] z-10 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-surface-border bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forsythia/15 border border-forsythia/30 flex items-center justify-center text-forsythia shadow-inner">
                  <Play size={17} className="fill-forsythia/30 translate-x-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold font-display text-arctic tracking-tight">
                      AgentIQ Platform Walkthrough Demo
                    </h3>
                    <span className="text-[10px] mono px-2 py-0.5 rounded-full bg-forsythia/20 text-forsythia border border-forsythia/30 font-bold">
                      1080p HD
                    </span>
                  </div>
                  <p className="text-xs text-mystic/60 font-mono">
                    Autonomous UPI Fraud Ring &amp; Merchant Risk Command Center
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-mystic/60 hover:text-arctic hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
              <video
                ref={videoRef}
                src="./assets/demo_walkthrough.mp4"
                autoPlay
                playsInline
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    setDuration(videoRef.current.duration || 0);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              >
                <source src="/assets/demo_walkthrough.mp4" type="video/mp4" />
                <source src="./assets/demo_walkthrough.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Floating Quick Action Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
                <div />
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-forsythia text-arctic hover:text-oceanic transition-all backdrop-blur-md"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-arctic transition-all backdrop-blur-md"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX size={18} className="text-saffron" /> : <Volume2 size={18} />}
                    </button>

                    <span className="text-xs font-mono text-arctic bg-black/40 px-2.5 py-1 rounded-md">
                      {formatTime(currentTime)} / {formatTime(duration || 105)}
                    </span>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-arctic transition-all backdrop-blur-md"
                    title="Fullscreen"
                  >
                    <Maximize size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Chapter Markers & Timestamps */}
            <div className="px-5 py-3 border-t border-surface-border bg-white/[0.015] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-1.5 text-xs text-mystic/60 mono font-semibold shrink-0 mr-1">
                  <Clock size={13} className="text-forsythia" />
                  <span>Chapters:</span>
                </div>
                {CHAPTERS.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpTo(ch.time)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all shrink-0 font-mono flex items-center gap-1 ${
                      currentTime >= ch.time && (idx === CHAPTERS.length - 1 || currentTime < CHAPTERS[idx + 1].time)
                        ? 'bg-forsythia/20 text-forsythia border-forsythia/50 font-bold shadow-sm'
                        : 'bg-white/[0.03] text-mystic/70 border-surface-border hover:text-arctic hover:border-forsythia/30'
                    }`}
                  >
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onLaunch();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-forsythia to-saffron text-oceanic text-xs font-bold flex items-center gap-2 hover:shadow-glow transition-all active:scale-95 shadow-md"
                >
                  <Sparkles size={14} />
                  <span>Launch Live Platform</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
