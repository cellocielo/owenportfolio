import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowDown, ArrowRight } from 'lucide-react';
import { playTennisPop } from '../utils/audio';

interface HeroSequenceProps {
  onEnterCourt: () => void;
}

export const HeroSequence: React.FC<HeroSequenceProps> = ({ onEnterCourt }) => {
  const [stage, setStage] = useState<1 | 2>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.45;
      if (scrollY > threshold) {
        setStage(2);
      } else {
        setStage(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNextStage = () => {
    playTennisPop(540);
    setStage(2);
    // Smoothly scroll slightly to trigger stage 2 if using scroll
    window.scrollTo({
      top: window.innerHeight * 0.75,
      behavior: 'smooth',
    });
  };

  const handleEnterCourt = () => {
    playTennisPop(620);
    onEnterCourt();
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[180vh] bg-[#07080C] text-[#FAFAFA]"
    >
      {/* Sticky Fullscreen Viewport for Screen-Filling Sequence */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-8">
        {/* Subtle Architectural Court Lines in Ambient Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full max-w-7xl max-h-[850px]"
            fill="none"
            stroke="#CCFF00"
            strokeWidth="1.5"
          >
            <rect x="80" y="60" width="840" height="580" />
            <line x1="80" y1="350" x2="920" y2="350" strokeWidth="2" />
            <line x1="200" y1="60" x2="200" y2="640" />
            <line x1="800" y1="60" x2="800" y2="640" />
            <line x1="200" y1="205" x2="800" y2="205" />
            <line x1="200" y1="495" x2="800" y2="495" />
            <line x1="500" y1="205" x2="500" y2="495" />
          </svg>
        </div>

        {/* Ambient Obsidian Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#CCFF00]/[0.03] blur-[160px] pointer-events-none" />

        {/* Top Progress & Stage Indicators */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
          <button
            onClick={() => {
              setStage(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              stage === 1 ? 'w-10 bg-[#CCFF00]' : 'w-3 bg-[#262B3D] hover:bg-[#3E455E]'
            }`}
            aria-label="Stage 1"
          />
          <button
            onClick={handleNextStage}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              stage === 2 ? 'w-10 bg-[#CCFF00]' : 'w-3 bg-[#262B3D] hover:bg-[#3E455E]'
            }`}
            aria-label="Stage 2"
          />
        </div>

        {/* Sequence Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {stage === 1 ? (
              /* ========================================================= */
              /* STAGE 1: Full-Screen Screen-Filling Text (9vw-11vw / 4vw-5vw) */
              /* ========================================================= */
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center w-full"
              >
                {/* Subtle Editorial Pre-label */}
                <div className="mb-4 sm:mb-6 inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#121520] border border-[#22283B]">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                  <span className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">
                    UCLA CS & Linguistics
                  </span>
                </div>

                {/* Main H1 (Huge, screen-filling 9vw-11vw font): "Hi, I'm Owen." */}
                <h1 className="text-[12vw] sm:text-[10vw] md:text-[9.5vw] font-bold tracking-tight text-[#FAFAFA] leading-[0.95] select-none">
                  Hi, I'm Owen.
                </h1>

                {/* Sub-headline (Muted Grey, 4vw-5vw): "Builder, Researcher, Tennis Player." */}
                <h2 className="mt-4 sm:mt-6 text-[5vw] sm:text-[4.2vw] md:text-[3.8vw] font-normal tracking-tight text-[#A1A1AA] leading-tight select-none">
                  Builder, Researcher, Tennis Player.
                </h2>

                {/* Call-to-Action / Advance button */}
                <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleNextStage}
                    id="stage-1-advance-btn"
                    className="group px-7 py-3.5 rounded-full bg-[#FAFAFA] text-[#07080C] font-semibold text-sm sm:text-base tracking-tight hover:bg-[#CCFF00] hover:shadow-[0_0_25px_rgba(204,255,0,0.4)] transition-all duration-200 cursor-pointer flex items-center space-x-2"
                  >
                    <span>View Product Philosophy</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleEnterCourt}
                    className="text-xs sm:text-sm font-mono text-[#A1A1AA] hover:text-[#CCFF00] transition-colors py-2 px-4 cursor-pointer"
                  >
                    Skip to 3D Racket Engine →
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ========================================================= */
              /* STAGE 2: Slide into Viewport Statement + Enter Court CTA */
              /* ========================================================= */
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center w-full max-w-5xl px-4"
              >
                {/* Court Strategy Tag */}
                <div className="mb-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#121622] border border-[#232B40]">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#CCFF00]">
                    Match Strategy ↔ Product Management
                  </span>
                </div>

                {/* Stage 2 Typography Quote */}
                <blockquote className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#FAFAFA] leading-[1.25] text-center max-w-4xl">
                  "I view product management like a tennis match—balancing{' '}
                  <span className="text-[#CCFF00] underline decoration-[#CCFF00]/40 underline-offset-8">
                    technical structure
                  </span>
                  ,{' '}
                  <span className="text-[#FAFAFA] italic font-serif">strategic tension</span>
                  , and{' '}
                  <span className="text-[#CCFF00]">high-impact execution</span>."
                </blockquote>

                <p className="mt-8 text-sm sm:text-base text-[#A1A1AA] max-w-2xl text-center leading-relaxed">
                  From founding a $46k community tennis enterprise to Level 3 autonomous vehicle research and AI design workflows at UCSC.
                </p>

                {/* Call to Action: "Scroll to enter the court" */}
                <div className="mt-10 flex flex-col items-center space-y-3">
                  <button
                    onClick={handleEnterCourt}
                    id="cta-enter-court"
                    className="group inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-[#CCFF00] text-[#07080C] font-bold text-base tracking-tight hover:bg-[#D4FF33] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-200 cursor-pointer"
                  >
                    <span>Scroll to enter the court</span>
                    <ArrowDown className="w-4 h-4 transform group-hover:translate-y-1 transition-transform" />
                  </button>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#A1A1AA]/70">
                    Interact with the 3D Tennis Racket Engine
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle Bouncing Scroll Indicator at bottom */}
        <div
          onClick={stage === 1 ? handleNextStage : handleEnterCourt}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer text-[#A1A1AA] hover:text-[#CCFF00] transition-colors"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest mb-1 opacity-70">
            {stage === 1 ? 'Scroll down' : 'Enter 3D Court'}
          </span>
          <div className="animate-bounce">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};
