import React, { useState } from 'react';
import { RacketZone } from '../types';
import { playTennisPop } from '../utils/audio';

interface RacketSVGProps {
  activeZone: RacketZone;
  onSelectZone: (zone: RacketZone) => void;
  hoveredZone: RacketZone | null;
  onHoverZone: (zone: RacketZone | null) => void;
}

export const RacketSVG: React.FC<RacketSVGProps> = ({
  activeZone,
  onSelectZone,
  hoveredZone,
  onHoverZone,
}) => {
  const [internalHover, setInternalHover] = useState<RacketZone | null>(null);

  const currentHover = hoveredZone || internalHover;

  const handleZoneClick = (zone: RacketZone) => {
    playTennisPop(
      zone === 'sweetSpot'
        ? 620
        : zone === 'strings'
        ? 520
        : zone === 'dampener'
        ? 480
        : zone === 'frame'
        ? 440
        : 380
    );
    onSelectZone(zone);
  };

  const handleMouseEnter = (zone: RacketZone) => {
    setInternalHover(zone);
    onHoverZone(zone);
  };

  const handleMouseLeave = () => {
    setInternalHover(null);
    onHoverZone(null);
  };

  // Generate string grid coordinates
  // Mains (vertical strings)
  const mainXPositions = [
    128, 140, 152, 164, 176, 188, 200, 212, 228, 240, 252, 264, 276, 288, 300, 312
  ];

  // Crosses (horizontal strings)
  const crossYPositions = [
    115, 130, 145, 160, 175, 190, 205, 220, 235, 250, 265, 280, 295, 310, 325, 340, 355, 370, 385, 400, 415
  ];

  // Sweet spot bounds
  const sweetSpotCenter = { x: 220, y: 265 };
  const isInsideSweetSpot = (x: number, y: number) => {
    const dx = (x - sweetSpotCenter.x) / 52;
    const dy = (y - sweetSpotCenter.y) / 64;
    return dx * dx + dy * dy <= 1;
  };

  const isSweetSpotActive = activeZone === 'sweetSpot' || currentHover === 'sweetSpot';
  const isStringsActive = activeZone === 'strings' || currentHover === 'strings';
  const isDampenerActive = activeZone === 'dampener' || currentHover === 'dampener';
  const isFrameActive = activeZone === 'frame' || currentHover === 'frame';
  const isGripActive = activeZone === 'grip' || currentHover === 'grip';

  return (
    <div className="relative w-full max-w-[420px] mx-auto flex flex-col items-center select-none">
      {/* Interactive Quick Indicator Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full px-2">
        {(
          [
            { id: 'sweetSpot', label: 'Sweet Spot' },
            { id: 'strings', label: 'Strings' },
            { id: 'dampener', label: 'Dampener' },
            { id: 'frame', label: 'Frame' },
            { id: 'grip', label: 'Grip' },
          ] as const
        ).map((tab) => {
          const isSelected = activeZone === tab.id;
          const isHovered = currentHover === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-select-${tab.id}`}
              type="button"
              onClick={() => handleZoneClick(tab.id)}
              onMouseEnter={() => handleMouseEnter(tab.id)}
              onMouseLeave={handleMouseLeave}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-[#CCFF00] text-[#090A0F] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.4)] font-semibold scale-105'
                  : isHovered
                  ? 'bg-[#181A22] text-[#CCFF00] border-[#CCFF00]/50'
                  : 'bg-[#12141C] text-[#A1A1AA] border-[#222533] hover:text-[#FAFAFA]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SVG Container */}
      <div className="relative w-full aspect-[440/940] max-h-[640px] flex items-center justify-center">
        <svg
          viewBox="0 0 440 940"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient graphite gradients */}
            <linearGradient id="carbonBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2E3D" />
              <stop offset="40%" stopColor="#161822" />
              <stop offset="70%" stopColor="#0E1017" />
              <stop offset="100%" stopColor="#1E2230" />
            </linearGradient>

            <linearGradient id="neonGripWrap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A1C24" />
              <stop offset="35%" stopColor="#2D3242" />
              <stop offset="65%" stopColor="#191B24" />
              <stop offset="100%" stopColor="#0B0D12" />
            </linearGradient>

            <linearGradient id="glowRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#B3E600" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.9" />
            </linearGradient>

            {/* Neon Court Green Radial Glow for Sweet Spot */}
            <radialGradient id="sweetSpotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#CCFF00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sweetSpotCenterAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#CCFF00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
            </radialGradient>

            {/* Subtle drop shadows */}
            <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ========================================================= */}
          {/* HOTZONE 3: THE FRAME (Head Rim, Throat, and Shaft) */}
          {/* ========================================================= */}
          <g
            id="hotzone-frame"
            className="cursor-pointer transition-all duration-300"
            onClick={() => handleZoneClick('frame')}
            onMouseEnter={() => handleMouseEnter('frame')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Outer Head Oval Shadow */}
            <ellipse
              cx="220"
              cy="265"
              rx="124"
              ry="184"
              fill="none"
              stroke="#050608"
              strokeWidth="22"
              opacity="0.8"
            />

            {/* Outer Head Graphite Rim */}
            <ellipse
              cx="220"
              cy="265"
              rx="120"
              ry="180"
              fill="none"
              stroke={isFrameActive ? 'url(#glowRimGradient)' : 'url(#carbonBevel)'}
              strokeWidth="16"
              filter={isFrameActive ? 'url(#neonBlur)' : undefined}
              className="transition-all duration-300"
            />

            {/* Inner Graphite Bevel Edge */}
            <ellipse
              cx="220"
              cy="265"
              rx="112"
              ry="172"
              fill="none"
              stroke={isFrameActive ? '#CCFF00' : '#3A4052'}
              strokeWidth="1.8"
              strokeDasharray={isFrameActive ? 'none' : '6 3'}
              className="transition-all duration-300"
            />

            {/* Aerodynamic Beam Exterior Chamfer Line */}
            <ellipse
              cx="220"
              cy="265"
              rx="126"
              ry="186"
              fill="none"
              stroke={isFrameActive ? '#CCFF00' : '#1A1D27'}
              strokeWidth={isFrameActive ? '2.5' : '1'}
              opacity={isFrameActive ? 1 : 0.6}
            />

            {/* Grommet Strip Bumper on Head (top protection guard) */}
            <path
              d="M 120 220 C 120 120, 160 80, 220 80 C 280 80, 320 120, 320 220"
              fill="none"
              stroke={isFrameActive ? '#CCFF00' : '#0B0D13'}
              strokeWidth="5"
              strokeLinecap="round"
              opacity={isFrameActive ? 0.9 : 0.75}
            />

            {/* Throat Left Arm */}
            <path
              d="M 148 420 C 158 470, 190 535, 204 585 L 214 585 C 200 535, 174 465, 168 420 Z"
              fill={isFrameActive ? '#2B3B0C' : 'url(#carbonBevel)'}
              stroke={isFrameActive ? '#CCFF00' : '#2D3345'}
              strokeWidth={isFrameActive ? '2.5' : '1.5'}
              className="transition-all duration-300"
            />

            {/* Throat Right Arm */}
            <path
              d="M 292 420 C 282 470, 250 535, 236 585 L 226 585 C 240 535, 266 465, 272 420 Z"
              fill={isFrameActive ? '#2B3B0C' : 'url(#carbonBevel)'}
              stroke={isFrameActive ? '#CCFF00' : '#2D3345'}
              strokeWidth={isFrameActive ? '2.5' : '1.5'}
              className="transition-all duration-300"
            />

            {/* Throat Bridge (horizontal inverted arch holding lower strings) */}
            <path
              d="M 166 426 Q 220 448 274 426 L 270 442 Q 220 464 170 442 Z"
              fill={isFrameActive ? '#334812' : '#141722'}
              stroke={isFrameActive ? '#CCFF00' : '#3F475F'}
              strokeWidth={isFrameActive ? '2' : '1.2'}
              className="transition-all duration-300"
            />

            {/* Throat Triangle Open Void Accent */}
            <path
              d="M 184 456 Q 220 472 256 456 C 244 515, 226 555, 220 568 C 214 555, 196 515, 184 456 Z"
              fill="#090A0F"
              stroke={isFrameActive ? '#CCFF00' : '#1D212E'}
              strokeWidth={isFrameActive ? '2' : '1'}
              opacity="0.9"
            />

            {/* Graphite Architecture Tech Stamp */}
            <text
              x="220"
              y="530"
              textAnchor="middle"
              fill={isFrameActive ? '#CCFF00' : '#6A728A'}
              fontSize="7.5"
              letterSpacing="2"
              fontFamily="monospace"
              fontWeight="600"
            >
              BRAID 45 GRAPHITE
            </text>
            <text
              x="220"
              y="544"
              textAnchor="middle"
              fill={isFrameActive ? '#FAFAFA' : '#454C62'}
              fontSize="6"
              letterSpacing="1.5"
              fontFamily="monospace"
            >
              98 SQ IN • 305G
            </text>
          </g>

          {/* ========================================================= */}
          {/* HOTZONE 2: THE STRINGS (Mains & Crosses outside sweet spot) */}
          {/* ========================================================= */}
          <g
            id="hotzone-strings"
            className="cursor-pointer transition-all duration-300"
            onClick={() => handleZoneClick('strings')}
            onMouseEnter={() => handleMouseEnter('strings')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Stringbed Aura */}
            <ellipse
              cx="220"
              cy="265"
              rx="108"
              ry="168"
              fill={isStringsActive ? 'rgba(204,255,0,0.06)' : 'rgba(16,20,30,0.3)'}
              className="transition-all duration-300"
            />

            {/* Mains (Vertical Strings) */}
            {mainXPositions.map((x) => {
              // Calculate y boundaries based on ellipse formula (x-220)^2 / 108^2 + (y-265)^2 / 168^2 = 1
              const dx = (x - 220) / 108;
              if (Math.abs(dx) >= 0.98) return null;
              const dy = Math.sqrt(Math.max(0, 1 - dx * dx)) * 164;
              const y1 = 265 - dy;
              const y2 = 265 + dy;

              return (
                <line
                  key={`main-${x}`}
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke={
                    isStringsActive
                      ? '#CCFF00'
                      : isSweetSpotActive && Math.abs(x - 220) < 45
                      ? '#556633'
                      : '#3A4254'
                  }
                  strokeWidth={isStringsActive ? '1.5' : '1'}
                  opacity={isStringsActive ? 0.9 : 0.6}
                  className="transition-colors duration-200"
                />
              );
            })}

            {/* Crosses (Horizontal Strings) */}
            {crossYPositions.map((y) => {
              const dy = (y - 265) / 168;
              if (Math.abs(dy) >= 0.98) return null;
              const dx = Math.sqrt(Math.max(0, 1 - dy * dy)) * 105;
              const x1 = 220 - dx;
              const x2 = 220 + dx;

              return (
                <line
                  key={`cross-${y}`}
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={
                    isStringsActive
                      ? '#CCFF00'
                      : isSweetSpotActive && Math.abs(y - 265) < 55
                      ? '#556633'
                      : '#3A4254'
                  }
                  strokeWidth={isStringsActive ? '1.5' : '1'}
                  opacity={isStringsActive ? 0.9 : 0.6}
                  className="transition-colors duration-200"
                />
              );
            })}
          </g>

          {/* ========================================================= */}
          {/* HOTZONE: THE VIBRATION DAMPENER (Silicone Insert at Base) */}
          {/* ========================================================= */}
          <g
            id="hotzone-dampener"
            className="cursor-pointer transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleZoneClick('dampener');
            }}
            onMouseEnter={() => handleMouseEnter('dampener')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Extended Touch / Click Hitbox */}
            <circle cx="220" cy="421" r="24" fill="transparent" />

            {/* Glowing Aura when active or hovered */}
            {isDampenerActive && (
              <circle
                cx="220"
                cy="421"
                r="18"
                fill="#CCFF00"
                opacity="0.35"
                filter="url(#softGlow)"
              />
            )}

            {/* Silicone Dampener Body */}
            <rect
              x="208"
              y="413"
              width="24"
              height="16"
              rx="6"
              fill={isDampenerActive ? '#CCFF00' : '#1E2230'}
              stroke={isDampenerActive ? '#FAFAFA' : '#C8A462'}
              strokeWidth={isDampenerActive ? '2' : '1.5'}
              className="transition-all duration-200"
            />
            {/* Inner Recessed Notch */}
            <circle
              cx="220"
              cy="421"
              r="4"
              fill={isDampenerActive ? '#090A0F' : '#0B0D12'}
              stroke={isDampenerActive ? '#CCFF00' : '#8A8478'}
              strokeWidth="1"
            />
          </g>

          {/* ========================================================= */}
          {/* HOTZONE 1: THE SWEET SPOT (Center of Stringbed) */}
          {/* ========================================================= */}
          <g
            id="hotzone-sweet-spot"
            className="cursor-pointer transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleZoneClick('sweetSpot');
            }}
            onMouseEnter={() => handleMouseEnter('sweetSpot')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Center Area Glow Fill */}
            <ellipse
              cx="220"
              cy="265"
              rx="55"
              ry="70"
              fill="url(#sweetSpotGlow)"
              className={`transition-opacity duration-300 ${isSweetSpotActive ? 'opacity-100' : 'opacity-20 hover:opacity-75'}`}
            />

            {/* Concentric Impact Shockwaves */}
            <ellipse
              cx="220"
              cy="265"
              rx="44"
              ry="56"
              fill="none"
              stroke="#CCFF00"
              strokeWidth={isSweetSpotActive ? '2.5' : '1.2'}
              strokeDasharray={isSweetSpotActive ? 'none' : '4 3'}
              opacity={isSweetSpotActive ? 0.95 : 0.45}
              filter={isSweetSpotActive ? 'url(#softGlow)' : undefined}
              className="transition-all duration-300"
            />

            <ellipse
              cx="220"
              cy="265"
              rx="26"
              ry="34"
              fill="none"
              stroke="#CCFF00"
              strokeWidth={isSweetSpotActive ? '2' : '1'}
              opacity={isSweetSpotActive ? 0.9 : 0.35}
              className="transition-all duration-300"
            />

            {/* Bright Center Crosshairs & Bullseye */}
            <circle
              cx="220"
              cy="265"
              r={isSweetSpotActive ? 9 : 5}
              fill="#CCFF00"
              filter="url(#softGlow)"
              className="transition-all duration-300"
            />
            <circle cx="220" cy="265" r="3" fill="#090A0F" />

            {/* Center Strings Highlight Over Sweet Spot */}
            {mainXPositions
              .filter((x) => Math.abs(x - 220) <= 44)
              .map((x) => (
                <line
                  key={`sweet-main-${x}`}
                  x1={x}
                  y1={210}
                  x2={x}
                  y2={320}
                  stroke="#CCFF00"
                  strokeWidth={isSweetSpotActive ? '2.2' : '1.5'}
                  opacity={isSweetSpotActive ? 1 : 0.5}
                />
              ))}

            {crossYPositions
              .filter((y) => Math.abs(y - 265) <= 56)
              .map((y) => (
                <line
                  key={`sweet-cross-${y}`}
                  x1={176}
                  y1={y}
                  x2={264}
                  y2={y}
                  stroke="#CCFF00"
                  strokeWidth={isSweetSpotActive ? '2.2' : '1.5'}
                  opacity={isSweetSpotActive ? 1 : 0.5}
                />
              ))}
          </g>

          {/* ========================================================= */}
          {/* HOTZONE 4: THE GRIP (Shaft, Grip Wrap, Bevels, Butt Cap) */}
          {/* ========================================================= */}
          <g
            id="hotzone-grip"
            className="cursor-pointer transition-all duration-300"
            onClick={() => handleZoneClick('grip')}
            onMouseEnter={() => handleMouseEnter('grip')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grip Shaft Base / Collar */}
            <path
              d="M 204 585 L 236 585 L 238 608 L 202 608 Z"
              fill={isGripActive ? '#1F2A0E' : '#141620'}
              stroke={isGripActive ? '#CCFF00' : '#2A2F40'}
              strokeWidth="1.5"
            />

            {/* Finishing Tape Ring with Neon Court Stripe */}
            <rect
              x="200"
              y="608"
              width="40"
              height="16"
              rx="2"
              fill="#090A0F"
              stroke={isGripActive ? '#CCFF00' : '#2F364A'}
              strokeWidth={isGripActive ? '2' : '1.2'}
            />
            <line
              x1="202"
              y1="616"
              x2="238"
              y2="616"
              stroke="#CCFF00"
              strokeWidth="2.5"
              filter={isGripActive ? 'url(#softGlow)' : undefined}
            />

            {/* Handle Body (Octagonal Contour) */}
            <path
              d="M 200 624 L 240 624 L 244 875 L 196 875 Z"
              fill="url(#neonGripWrap)"
              stroke={isGripActive ? '#CCFF00' : '#2B3142'}
              strokeWidth={isGripActive ? '2' : '1.5'}
              filter={isGripActive ? 'url(#softGlow)' : undefined}
              className="transition-all duration-300"
            />

            {/* Octagonal Bevel Longitudinal Shading Lines */}
            <line x1="211" y1="624" x2="209" y2="875" stroke="#10121A" strokeWidth="2" />
            <line x1="229" y1="624" x2="231" y2="875" stroke="#3A4055" strokeWidth="1.5" opacity="0.7" />

            {/* Grip Wrap Textures (Spiral Overgrip Ribbons) */}
            {[
              { y1: 636, y2: 654 },
              { y1: 656, y2: 676 },
              { y1: 678, y2: 700 },
              { y1: 702, y2: 726 },
              { y1: 728, y2: 752 },
              { y1: 754, y2: 780 },
              { y1: 782, y2: 808 },
              { y1: 810, y2: 836 },
              { y1: 838, y2: 864 },
            ].map((wrap, idx) => (
              <g key={`wrap-${idx}`}>
                <path
                  d={`M 199 ${wrap.y1} L 241 ${wrap.y2}`}
                  stroke={isGripActive ? '#CCFF00' : '#3E465D'}
                  strokeWidth={isGripActive ? '2.5' : '1.8'}
                  strokeLinecap="round"
                  className="transition-colors duration-200"
                />
                {/* Perforation holes on grip wrap */}
                <circle cx={214} cy={(wrap.y1 + wrap.y2) / 2} r="1.2" fill={isGripActive ? '#CCFF00' : '#171922'} />
                <circle cx={226} cy={(wrap.y1 + wrap.y2) / 2} r="1.2" fill={isGripActive ? '#CCFF00' : '#171922'} />
              </g>
            ))}

            {/* Flared Butt Cap */}
            <path
              d="M 194 875 L 246 875 L 250 895 L 190 895 Z"
              fill={isGripActive ? '#2B3B0C' : '#12141C'}
              stroke={isGripActive ? '#CCFF00' : '#394056'}
              strokeWidth={isGripActive ? '2' : '1.5'}
              className="transition-all duration-300"
            />
            {/* Butt Cap Trapdoor / Logo Emblem */}
            <rect
              x="208"
              y="880"
              width="24"
              height="10"
              rx="2"
              fill="#090A0F"
              stroke={isGripActive ? '#CCFF00' : '#2B3142'}
              strokeWidth="1"
            />
            <text
              x="220"
              y="888"
              textAnchor="middle"
              fill={isGripActive ? '#CCFF00' : '#8A92A6'}
              fontSize="6"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              OK • 4 3/8
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
