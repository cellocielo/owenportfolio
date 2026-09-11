import React from 'react';
import { RacketZoneModal } from './RacketZoneModal';
import { RacketZone } from '../types';

interface VibrationDampenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: RacketZone;
  initialSlide?: number;
  initialMode?: 'cinematic' | 'interests';
}

export const VibrationDampenerModal: React.FC<VibrationDampenerModalProps> = ({
  isOpen,
  onClose,
  zone = 'dampener',
  initialSlide = 0,
  initialMode = 'cinematic',
}) => {
  return (
    <RacketZoneModal
      isOpen={isOpen}
      zone={zone}
      onClose={onClose}
      initialSlide={initialSlide}
      initialMode={initialMode}
    />
  );
};
