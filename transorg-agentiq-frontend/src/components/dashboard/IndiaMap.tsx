import { useState, useMemo } from 'react';
import { formatCompactINR, formatNumber } from '../../lib/utils';

export interface StateGeoData {
  state: string;
  volume?: number;
  dispute_ratio?: number;
  failure_rate?: number;
  tx_count?: number;
  cb_count?: number;
}

interface IndiaMapProps {
  stateData: StateGeoData[];
  selectedState?: string | null;
  onSelectState?: (state: string) => void;
}

// Authentic High-Fidelity Vector Paths for Indian States & Geographic Contours (ViewBox 0 0 650 720)
const INDIA_REGIONS = [
  {
    id: 'JK',
    name: 'Jammu & Kashmir',
    code: 'J&K',
    center: [215, 68],
    d: 'M 175,45 L 210,25 L 245,40 L 255,75 L 235,95 L 205,105 L 180,90 L 165,65 Z',
  },
  {
    id: 'LA',
    name: 'Ladakh',
    code: 'LDK',
    center: [275, 55],
    d: 'M 245,40 L 290,30 L 330,50 L 335,85 L 305,100 L 270,105 L 255,75 Z',
  },
  {
    id: 'HP',
    name: 'Himachal Pradesh',
    code: 'HP',
    center: [238, 125],
    d: 'M 215,100 L 255,95 L 275,115 L 265,145 L 235,150 L 215,130 Z',
  },
  {
    id: 'PB',
    name: 'Punjab',
    code: 'PB',
    center: [195, 145],
    isDatasetState: true,
    d: 'M 175,120 L 215,115 L 220,150 L 195,175 L 168,155 Z',
  },
  {
    id: 'UT',
    name: 'Uttarakhand',
    code: 'UK',
    center: [280, 150],
    d: 'M 260,130 L 295,125 L 315,155 L 295,180 L 265,165 Z',
  },
  {
    id: 'HR',
    name: 'Haryana',
    code: 'HR',
    center: [218, 185],
    d: 'M 195,160 L 235,155 L 245,190 L 225,215 L 195,200 Z',
  },
  {
    id: 'DL',
    name: 'Delhi',
    code: 'DL',
    center: [236, 188],
    isDatasetState: true,
    d: 'M 229,181 L 243,181 L 243,195 L 229,195 Z',
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    code: 'RJ',
    center: [155, 240],
    isDatasetState: true,
    d: 'M 140,165 L 195,170 L 215,220 L 205,280 L 165,310 L 115,285 L 100,225 L 130,180 Z',
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    code: 'UP',
    center: [295, 230],
    isDatasetState: true,
    d: 'M 240,185 L 315,170 L 375,210 L 370,265 L 320,290 L 260,270 L 240,230 Z',
  },
  {
    id: 'BR',
    name: 'Bihar',
    code: 'BR',
    center: [405, 255],
    d: 'M 375,230 L 440,225 L 450,270 L 400,285 L 375,265 Z',
  },
  {
    id: 'WB',
    name: 'West Bengal',
    code: 'WB',
    center: [445, 315],
    isDatasetState: true,
    d: 'M 430,240 L 455,235 L 450,295 L 465,355 L 435,370 L 420,315 Z',
  },
  {
    id: 'JH',
    name: 'Jharkhand',
    code: 'JH',
    center: [395, 315],
    d: 'M 375,285 L 425,280 L 430,335 L 390,350 L 365,320 Z',
  },
  {
    id: 'OD',
    name: 'Odisha',
    code: 'OD',
    center: [390, 395],
    d: 'M 365,340 L 425,345 L 440,405 L 400,450 L 350,420 Z',
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    code: 'MP',
    center: [250, 320],
    d: 'M 195,285 L 295,265 L 345,305 L 335,370 L 255,385 L 185,355 Z',
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    code: 'GJ',
    center: [95, 335],
    d: 'M 80,280 L 140,295 L 155,355 L 120,405 L 75,390 L 45,345 L 60,305 Z',
  },
  {
    id: 'CH',
    name: 'Chhattisgarh',
    code: 'CH',
    center: [335, 375],
    d: 'M 320,325 L 355,320 L 360,405 L 330,445 L 305,395 Z',
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    code: 'MH',
    center: [195, 420],
    isDatasetState: true,
    d: 'M 140,360 L 245,350 L 295,385 L 275,475 L 195,490 L 135,445 Z',
  },
  {
    id: 'TS',
    name: 'Telangana',
    code: 'TS',
    center: [270, 465],
    isDatasetState: true,
    d: 'M 245,430 L 305,420 L 315,485 L 275,515 L 240,480 Z',
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    code: 'AP',
    center: [295, 535],
    d: 'M 285,475 L 355,425 L 365,495 L 325,585 L 275,565 L 285,515 Z',
  },
  {
    id: 'KA',
    name: 'Karnataka',
    code: 'KA',
    center: [195, 535],
    isDatasetState: true,
    d: 'M 165,465 L 235,460 L 255,540 L 225,605 L 175,595 L 155,520 Z',
  },
  {
    id: 'GA',
    name: 'Goa',
    code: 'GA',
    center: [155, 515],
    d: 'M 150,508 L 162,508 L 162,522 L 150,522 Z',
  },
  {
    id: 'KL',
    name: 'Kerala',
    code: 'KL',
    center: [190, 640],
    d: 'M 175,590 L 205,590 L 200,675 L 175,670 L 165,620 Z',
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    code: 'TN',
    center: [235, 630],
    isDatasetState: true,
    d: 'M 215,570 L 275,565 L 265,655 L 225,685 L 205,645 Z',
  },
  {
    id: 'SK',
    name: 'Sikkim',
    code: 'SK',
    center: [465, 205],
    d: 'M 455,195 L 475,195 L 475,215 L 455,215 Z',
  },
  {
    id: 'AR',
    name: 'Arunachal Pradesh',
    code: 'AR',
    center: [565, 195],
    d: 'M 515,175 L 595,170 L 610,210 L 555,225 L 515,200 Z',
  },
  {
    id: 'AS',
    name: 'Assam',
    code: 'AS',
    center: [520, 240],
    d: 'M 475,225 L 555,215 L 565,255 L 515,270 L 475,250 Z',
  },
  {
    id: 'ML',
    name: 'Meghalaya',
    code: 'ML',
    center: [495, 260],
    d: 'M 475,252 L 520,252 L 520,270 L 475,270 Z',
  },
  {
    id: 'NL',
    name: 'Nagaland',
    code: 'NL',
    center: [580, 245],
    d: 'M 565,230 L 595,235 L 590,265 L 565,255 Z',
  },
  {
    id: 'MN',
    name: 'Manipur',
    code: 'MN',
    center: [575, 280],
    d: 'M 565,265 L 590,270 L 585,300 L 565,295 Z',
  },
  {
    id: 'MZ',
    name: 'Mizoram',
    code: 'MZ',
    center: [550, 315],
    d: 'M 540,295 L 565,295 L 560,340 L 535,335 Z',
  },
  {
    id: 'TR',
    name: 'Tripura',
    code: 'TR',
    center: [515, 300],
    d: 'M 505,288 L 528,288 L 525,315 L 505,310 Z',
  },
];

