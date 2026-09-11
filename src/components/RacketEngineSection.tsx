import React, { useState } from 'react';
import { RacketZone } from '../types';
import { RacketCanvas } from './RacketCanvas';
import { RotateCw, ArrowRight } from 'lucide-react';
import { playTennisPop } from '../utils/audio';
import { RacketZoneModal } from './RacketZoneModal';

interface RacketEngineSectionProps {
  onNavigateToProjects?: (zone: RacketZone) => void;
}

export const RacketEngineSection: React.FC<RacketEngineSectionProps> = () => {
  const [activeZone, setActiveZone] = useState<RacketZone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<RacketZone | null>(null);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isZoneZooming, setIsZoneZooming] = useState<boolean>(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);

  const handleZoneSelect = (zone: RacketZone) => {
    setActiveZone(zone);
    playTennisPop(
      zone === 'sweetSpot'
        ? 640
        : zone === 'strings'
        ? 520
        : zone === 'dampener'
        ? 480
        : zone === 'frame'
        ? 440
        : 380
    );

    const courtEl = document.getElementById('court-engine');
    if (courtEl) {
      courtEl.scrollIntoView({ behavior: 'smooth' });
    }

    setIsZoneZooming(true);
    setIsZoneModalOpen(true);
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalOpen(false);
    setIsZoneZooming(false);
    setActiveZone(null);
    playTennisPop(440);
  };

  const handleResetCamera = () => {
    setResetKey((prev) => prev + 1);
    setActiveZone(null);
    setIsZoneZooming(false);
    setIsZoneModalOpen(false);
    playTennisPop(480);
  };

  const zoneNames: Record<RacketZone, string> = {
    sweetSpot: 'The Sweet Spot',
    strings: 'The Strings',
    dampener: 'The Vibration Dampener',
    frame: 'The Frame',
    grip: 'The Grip',
  };

  return (
    <section
      id="court-engine"
      data-engine="racket-engine"
      className="relative w-full h-screen min-h-[700px] bg-[#161513] text-[#F6F3ED] flex flex-col justify-between overflow-hidden border-t border-[#E6DECE]/10 select-none"
    >
      <div id="racket-engine" className="absolute -top-12 left-0 pointer-events-none" />

      {/* Ambient Warm Court Lighting */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#C8A462]/[0.035] blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[#C27351]/[0.02] blur-[160px] pointer-events-none" />

      {/* 3D Canvas Stage: Fills entire screen with 0 clutter */}
      <div className="absolute inset-0 w-full h-full">
        <RacketCanvas
          activeZone={activeZone}
          onSelectZone={handleZoneSelect}
          hoveredZone={hoveredZone}
          onHoverZone={setHoveredZone}
          enableOrbit={!isZoneZooming}
          isMacroZoom={isZoneZooming}
          resetTrigger={resetKey}
        />
      </div>

      {/* Discreet Camera Reset Icon (Bottom Left) - Hidden when zone experience is active */}
      {!isZoneModalOpen && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-auto flex items-center space-x-3">
          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-full warm-panel-subtle hover:bg-[#25231F] border border-[#E6DECE]/15 hover:border-[#C8A462]/40 text-[#A8A294] hover:text-[#C8A462] transition-colors cursor-pointer"
            title="Reset 3D Camera"
            aria-label="Reset 3D camera"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Hint at Bottom Center - Hidden when zone experience is active */}
      {!isZoneModalOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto text-center px-4 max-w-md w-full">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full warm-panel border border-[#E6DECE]/10 shadow-lg text-xs font-mono text-[#A8A294]">
            <span className="w-2 h-2 rounded-full bg-[#C8A462]" />
            <span>
              {hoveredZone
                ? `Click to view ${zoneNames[hoveredZone]}`
                : 'Select any part of the racket to explore'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C8A462]" />
          </div>
        </div>
      )}

      {/* Full-Screen Racket Zone Experience (Cinematic View into Downward Projects Flow) */}
      <RacketZoneModal
        isOpen={isZoneModalOpen}
        zone={activeZone}
        onClose={handleCloseZoneModal}
      />
    </section>
  );
};
