import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Video, VideoOff } from 'lucide-react';
import { playTennisPop } from '../utils/audio';
import { getUserVideo } from '../utils/videoStorage';

export const HeroSection: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('hero_video_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize: load stored user video or check static asset
  useEffect(() => {
    let active = true;

    async function loadInitialVideo() {
      // 1. Check IndexedDB for existing video
      const storedBlob = await getUserVideo();
      if (storedBlob && active) {
        const url = URL.createObjectURL(storedBlob);
        setVideoSrc(url);
        return;
      }

      // 2. Check if a local video asset was provided in public/
      const possiblePaths = [
        '/IMG_0904.MOV',
        '/assets/video.mp4',
        '/assets/nostalgic-tennis.mp4',
        '/assets/tennis.mp4',
      ];
      for (const path of possiblePaths) {
        try {
          const res = await fetch(path, { method: 'HEAD' });
          if (res.ok && active) {
            setVideoSrc(path);
            return;
          }
        } catch {
          // Continue checking
        }
      }
    }

    loadInitialVideo();

    return () => {
      active = false;
    };
  }, []);

  // Handle play / pause based on isVideoEnabled and source readiness
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoEnabled && videoSrc) {
        videoRef.current.play().catch(() => {
          // Handle muted autoplay policies smoothly
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoEnabled, videoSrc]);

  const toggleVideo = () => {
    const nextState = !isVideoEnabled;
    setIsVideoEnabled(nextState);
    localStorage.setItem('hero_video_enabled', String(nextState));
    playTennisPop(nextState ? 640 : 420);
  };

  const scrollToCourt = () => {
    playTennisPop(560);
    const element = document.getElementById('court-engine');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#161513] text-[#F6F3ED] overflow-hidden select-none"
    >
      {/* ========================================================= */}
      {/* NOSTALGIC BACKGROUND VIDEO OVERLAY */}
      {/* ========================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {videoSrc ? (
          <video
            ref={videoRef}
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => {
              if (isVideoEnabled) {
                videoRef.current?.play().catch(() => {});
              }
            }}
            onCanPlay={(e) => {
              if (isVideoEnabled) {
                e.currentTarget.play().catch(() => {});
              }
            }}
            className={`w-full h-full object-cover nostalgic-film-filter scale-105 transform motion-safe:transition-opacity duration-700 ${
              isVideoEnabled ? 'opacity-35' : 'opacity-0'
            }`}
          >
            <source src={videoSrc} />
          </video>
        ) : (
          /* Subtle ambient tone */
          <div className="w-full h-full bg-[#161513]" />
        )}

        {/* Vintage Vignette & Radial Darkening */}
        <div className="absolute inset-0 nostalgic-vignette" />

        {/* Subtle Analog Scanlines */}
        <div className="absolute inset-0 scanlines opacity-25" />

        {/* Warm Ambient Texture Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#C8A462]/[0.04] blur-[160px]" />

        {/* Bottom Fade: Seamlessly dissolves into the racket canvas below */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#161513]/70 to-[#161513]" />
      </div>

      {/* Top Bar Video Control: On / Off Toggle */}
      <div className="absolute top-8 left-0 right-0 max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-end z-20">
        <button
          id="toggle-video-btn"
          onClick={toggleVideo}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full warm-panel-subtle hover:bg-[#25231F] border border-[#E6DECE]/10 hover:border-[#C8A462]/40 text-[#A8A294] hover:text-[#F6F3ED] transition-all cursor-pointer pointer-events-auto shadow-sm"
          title={isVideoEnabled ? 'Turn video background off' : 'Turn video background on'}
          aria-label={isVideoEnabled ? 'Turn video background off' : 'Turn video background on'}
        >
          {isVideoEnabled ? (
            <>
              <Video className="w-3.5 h-3.5 text-[#C8A462]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#DDD8CE]">Video On</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A462] animate-pulse" />
            </>
          ) : (
            <>
              <VideoOff className="w-3.5 h-3.5 text-[#7E786C]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8478]">Video Off</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#444039]" />
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT HERO: "Hi, I'm Owen." */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 flex flex-col items-center justify-center text-center pt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Main Headline: "Hi, I'm Owen." */}
          <h1 className="text-[13vw] sm:text-[10vw] md:text-[8.5vw] font-serif font-medium tracking-tight text-[#F6F3ED] leading-[0.95] drop-shadow-sm">
            Hi, I'm Owen.
          </h1>

          {/* Subheading: "explore who I am through a tennis racket" */}
          <p className="mt-5 sm:mt-7 text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-[#C8C2B3] max-w-2xl leading-relaxed">
            explore who I am through a tennis racket
          </p>

          {/* Downward Animating Arrows (No button, no "scroll down" text) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            onClick={scrollToCourt}
            id="scroll-to-racket-btn"
            className="mt-16 sm:mt-20 flex flex-col items-center cursor-pointer pointer-events-auto group py-3"
            title="Scroll to explore racket"
          >
            <div className="flex flex-col items-center -space-y-2.5">
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  opacity: [0.3, 0.85, 0.3],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ChevronDown className="w-5 h-5 text-[#C8A462]/60 group-hover:text-[#C8A462] transition-colors" />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  opacity: [0.55, 1, 0.55],
                  }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.22,
                }}
              >
                <ChevronDown className="w-6 h-6 text-[#C8A462] group-hover:text-[#D6B575] transition-colors" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
