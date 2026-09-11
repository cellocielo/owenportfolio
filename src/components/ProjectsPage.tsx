import React from 'react';
import { RacketZone, ProjectHighlight } from '../types';
import { RacketZoneModal } from './RacketZoneModal';

interface ProjectsPageProps {
  initialZone: RacketZone;
  onBackToRacket: () => void;
  onSelectProjectModal?: (project: ProjectHighlight) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  initialZone,
  onBackToRacket,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#161513]">
      {/* 
        NO Top Nav Bar: As requested by the user, the nav bar at the top has been removed.
        The only option to explore another part of the racket is by clicking 'Back to Racket' first.
      */}
      <RacketZoneModal
        isOpen={true}
        zone={initialZone}
        onClose={onBackToRacket}
      />
    </div>
  );
};
