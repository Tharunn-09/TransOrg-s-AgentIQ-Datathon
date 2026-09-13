import { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
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

// Realistic High-Fidelity Geo-Paths for Indian States & UTs (ViewBox: 0 0 800 920)
const INDIAN_STATES_GEOMETRY = [
  {
    id: 'JK',
    name: 'Jammu & Kashmir',
    code: 'JK',
    center: [285, 100],
    d: 'M 255,45 C 280,35 315,35 340,65 C 355,85 365,115 350,135 C 330,150 295,155 270,145 C 250,135 240,105 245,75 Z',
  },
  {
    id: 'LA',
    name: 'Ladakh',
    code: 'LA',
    center: [360, 90],
    d: 'M 340,65 C 365,55 410,65 425,95 C 435,120 420,145 390,150 C 365,155 350,135 350,115 Z',
  },
  {
    id: 'HP',
    name: 'Himachal Pradesh',
    code: 'HP',
    center: [315, 175],
    d: 'M 285,150 C 315,145 345,150 355,175 C 365,200 335,215 305,210 C 285,205 275,180 285,150 Z',
  },
  {
    id: 'PB',
    name: 'Punjab',
    code: 'PB',
    center: [255, 195],
    isDatasetState: true,
    d: 'M 230,165 C 265,160 285,175 285,205 C 285,230 255,245 230,235 C 215,220 215,185 230,165 Z',
  },
  {
    id: 'UT',
    name: 'Uttarakhand',
    code: 'UT',
    center: [365, 205],
    d: 'M 345,180 C 375,175 405,195 405,225 C 395,245 365,250 345,230 C 335,215 335,195 345,180 Z',
  },
  {
    id: 'HR',
    name: 'Haryana',
    code: 'HR',
    center: [280, 245],
    d: 'M 260,215 C 285,210 305,225 305,255 C 305,280 275,290 255,275 C 245,255 245,230 260,215 Z',
  },
  {
    id: 'DL',
    name: 'Delhi',
    code: 'DL',
    center: [298, 252],
    isDatasetState: true,
    d: 'M 292,246 C 304,246 304,258 292,258 C 288,258 288,246 292,246 Z',
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    code: 'RJ',
    center: [205, 320],
    isDatasetState: true,
    d: 'M 175,230 C 235,220 265,255 265,305 C 275,370 235,410 175,395 C 135,385 115,330 145,265 C 155,245 165,235 175,230 Z',
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    code: 'UP',
    center: [385, 305],
    isDatasetState: true,
    d: 'M 305,245 C 375,225 455,275 465,335 C 465,375 415,395 345,390 C 305,385 285,340 295,290 C 295,270 300,255 305,245 Z',
  },
  {
    id: 'BR',
    name: 'Bihar',
    code: 'BR',
    center: [515, 335],
    d: 'M 465,305 C 535,300 565,325 565,365 C 555,390 505,395 465,380 C 455,355 455,325 465,305 Z',
  },
  {
    id: 'WB',
    name: 'West Bengal',
    code: 'WB',
    center: [555, 420],
    isDatasetState: true,
    d: 'M 545,340 C 565,335 585,365 585,420 C 585,475 555,495 535,485 C 525,450 535,385 545,340 Z',
  },
  {
    id: 'JH',
    name: 'Jharkhand',
    code: 'JH',
    center: [495, 410],
    d: 'M 465,375 C 525,370 545,400 535,445 C 515,465 465,460 455,430 C 445,405 455,385 465,375 Z',
  },
  {
    id: 'OD',
    name: 'Odisha',
    code: 'OD',
    center: [495, 510],
    d: 'M 455,455 C 535,445 555,505 545,565 C 515,595 465,585 445,545 C 435,505 445,470 455,455 Z',
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    code: 'MP',
    center: [320, 430],
    d: 'M 245,375 C 345,360 435,385 445,445 C 445,495 365,525 285,505 C 225,490 205,435 245,375 Z',
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    code: 'GJ',
    center: [125, 440],
    d: 'M 95,365 C 165,370 195,415 195,475 C 175,535 115,545 75,505 C 45,465 55,405 95,365 Z',
  },
  {
    id: 'CH',
    name: 'Chhattisgarh',
    code: 'CH',
    center: [425, 490],
    d: 'M 405,435 C 445,430 455,475 445,555 C 435,595 395,585 385,535 C 385,485 395,450 405,435 Z',
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    code: 'MH',
    center: [235, 545],
    isDatasetState: true,
    d: 'M 175,475 C 285,465 355,505 355,580 C 355,645 265,665 195,645 C 145,615 135,535 175,475 Z',
  },
  {
    id: 'TS',
    name: 'Telangana',
    code: 'TS',
    center: [330, 605],
    isDatasetState: true,
    d: 'M 295,565 C 365,555 385,595 375,655 C 345,675 295,665 275,630 C 275,595 285,575 295,565 Z',
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    code: 'AP',
    center: [365, 695],
    d: 'M 355,620 C 435,575 455,655 425,750 C 385,785 335,765 325,715 C 325,670 345,635 355,620 Z',
  },
  {
    id: 'KA',
    name: 'Karnataka',
    code: 'KA',
    center: [235, 695],
    isDatasetState: true,
    d: 'M 195,625 C 275,615 295,675 285,765 C 255,785 205,775 185,725 C 165,680 175,645 195,625 Z',
  },
  {
    id: 'GA',
    name: 'Goa',
    code: 'GA',
    center: [175, 665],
    d: 'M 170,655 C 180,655 180,672 170,672 C 165,672 165,655 170,655 Z',
  },
  {
    id: 'KL',
    name: 'Kerala',
    code: 'KL',
    center: [230, 805],
    d: 'M 215,745 C 245,745 245,795 235,855 C 215,865 195,835 205,785 C 205,765 210,750 215,745 Z',
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    code: 'TN',
    center: [285, 800],
    isDatasetState: true,
    d: 'M 255,735 C 325,730 335,785 315,865 C 275,885 245,865 245,805 C 245,765 250,745 255,735 Z',
  },
  {
    id: 'SK',
    name: 'Sikkim',
    code: 'SK',
    center: [575, 290],
    d: 'M 565,275 C 585,275 585,305 565,305 C 555,305 555,275 565,275 Z',
  },
  {
    id: 'AS',
    name: 'Assam',
    code: 'AS',
    center: [655, 335],
    d: 'M 595,305 C 685,295 725,325 715,365 C 675,385 615,375 595,345 Z',
  },
  {
    id: 'AR',
    name: 'Arunachal Pradesh',
    code: 'AR',
    center: [710, 275],
    d: 'M 645,245 C 735,235 775,275 755,315 C 715,325 665,305 645,275 Z',
  },
  {
    id: 'ML',
    name: 'Meghalaya',
    code: 'ML',
    center: [625, 360],
    d: 'M 605,348 C 655,348 655,375 605,375 Z',
  },
  {
    id: 'NL',
    name: 'Nagaland',
    code: 'NL',
    center: [730, 345],
    d: 'M 715,325 C 745,335 745,365 715,365 Z',
  },
  {
    id: 'MN',
    name: 'Manipur',
    code: 'MN',
    center: [725, 390],
    d: 'M 710,370 C 740,375 740,410 710,410 Z',
  },
  {
    id: 'MZ',
    name: 'Mizoram',
    code: 'MZ',
    center: [695, 430],
    d: 'M 680,405 C 710,405 710,455 680,455 Z',
  },
  {
    id: 'TR',
    name: 'Tripura',
    code: 'TR',
    center: [650, 415],
    d: 'M 635,395 C 665,395 665,435 635,435 Z',
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
    
    // Fuzzy matching for state names
    for (const [key, val] of stateDataMap.entries()) {
      if (key.includes(sLower) || sLower.includes(key)) {
        return val;
      }
    }
    return undefined;
  };

  // Determine state color based on live dataset telemetry
  const getStateVisuals = (stateName: string) => {
    const data = getDataForState(stateName);
    if (!data) {
      return {
        fill: '#0C2028',
        stroke: 'rgba(255,255,255,0.08)',
        isDataset: false,
        riskBadge: 'Baseline',
      };
    }

    const disputeRatio = data.dispute_ratio || 0;
    if (disputeRatio >= 15.0) {
      return {
        fill: '#FF9932', // Saffron / High Risk
        stroke: '#FF9932',
        isDataset: true,
        riskBadge: 'Elevated Risk',
      };
    } else if (disputeRatio >= 11.0) {
      return {
        fill: '#FFC801', // Forsythia Gold / Moderate
        stroke: '#FFC801',
        isDataset: true,
        riskBadge: 'Moderate Risk',
      };
    } else {
      return {
        fill: '#114C5A', // Nocturnal Teal / Baseline
        stroke: '#196173',
        isDataset: true,
        riskBadge: 'Compliant',
      };
    }
  };

  // Sort dataset states by volume descending
  const sortedDatasetStates = useMemo(() => {
    return [...stateData].sort((a, b) => (b.volume || 0) - (a.volume || 0));
  }, [stateData]);

  return (
    <div className="space-y-4">
      {/* SVG Topology Container */}
      <div className="relative w-full aspect-[4/3] max-h-[480px] bg-gradient-to-b from-[#10232B]/80 to-[#142A34]/90 border border-surface-border rounded-xl p-3 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#D9E8E2 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox="0 0 800 920"
          className="w-full h-full max-h-[460px] drop-shadow-2xl select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
        >
          <defs>
            <filter id="indiaMapGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="activeHubPulse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {INDIAN_STATES_GEOMETRY.map((st) => {
            const data = getDataForState(st.name);
            const { fill, stroke, isDataset } = getStateVisuals(st.name);
            const isSelected = selectedState?.toLowerCase() === st.name.toLowerCase();
            const isHovered = hoveredState?.state?.toLowerCase() === st.name.toLowerCase();

            return (
              <g
                key={st.id}
                className="cursor-pointer transition-all duration-300"
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
                {/* State Vector Geometry */}
                <path
                  d={st.d}
                  fill={fill}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#FFC801' : isDataset ? stroke : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : isDataset ? 1.5 : 0.75}
                  opacity={isSelected ? 1 : isHovered ? 1 : isDataset ? 0.92 : 0.45}
                  filter={isSelected || (isHovered && isDataset) ? 'url(#indiaMapGlow)' : undefined}
                />

                {/* State Hub Indicator for Dataset States */}
                {isDataset && (
                  <>
                    <circle
                      cx={st.center[0]}
                      cy={st.center[1] - 8}
                      r={isSelected ? 7 : 4.5}
                      fill={fill === '#FF9932' ? '#FF9932' : fill === '#FFC801' ? '#FFC801' : '#114C5A'}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      className="pointer-events-none"
                    />
                    <text
                      x={st.center[0]}
                      y={st.center[1] + 10}
                      textAnchor="middle"
                      className="text-[13px] font-mono font-bold pointer-events-none fill-[#D9E8E2] select-none"
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {st.code}
                    </text>
                  </>
                )}

                {!isDataset && (
                  <text
                    x={st.center[0]}
                    y={st.center[1]}
                    textAnchor="middle"
                    className="text-[10px] font-mono pointer-events-none fill-mystic/30 select-none"
                  >
                    {st.code}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Hover Telemetry Card */}
        {hoveredState && (
          <div
            className="absolute pointer-events-none z-30 p-3.5 rounded-lg border border-surface-border shadow-2xl space-y-2 min-w-[210px]"
            style={{
              left: Math.min(hoverPos.x + 18, 260),
              top: Math.max(hoverPos.y - 70, 15),
              background: 'rgba(16, 35, 43, 0.96)',
              backdropFilter: 'blur(12px)',
              borderColor: hoveredState.volume ? '#FFC801' : 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-surface-border">
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
                  ? 'High Risk'
                  : (hoveredState.dispute_ratio || 0) >= 11.0
                  ? 'Moderate'
                  : 'Normal'}
              </span>
            </div>

            {hoveredState.volume && hoveredState.volume > 0 ? (
              <div className="text-xs space-y-1.5 text-[#D9E8E2]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Volume:</span>
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
                  <span className="font-mono text-[#D9E8E2]">{formatNumber(hoveredState.tx_count || 0)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-mystic/60">Failure Rate:</span>
                  <span className="font-mono text-[#D9E8E2]">{hoveredState.failure_rate}%</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-mystic/50 italic py-1">No transaction records present in this batch</p>
            )}
          </div>
        )}
      </div>

      {/* Dataset State Telemetry Strip: All 9 States Visible simultaneously */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-mystic/70 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers size={13} className="text-forsythia" />
            <span>All {sortedDatasetStates.length} Active States in Dataset (Click to inspect):</span>
          </span>
          <span className="font-mono text-[11px] text-forsythia">
            Total Dataset Volume: {formatCompactINR(sortedDatasetStates.reduce((acc, s) => acc + (s.volume || 0), 0))}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sortedDatasetStates.map((st) => {
            const isSelected = selectedState?.toLowerCase() === st.state.toLowerCase();
            const isHighRisk = (st.dispute_ratio || 0) >= 15.0;
            const isModerate = (st.dispute_ratio || 0) >= 11.0;

            return (
              <div
                key={st.state}
                onClick={() => onSelectState && onSelectState(st.state)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-forsythia bg-forsythia/10 shadow-glow'
                    : 'border-surface-border bg-white/[0.02] hover:bg-white/[0.04] hover:border-forsythia/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-arctic truncate">{st.state}</span>
                  <span
                    className={`text-[9px] mono px-1.5 py-0.5 rounded font-bold ${
                      isHighRisk
                        ? 'bg-saffron/20 text-saffron'
                        : isModerate
                        ? 'bg-forsythia/20 text-forsythia'
                        : 'bg-emerald-400/20 text-emerald-400'
                    }`}
                  >
                    {st.dispute_ratio}% CB
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#D9E8E2] mono">
                  <span className="text-forsythia font-semibold">{formatCompactINR(st.volume || 0)}</span>
                  <span className="text-mystic/60">{formatNumber(st.tx_count || 0)} txns</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