export default function IndiaMap({ stateData, selectedState, onSelectState }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<StateGeoData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map state names to dataset records
  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateGeoData>();
    stateData.forEach((s) => {
      const key = (s.state || '').toLowerCase().trim();
      map.set(key, s);
    });
    return map;
  }, [stateData]);

  const getDataForState = (stateName: string) => {
    const sLower = stateName.toLowerCase().trim();
    if (stateDataMap.has(sLower)) return stateDataMap.get(sLower);

    for (const [key, val] of stateDataMap.entries()) {
      if (key.includes(sLower) || sLower.includes(key)) {
        return val;
      }
    }
    return undefined;
  };

  const getStateVisuals = (stateName: string) => {
    const data = getDataForState(stateName);
    if (!data) {
      return {
        fill: '#0D2029',
        stroke: 'rgba(255,255,255,0.08)',
        isDataset: false,
        riskBadge: 'Baseline',
      };
    }

    const disputeRatio = data.dispute_ratio || 0;
    if (disputeRatio >= 15.0) {
      return {
        fill: '#FF9932', // High Dispute Rate (Saffron)
        stroke: '#FFAA4C',
        isDataset: true,
        riskBadge: 'Elevated Risk',
      };
    } else if (disputeRatio >= 11.0) {
      return {
        fill: '#FFC801', // Moderate Risk (Forsythia Gold)
        stroke: '#FFD733',
        isDataset: true,
        riskBadge: 'Moderate Risk',
      };
    } else {
      return {
        fill: '#114C5A', // Compliant / Low Risk (Nocturnal Teal)
        stroke: '#1A677B',
        isDataset: true,
        riskBadge: 'Compliant',
      };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* SVG Map Container with subtle cyber glow & technical telemetry layout */}
      <div className="relative w-full aspect-[4/3.7] min-h-[420px] bg-gradient-to-b from-[#10232B]/95 via-[#0E1F27]/95 to-[#0A161C]/98 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ocean & Telemetry Watermark Labels */}
        <div className="absolute left-3 bottom-12 text-[10px] font-mono tracking-widest text-mystic/20 uppercase pointer-events-none">
          Arabian Sea (IN-W)
        </div>
        <div className="absolute right-4 bottom-12 text-[10px] font-mono tracking-widest text-mystic/20 uppercase pointer-events-none">
          Bay of Bengal (IN-E)
        </div>

        <svg
          viewBox="0 0 650 720"
          className="w-full h-full max-h-[430px] drop-shadow-2xl select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
        >
          <defs>
            <filter id="geoGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Sri Lanka subtle shape for geographic anchor */}
            <path id="sriLanka" d="M 285,680 C 295,685 300,705 292,715 C 285,710 278,695 285,680 Z" />
          </defs>

          {/* Sri Lanka subtle anchor */}
          <use href="#sriLanka" fill="#0D2029" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" opacity="0.4" />

          {INDIA_REGIONS.map((st) => {
            const data = getDataForState(st.name);
            const { fill, stroke, isDataset } = getStateVisuals(st.name);
            const isSelected = selectedState?.toLowerCase() === st.name.toLowerCase();
            const isHovered = hoveredState?.state?.toLowerCase() === st.name.toLowerCase();

            return (
              <g
                key={st.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectState && onSelectState(st.name)}
                onMouseEnter={() => {
                  if (data) {
                    setHoveredState(data);
                  } else {
                    setHoveredState({
                      state: st.name,
                      volume: 0,
                      dispute_ratio: 0,
                      failure_rate: 0,
                      tx_count: 0,
                      cb_count: 0,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredState(null)}
              >
                {/* State Vector Boundary Path */}
                <path
                  d={st.d}
                  fill={fill}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#FFC801' : isDataset ? stroke : 'rgba(255,255,255,0.09)'}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.2 : isDataset ? 1.4 : 0.7}
                  opacity={isSelected ? 1 : isHovered ? 1 : isDataset ? 0.95 : 0.42}
                  filter={isSelected || (isHovered && isDataset) ? 'url(#geoGlow)' : undefined}
                />

                {/* State Label & Hub Pin for Active Dataset States */}
                {isDataset ? (
                  <g className="pointer-events-none">
                    {/* Animated Pulse Ring for High Risk States */}
                    {data && (data.dispute_ratio || 0) >= 15.0 && (
                      <circle
                        cx={st.center[0]}
                        cy={st.center[1] - 6}
                        r={8}
                        fill="none"
                        stroke="#FF9932"
                        strokeWidth={1}
                        className="animate-ping origin-center opacity-60"
                        style={{ transformOrigin: `${st.center[0]}px ${st.center[1] - 6}px` }}
                      />
                    )}

                    {/* Pin Center */}
                    <circle
                      cx={st.center[0]}
                      cy={st.center[1] - 6}
                      r={isSelected ? 6 : 4}
                      fill={fill === '#FF9932' ? '#FF9932' : fill === '#FFC801' ? '#FFC801' : '#114C5A'}
                      stroke="#FFFFFF"
                      strokeWidth={1.2}
                    />

                    {/* State Code Label */}
                    <text
                      x={st.center[0]}
                      y={st.center[1] + 9}
                      textAnchor="middle"
                      className="text-[11px] font-mono font-bold fill-white select-none"
                      style={{
                        textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.85)',
                      }}
                    >
                      {st.code}
                    </text>
                  </g>
                ) : (
                  <text
                    x={st.center[0]}
                    y={st.center[1]}
                    textAnchor="middle"
                    className="text-[9px] font-mono pointer-events-none fill-mystic/25 select-none"
                  >
                    {st.code}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Telemetry Card */}
        {hoveredState && (
          <div
            className="absolute pointer-events-none z-30 p-3.5 rounded-xl border shadow-2xl space-y-2 min-w-[210px]"
            style={{
              left: Math.min(hoverPos.x + 15, 230),
              top: Math.max(hoverPos.y - 60, 15),
              background: 'rgba(16, 35, 43, 0.97)',
              backdropFilter: 'blur(12px)',
              borderColor: hoveredState.volume ? '#FFC801' : 'rgba(255,255,255,0.15)',
              boxShadow: '0 15px 40px -5px rgba(0,0,0,0.8), 0 0 20px rgba(255,200,1,0.15)',
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-white/10">
              <span className="text-sm font-display font-semibold text-arctic">{hoveredState.state}</span>
              <span
                className={`text-[9px] mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  (hoveredState.dispute_ratio || 0) >= 15.0
                    ? 'bg-saffron/20 text-saffron border border-saffron/40'
                    : (hoveredState.dispute_ratio || 0) >= 11.0
                    ? 'bg-forsythia/20 text-forsythia border border-forsythia/40'
                    : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40'
                }`}
              >
                {(hoveredState.dispute_ratio || 0) >= 15.0
                  ? 'Elevated Risk'
                  : (hoveredState.dispute_ratio || 0) >= 11.0
                  ? 'Moderate'
                  : 'Compliant'}
              </span>
            </div>

            {hoveredState.volume && hoveredState.volume > 0 ? (
              <div className="text-xs space-y-1.5 text-mystic">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Processed Volume:</span>
                  <span className="font-mono text-forsythia font-bold">{formatCompactINR(hoveredState.volume)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Dispute Ratio:</span>
                  <span className="font-mono text-saffron font-bold">{hoveredState.dispute_ratio}%</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Chargebacks:</span>
                  <span className="font-mono text-saffron">{hoveredState.cb_count ?? 0}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Transactions:</span>
                  <span className="font-mono text-arctic">{formatNumber(hoveredState.tx_count || 0)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Gateway Failure:</span>
                  <span className="font-mono text-mystic/80">{hoveredState.failure_rate}%</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-mystic/50 italic py-1">No transaction records in this partition</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
