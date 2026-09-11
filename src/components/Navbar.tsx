import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mail, FileText } from 'lucide-react';
import { toggleAudioMute, getAudioStatus, playTennisPop } from '../utils/audio';

interface NavbarProps {
  onOpenResumeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenResumeModal }) => {
  const [audioActive, setAudioActive] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setAudioActive(getAudioStatus());
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleAudio = () => {
    const next = toggleAudioMute();
    setAudioActive(next);
    if (next) {
      playTennisPop(580);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-panel border-b border-white/10 py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-2.5 group cursor-pointer text-left"
        >
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]" />
          <span className="font-extrabold text-xs sm:text-sm tracking-[0.2em] text-[#FAFAFA] uppercase group-hover:text-[#CCFF00] transition-colors">
            Owen Kim
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-[0.2em] font-medium text-[#A1A1AA]">
          <button
            onClick={() => scrollToSection('racket-engine')}
            className="hover:text-[#CCFF00] transition-colors cursor-pointer"
          >
            Racket Engine
          </button>
          <button
            onClick={() => scrollToSection('philosophy-section')}
            className="hover:text-[#CCFF00] transition-colors cursor-pointer"
          >
            Court Strategy
          </button>
          {onOpenResumeModal && (
            <button
              onClick={onOpenResumeModal}
              className="hover:text-[#CCFF00] transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Audio Haptic Toggle */}
          <button
            onClick={handleToggleAudio}
            title={audioActive ? 'Mute Tennis Sound FX' : 'Enable Tennis Sound FX'}
            aria-label="Toggle tennis interaction sounds"
            className="p-2 rounded-lg glass-panel-subtle hover:glass-panel border border-white/10 text-[#A1A1AA] hover:text-[#CCFF00] transition-colors cursor-pointer"
          >
            {audioActive ? (
              <Volume2 className="w-4 h-4 text-[#CCFF00]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#A1A1AA]" />
            )}
          </button>

          {/* Quick Email Contact */}
          <a
            href="mailto:owenkim2k8@ucla.edu"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#CCFF00] text-[#090A0F] hover:bg-[#D4FF33] neon-court-glow transition-all cursor-pointer tracking-wider uppercase text-[11px]"
          >
            <Mail className="w-3.5 h-3.5 text-[#090A0F]" />
            <span className="hidden sm:inline">Contact</span>
          </a>
        </div>
      </div>
    </header>
  );
};
