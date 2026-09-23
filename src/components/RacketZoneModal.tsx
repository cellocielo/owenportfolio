import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Video,
  ArrowUpRight,
  BookOpen,
  Play,
  Pause,
  Sparkles
} from 'lucide-react';
import { RacketZone } from '../types';
import { portfolioData } from '../data/portfolioData';
import { playTennisPop } from '../utils/audio';
import { getCustomImage } from '../utils/imageStorage';
import {
  getCustomLink,
  DEFAULT_LINKS,
  getSlideLinkKey,
  isSlideLinkDisabled
} from '../utils/linkStorage';
import { AuditoryFrameworkPaperModal } from './AuditoryFrameworkPaperModal';

interface RacketZoneModalProps {
  isOpen: boolean;
  zone: RacketZone | null;
  onClose: () => void;
  initialSlide?: number;
  initialMode?: 'cinematic' | 'interests';
}

export const RacketZoneModal: React.FC<RacketZoneModalProps> = ({
  isOpen,
  zone,
  onClose,
  initialSlide = 0,
  initialMode = 'cinematic',
}) => {
  const [viewMode, setViewMode] = useState<'cinematic' | 'interests'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState<number>(initialSlide);
  const [direction, setDirection] = useState<number>(1); // 1 = down, -1 = up
  const [isFirstEntry, setIsFirstEntry] = useState<boolean>(true);
  const [tennisImgIndex, setTennisImgIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Academic paper reading modal state
  const [isPaperModalOpen, setIsPaperModalOpen] = useState<boolean>(false);

  // Video playback & framing controls
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [natureVideoError, setNatureVideoError] = useState<boolean>(false);
  const natureVideoRef = useRef<HTMLVideoElement | null>(null);
  const generalVideoRef = useRef<HTMLVideoElement | null>(null);

  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  const currentZoneKey = zone || 'dampener';
  const zoneData = portfolioData[currentZoneKey];
  const slides = zoneData?.projects || [];

  // Reset state when modal opens or zone changes
  useEffect(() => {
    if (isOpen && zone) {
      setViewMode(initialMode);
      setCurrentIndex(initialSlide);
      setDirection(1);
      setIsFirstEntry(true);
      setTennisImgIndex(0);
      setNatureVideoError(false);
      playTennisPop(480);
    }
  }, [isOpen, zone, initialSlide, initialMode]);

  // Preload and hardware-decode available slide images into browser memory
  useEffect(() => {
    slides.forEach((slide) => {
      slide.images?.forEach((img) => {
        if (img.imageUrl && !img.isVideo) {
          const preloadImg = new Image();
          preloadImg.src = img.imageUrl;
          if ('decode' in preloadImg) {
            preloadImg.decode().catch(() => {});
          }
        }
      });
    });
  }, [slides]);

  // Reset tennis image index & video error whenever slide changes
  useEffect(() => {
    setTennisImgIndex(0);
    setNatureVideoError(false);
  }, [currentIndex]);

  // Alternate between tennis images smoothly every 5 seconds when on "Playing Tennis"
  useEffect(() => {
    if (!isOpen || viewMode !== 'interests') return;

    const currentSlide = slides[currentIndex];
    const isTennisSlide = currentSlide?.name?.toLowerCase().includes('tennis');
    const tennisImages = currentSlide?.images || [];

    if (isTennisSlide && tennisImages.length > 1) {
      const interval = setInterval(() => {
        setTennisImgIndex((prev) => (prev + 1) % tennisImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOpen, viewMode, currentIndex, slides]);

  const handleGoToFirstInterest = () => {
    setIsFirstEntry(true);
    setDirection(1);
    setViewMode('interests');
    setCurrentIndex(0);
    playTennisPop(540);
  };

  const handleNext = () => {
    setIsFirstEntry(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    playTennisPop(560);
  };

  const handlePrev = () => {
    setIsFirstEntry(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    playTennisPop(460);
  };

  // Keyboard navigation & Wheel scrolling (intercept background scrolling)
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTime.current < 650) return;

      if (e.deltaY > 20) {
        lastWheelTime.current = now;
        if (viewMode === 'cinematic') {
          handleGoToFirstInterest();
        } else {
          handleNext();
        }
      } else if (e.deltaY < -20) {
        lastWheelTime.current = now;
        if (viewMode === 'interests') {
          handlePrev();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          if (viewMode === 'cinematic') {
            handleGoToFirstInterest();
          } else {
            handleNext();
          }
        } else {
          if (viewMode === 'interests') {
            handlePrev();
          }
        }
      }
      touchStartY.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === ' ' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Enter' || e.key === ' ') {
        if (viewMode === 'cinematic') {
          handleGoToFirstInterest();
        } else {
          handleNext();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (viewMode === 'interests') {
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        if (viewMode === 'cinematic') {
          handleGoToFirstInterest();
        } else {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'interests') {
          handlePrev();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, viewMode, currentIndex, slides.length]);

  const currentSlide = slides[currentIndex];
  const availableImages = currentSlide?.images || [];
  const defaultActiveImage = availableImages[0];

  // Check if current slide is Nature-Based Recreational Apps
  const isNatureBasedSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('nature') ||
    currentSlide?.name?.toLowerCase().includes('recreation') ||
    currentSlide?.id?.includes('nature') ||
    currentSlide?.badge?.toLowerCase().includes('friction') ||
    currentSlide?.badge?.toLowerCase().includes('eco')
  );

  // Resolve custom user image or video from permanent storage
  const customSavedImage = (!isNatureBasedSlide && currentSlide)
    ? getCustomImage(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id)
    : null;

  // Nature-Based slide strictly plays Nature App Video
  const activeImageUrl = isNatureBasedSlide
    ? '/nature_app_video.mp4'
    : ((customSavedImage && customSavedImage.trim().length > 0)
        ? customSavedImage
        : (defaultActiveImage?.imageUrl || ''));

  const isSpritzSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('spritz') ||
    activeImageUrl?.toLowerCase().includes('spritz')
  );

  const isOperationalSlide = Boolean(
    currentSlide?.id === 'tft-scaling' ||
    currentSlide?.summary?.toLowerCase().includes('operational procedures')
  );

  const getSlideObjectPosition = (imgUrl?: string, customPos?: string) => {
    if (customPos) return customPos;
    if (defaultActiveImage?.objectPosition) return defaultActiveImage.objectPosition;
    const url = (imgUrl || activeImageUrl || '').toLowerCase();
    if (url.includes('dsc00474') || defaultActiveImage?.id === 'tennis-img-1') return 'center 28%';
    if (url.includes('img_3371') || currentSlide?.id === 'tft-teaching') return 'center 68%';
    if (
      url.includes('starter') ||
      url.includes('guide') ||
      currentSlide?.id === 'tft-operations' ||
      currentSlide?.id === 'tft-starter-guide'
    ) {
      return 'right 12%';
    }
    if (url.includes('img_1586')) return 'center 24%';
    if (
      url.includes('oakpickupimage2') ||
      currentSlide?.id === 'tft-scaling'
    ) {
      return 'center 30%';
    }
    return 'center center';
  };

  // Parse potential YouTube or Vimeo URL for ambient background video streaming
  const youtubeMatch = activeImageUrl
    ? activeImageUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i)
    : null;
  const youtubeId = youtubeMatch ? youtubeMatch[1] : null;

  const vimeoMatch = activeImageUrl
    ? activeImageUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:$|\/|\?)/i)
    : null;
  const vimeoId = vimeoMatch ? vimeoMatch[2] : null;

  const isVideo =
    isNatureBasedSlide ||
    Boolean(youtubeId) ||
    Boolean(vimeoId) ||
    Boolean(defaultActiveImage?.isVideo || /\.(mp4|mov|webm|m4v|ogv)(\?.*)?$/i.test(activeImageUrl));

  // Ensure video reliably autoplays without being blocked by browser autoplay policies
  useEffect(() => {
    if (natureVideoRef.current && isVideo) {
      natureVideoRef.current.defaultMuted = true;
      natureVideoRef.current.muted = isMuted;
      const playPromise = natureVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsVideoPlaying(true);
        }).catch(() => {
          if (natureVideoRef.current) {
            natureVideoRef.current.muted = true;
            natureVideoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
          }
        });
      }
    }
    if (generalVideoRef.current && isVideo) {
      generalVideoRef.current.defaultMuted = true;
      generalVideoRef.current.muted = isMuted;
      const playPromise = generalVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (generalVideoRef.current) {
            generalVideoRef.current.muted = true;
            generalVideoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [currentIndex, currentZoneKey, isVideo, isMuted, activeImageUrl]);

  // Toggle video play/pause
  const handleTogglePlayVideo = () => {
    if (!natureVideoRef.current) return;
    if (natureVideoRef.current.paused) {
      natureVideoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      natureVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  // Check if destination link is disabled for this slide
  const isLinkDisabled = currentSlide
    ? isSlideLinkDisabled(currentZoneKey, currentSlide.name, currentSlide.id)
    : false;

  // Resolve destination link for slide title (built-in default link or slide data link)
  const activeLink = (!isLinkDisabled && currentSlide)
    ? (currentSlide.link ||
       currentSlide.url ||
       getCustomLink(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id) ||
       DEFAULT_LINKS[getSlideLinkKey(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id)] ||
       DEFAULT_LINKS[getSlideLinkKey(currentZoneKey, currentSlide.name)] ||
       '')
    : '';

  // Check if current slide is L3 AV Auditory Framework paper slide
  const isAvPaperSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('auditory framework') ||
    currentSlide?.id?.includes('av')
  );

  // Slide transition variants: smooth fade for first entrance from cinematic, spring slide between interests
  const slideVariants: Variants = {
    enter: (dir: number) => {
      if (isFirstEntry) {
        return {
          y: '0%',
          scale: 1.03,
          opacity: 0,
          filter: 'blur(4px) brightness(0.9)',
        };
      }
      return {
        y: dir > 0 ? '100%' : '-100%',
        scale: 1.05,
        opacity: 0,
        filter: 'blur(8px) brightness(0.7)',
      };
    },
    center: {
      y: '0%',
      scale: 1,
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      transition: {
        y: isFirstEntry 
          ? { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
          : { type: 'spring' as const, stiffness: 220, damping: 28, mass: 0.85 },
        scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? '-100%' : '100%',
      scale: 0.94,
      opacity: 0,
      filter: 'blur(8px) brightness(0.5)',
      transition: {
        y: { type: 'spring' as const, stiffness: 220, damping: 28, mass: 0.85 },
        scale: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.55 },
      },
    }),
  };

  if (!isOpen || !zone) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`racket-zone-experience-${currentZoneKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 select-none overflow-hidden flex flex-col bg-transparent"
      >

        {/* ============================================================ */}
        {/* CINEMATIC MODE: Macro Zoom View over 3D Tennis Racket       */}
        {/* Crisp while zooming in; dims down once fully zoomed in       */}
        {/* Title, Metaphor & Downward arrows                           */}
        {/* ============================================================ */}
        {viewMode === 'cinematic' ? (
          <motion.div
            key="cinematic-metaphor-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -45 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 md:p-16 overflow-hidden"
          >
            {/* Subtle baseline vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Dimming layer: Fades in only once camera is fully zoomed in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-black/75 backdrop-blur-[3px] pointer-events-none"
            />

            {/* Top Navigation: ONLY Back to Racket (No top nav bar) */}
            <header className="relative z-20 w-full flex items-center justify-between">
              <div />

              <button
                onClick={onClose}
                id="close-zone-cinematic"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-[#E6DECE] hover:text-white transition-all duration-300 text-xs font-mono tracking-wider cursor-pointer border border-white/10 backdrop-blur-sm shadow-md"
              >
                <span>← Back to Racket</span>
              </button>
            </header>

            {/* Center Content: Title, Metaphor & Downward Arrows */}
            <div className="relative z-20 max-w-3xl mx-auto w-full text-center flex flex-col items-center my-auto px-4">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 1.85, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#F6F3ED] leading-tight mb-8 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              >
                {zoneData?.title || 'Racket Zone'}
              </motion.h1>

              {/* Metaphor text with NO quotation marks */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 2.15, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-xl md:text-2xl text-[#E6DECE] font-sans leading-relaxed tracking-wide mb-12 max-w-2xl drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]"
              >
                {zoneData?.metaphor}
              </motion.p>

              {/* Downward Flow Trigger: Animated Downward Arrows */}
              <motion.button
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 2.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleGoToFirstInterest}
                id="zone-down-button"
                className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-full bg-[#C8A462]/15 hover:bg-[#C8A462] border border-[#C8A462]/40 hover:border-[#C8A462] text-[#E6DECE] hover:text-[#141311] transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(200,164,98,0.3)] hover:shadow-[0_0_40px_rgba(200,164,98,0.7)]"
                aria-label="Descend to explore projects"
                title="Explore Projects"
              >
                <div className="flex flex-col items-center -space-y-1.5 transition-transform group-hover:translate-y-0.5">
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronDown className="w-7 h-7" strokeWidth={2.2} />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="opacity-50 group-hover:opacity-90"
                  >
                    <ChevronDown className="w-5 h-5 -mt-2" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.button>
            </div>

            {/* Bottom spacer */}
            <div className="relative z-20 w-full h-4" />
          </motion.div>
        ) : (
          /* ============================================================ */
          /* INTERESTS/PROJECTS MODE: Full-Bleed Media with Downward Flow */
          /* Smooth, seamless entrance on first reveal                     */
          /* Locked typography coordinates with zero arrow overlap         */
          /* Permanent Image Input Capability on every slide               */
          /* ============================================================ */
          <motion.div
            key="interests-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full overflow-hidden bg-[#0C0B0A]"
          >
            {/* Minimal Top Bar: ONLY Back to Racket & Audio Toggle */}
            <header className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-none">
              {/* Left Control Spacer */}
              <div className="pointer-events-auto flex items-center space-x-2" />

              {/* Right Control: Audio mute toggle & Back to Racket */}
              <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">

                {isVideo && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-[#D4CEBF] hover:text-white transition-all duration-300 border border-white/10 backdrop-blur-md cursor-pointer shadow-md"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label="Toggle audio"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#C8A462]" />}
                  </button>
                )}

                <button
                  onClick={onClose}
                  id="close-interests-view"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-[#D4CEBF] hover:text-white transition-all duration-300 text-xs font-mono border border-white/10 backdrop-blur-md cursor-pointer shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Back to Racket</span>
                </button>
              </div>
            </header>

            {/* Downward Kinetic Slide Transition */}
            <AnimatePresence custom={direction} mode="sync">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full overflow-hidden"
              >
                {/* Full-Bleed Media Layer with smooth Ken Burns parallax */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0C0B0A]">
                  <motion.div
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    {youtubeId ? (
                      <div className="w-full h-full relative overflow-hidden pointer-events-none">
                        <iframe
                          key={`yt-${youtubeId}-${isMuted}`}
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
                          className="w-[140%] h-[140%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          tabIndex={-1}
                        />
                      </div>
                    ) : vimeoId ? (
                      <div className="w-full h-full relative overflow-hidden pointer-events-none">
                        <iframe
                          key={`vimeo-${vimeoId}-${isMuted}`}
                          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=${isMuted ? 1 : 0}&loop=1&background=1&autopause=0`}
                          className="w-[140%] h-[140%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
                          allow="autoplay; fullscreen; picture-in-picture"
                          tabIndex={-1}
                        />
                      </div>
                    ) : isVideo ? (
                      isNatureBasedSlide ? (
                        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#0C0B0A]">
                          {/* Centered Demo Video Layer: strictly plays Nature App Video, or left blank if it fails */}
                          {!natureVideoError ? (
                            <div className="w-full h-full flex items-center justify-center p-0">
                              <div className="relative flex items-center justify-center w-full h-full">
                                <video
                                  ref={natureVideoRef}
                                  key="nature-video-nature-app"
                                  autoPlay
                                  loop
                                  muted={isMuted}
                                  playsInline
                                  preload="auto"
                                  onLoadedData={(e) => {
                                    setNatureVideoError(false);
                                    e.currentTarget.play().catch(() => {});
                                  }}
                                  onError={() => {
                                    setNatureVideoError(true);
                                  }}
                                  onClick={handleTogglePlayVideo}
                                  className="w-full h-full object-cover cursor-pointer opacity-100 transition-opacity duration-300"
                                  style={{ objectPosition: 'center center' }}
                                >
                                  <source src="/nature_app_video.mp4" type="video/mp4" />
                                  <source src="/nature_app_video.mov" type="video/quicktime" />
                                  <source src="/nature app video.mov" type="video/quicktime" />
                                  <source src="/nature%20app%20video.mov" type="video/quicktime" onError={() => setNatureVideoError(true)} />
                                </video>

                                {/* Interactive Play/Pause button when video is paused */}
                                {!isVideoPlaying && (
                                  <button
                                    onClick={handleTogglePlayVideo}
                                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/75 border border-[#C8A462]/60 text-[#C8A462] flex items-center justify-center backdrop-blur-md shadow-2xl hover:scale-110 transition-transform cursor-pointer z-30"
                                    title="Play Video"
                                  >
                                    <Play className="w-7 h-7 fill-current ml-1" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Left completely blank if video does not work — never fallback to tennis video */
                            <div className="w-full h-full bg-[#0C0B0A]" />
                          )}
                        </div>
                      ) : (
                        <video
                          ref={generalVideoRef}
                          key={activeImageUrl}
                          src={activeImageUrl}
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          onLoadedData={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : customSavedImage ? (
                      /* User's custom permanent image */
                      <img
                        src={customSavedImage}
                        alt={currentSlide?.name}
                        style={{
                          objectPosition: getSlideObjectPosition(customSavedImage),
                        }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isOperationalSlide ? 'contrast-[0.80] brightness-[1.03]' : ''
                        }`}
                      />
                    ) : availableImages.length > 1 ? (
                      /* Layered Multi-Image Smooth Cross-Dissolve */
                      <div className="absolute inset-0 w-full h-full">
                        {availableImages.map((img, idx) => {
                          const isVisible = idx === (tennisImgIndex % availableImages.length);
                          const objectPos = getSlideObjectPosition(img.imageUrl, img.objectPosition);

                          return (
                            <motion.img
                              key={img.imageUrl}
                              src={img.imageUrl}
                              alt={currentSlide?.name}
                              initial={false}
                              animate={{ opacity: isVisible ? 1 : 0 }}
                              transition={{
                                duration: 1.8,
                                ease: [0.33, 1, 0.68, 1],
                              }}
                              style={{ objectPosition: objectPos }}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          );
                        })}
                      </div>
                    ) : activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt={currentSlide?.name}
                        style={{
                          objectPosition: getSlideObjectPosition(activeImageUrl),
                        }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isOperationalSlide
                            ? 'contrast-[0.80] brightness-[1.03]'
                            : (activeImageUrl.includes('IMG_3371') || currentSlide?.id === 'tft-teaching')
                              ? 'brightness-[1.10] contrast-[1.0]'
                              : ''
                        }`}
                      />
                    ) : (
                      /* Minimalist Canvas for projects without an image or video */
                      <div className="w-full h-full bg-[#11100E] relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(#C8A462_1px,transparent_1px)] [background-size:48px_48px] opacity-15" />
                        <div className="w-[500px] h-[500px] rounded-full border border-[#C8A462]/15 blur-[1px]" />
                        <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
                          <div className="w-14 h-14 rounded-2xl bg-[#C8A462]/10 border border-[#C8A462]/25 flex items-center justify-center mb-3 text-[#C8A462] shadow-lg">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-mono text-[#A8A294]">
                            {currentSlide?.badge || currentSlide?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Cinematic Dark Gradient Overlays */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-t ${
                      isOperationalSlide ? 'from-black/60 via-black/20' : 'from-black/75 via-black/30'
                    } to-transparent z-10`}
                  />
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-r ${
                      isOperationalSlide ? 'from-black/45 via-transparent to-black/20' : 'from-black/55 via-transparent to-black/25'
                    } z-10`}
                  />

                  {/* Kinetic Downward Transition Accent Line */}
                  {!isFirstEntry && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0.8 }}
                      animate={{ scaleY: 1, opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#C8A462] to-transparent origin-top pointer-events-none"
                    />
                  )}
                </div>

                {/* ============================================================ */}
                {/* FIXED TYPOGRAPHY CONTAINER: IDENTICAL POSITION ACROSS ALL SLIDES */}
                {/* Zero extraneous tags/badges; just title and description     */}
                {/* Positioned on the left with safe margin so it NEVER overlaps arrows */}
                {/* ============================================================ */}
                <motion.div
                  initial={{ opacity: 0, y: isFirstEntry ? 16 : (direction > 0 ? 30 : -30) }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: isFirstEntry ? 0.35 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-6 sm:left-12 md:left-16 lg:left-20 bottom-10 sm:bottom-14 md:bottom-16 z-20 w-full max-w-xl sm:max-w-2xl md:max-w-3xl pr-24 sm:pr-28 select-text"
                >
                  {/* Fixed Title Slot: EXACT same vertical height and baseline across all slides */}
                  <div className="h-[60px] sm:h-[76px] md:h-[84px] flex items-end mb-3 sm:mb-4">
                    {activeLink === '#paper-l3-av' ? (
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <button
                          onClick={() => setIsPaperModalOpen(true)}
                          id={`slide-title-paper-btn-${currentIndex}`}
                          className="group/title inline-flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none text-left transition-transform duration-300"
                          title="Click to read full research paper & literature review"
                        >
                          <span className="relative">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-[#F6F3ED] group-hover/title:text-[#E8C988] tracking-tight leading-none drop-shadow-md transition-colors duration-300">
                              {currentSlide?.name}
                            </h2>
                            {/* Animated Gold Luminous Underline Indicator */}
                            <span className="absolute left-0 -bottom-1 sm:-bottom-1.5 w-full h-[2px] sm:h-[2.5px] bg-gradient-to-r from-[#C8A462] via-[#E8C988] to-[#C8A462]/30 origin-left scale-x-90 group-hover/title:scale-x-100 transition-transform duration-300 ease-out shadow-[0_0_8px_rgba(200,164,98,0.5)]" />
                          </span>

                          {/* Clickable Book / Paper Badge */}
                          <span className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-black/60 group-hover/title:bg-[#C8A462] text-[#C8A462] group-hover/title:text-[#161513] border border-[#C8A462]/40 group-hover/title:border-[#C8A462] backdrop-blur-sm transition-all duration-300 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 shadow-[0_0_15px_rgba(200,164,98,0.25)] group-hover/title:shadow-[0_0_20px_rgba(200,164,98,0.6)] shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[2.5]" />
                          </span>
                        </button>
                      </div>
                    ) : activeLink ? (
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <a
                          href={activeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`slide-title-link-${currentIndex}`}
                          className="group/title inline-flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none transition-transform duration-300"
                          title={`Open ${activeLink} in new tab`}
                        >
                          <span className="relative">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-[#F6F3ED] group-hover/title:text-[#E8C988] tracking-tight leading-none drop-shadow-md transition-colors duration-300">
                              {currentSlide?.name}
                            </h2>
                            {/* Animated Gold Luminous Underline Indicator */}
                            <span className="absolute left-0 -bottom-1 sm:-bottom-1.5 w-full h-[2px] sm:h-[2.5px] bg-gradient-to-r from-[#C8A462] via-[#E8C988] to-[#C8A462]/30 origin-left scale-x-90 group-hover/title:scale-x-100 transition-transform duration-300 ease-out shadow-[0_0_8px_rgba(200,164,98,0.5)]" />
                          </span>

                          {/* Clickable Diagonal Arrow Badge */}
                          <span className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-black/60 group-hover/title:bg-[#C8A462] text-[#C8A462] group-hover/title:text-[#161513] border border-[#C8A462]/40 group-hover/title:border-[#C8A462] backdrop-blur-sm transition-all duration-300 group-hover/title:translate-x-1 group-hover/title:-translate-y-1 shadow-[0_0_15px_rgba(200,164,98,0.25)] group-hover/title:shadow-[0_0_20px_rgba(200,164,98,0.6)] shrink-0">
                            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[2.5]" />
                          </span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-[#F6F3ED] tracking-tight leading-none drop-shadow-md">
                          {currentSlide?.name}
                        </h2>
                      </div>
                    )}
                  </div>

                  {/* Fixed Description Slot: Begins at the exact same vertical line across all slides */}
                  <div className="min-h-[90px] sm:min-h-[110px] flex items-start">
                    {currentSlide?.summary && (
                      <p className="text-sm sm:text-base md:text-lg text-[#D8D2C5] leading-relaxed font-sans drop-shadow max-w-2xl">
                        {currentSlide.summary}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* ============================================================ */}
            {/* VERTICAL NAVIGATION DOCK: DOWNWARD FLOW                       */}
            {/* Anchored on the Right side to completely avoid text on the left */}
            {/* ============================================================ */}
            <div className="absolute right-6 sm:right-10 md:right-14 bottom-10 sm:bottom-14 md:bottom-16 z-30 flex flex-col items-center gap-3">
              {/* Upward Arrow (Previous Interest) */}
              <button
                onClick={handlePrev}
                id="prev-interest-button"
                className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-[#D4CEBF] hover:text-white border border-white/15 hover:border-[#C8A462]/50 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
                aria-label="Previous interest (Up)"
                title="Previous interest"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              {/* Vertical Progress Indicator / Track */}
              <div className="flex flex-col items-center py-2 space-y-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsFirstEntry(false);
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                      playTennisPop(520);
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentIndex
                        ? 'w-1.5 h-6 bg-[#C8A462] shadow-[0_0_12px_rgba(200,164,98,0.7)]'
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Downward Arrow (Primary Next Interest) */}
              <button
                onClick={handleNext}
                id="next-interest-button"
                className="group relative p-3.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462] text-[#E6DECE] hover:text-[#161513] border border-[#C8A462]/40 hover:border-[#C8A462] backdrop-blur-md transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(200,164,98,0.25)] hover:shadow-[0_0_25px_rgba(200,164,98,0.6)] active:scale-95"
                aria-label="Next interest (Down)"
                title="Next interest"
              >
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                </motion.div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Attached Academic Paper Modal for L3 AV Auditory Framework */}
        <AuditoryFrameworkPaperModal
          isOpen={isPaperModalOpen}
          onClose={() => setIsPaperModalOpen(false)}
          externalDocUrl={activeLink && activeLink !== '#paper-l3-av' ? activeLink : undefined}
        />
      </motion.div>
    </AnimatePresence>
  );
};
