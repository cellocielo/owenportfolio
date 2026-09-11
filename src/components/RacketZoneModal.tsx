import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Video,
  Camera,
  Upload,
  Link as LinkIcon,
  Link2,
  ExternalLink,
  ArrowUpRight,
  Globe,
  Trash2,
  RotateCcw,
  Check,
  BookOpen,
  Play,
  Pause
} from 'lucide-react';
import { RacketZone } from '../types';
import { portfolioData } from '../data/portfolioData';
import { playTennisPop } from '../utils/audio';
import { 
  getCustomImage, 
  saveCustomImage, 
  removeCustomImage, 
  processImageFile 
} from '../utils/imageStorage';
import {
  getCustomLink,
  saveCustomLink,
  removeCustomLink,
  formatUrl,
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

  // Custom image input state
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);
  const [customImageVersion, setCustomImageVersion] = useState<number>(0);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Custom link input state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkUrlInput, setLinkUrlInput] = useState<string>('');
  const [customLinkVersion, setCustomLinkVersion] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Academic paper reading modal state
  const [isPaperModalOpen, setIsPaperModalOpen] = useState<boolean>(false);

  // Video playback & framing controls
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [natureVideoError, setNatureVideoError] = useState<boolean>(false);
  const natureVideoRef = useRef<HTMLVideoElement | null>(null);
  const generalVideoRef = useRef<HTMLVideoElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  const currentZoneKey = zone || 'dampener';
  const zoneData = portfolioData[currentZoneKey];
  const slides = zoneData?.projects || [];

  // Listen to custom images & links updates (e.g. from IndexedDB hydration or cross-component saves)
  useEffect(() => {
    const handleImageUpdate = () => setCustomImageVersion((v) => v + 1);
    const handleLinkUpdate = () => setCustomLinkVersion((v) => v + 1);
    window.addEventListener('custom-images-updated', handleImageUpdate);
    window.addEventListener('custom-links-updated', handleLinkUpdate);
    return () => {
      window.removeEventListener('custom-images-updated', handleImageUpdate);
      window.removeEventListener('custom-links-updated', handleLinkUpdate);
    };
  }, []);

  // Reset state when modal opens or zone changes
  useEffect(() => {
    if (isOpen && zone) {
      setViewMode(initialMode);
      setCurrentIndex(initialSlide);
      setDirection(1);
      setIsFirstEntry(true);
      setTennisImgIndex(0);
      setIsImageModalOpen(false);
      setImageUrlInput('');
      playTennisPop(480);
    }
  }, [isOpen, zone, initialSlide, initialMode]);

  // Preload and hardware-decode available slide images into browser memory
  useEffect(() => {
    slides.forEach((slide) => {
      const customImg = getCustomImage(currentZoneKey, slide.name, slide.badge, slide.id);
      if (customImg) {
        const pImg = new Image();
        pImg.src = customImg;
        if ('decode' in pImg) pImg.decode().catch(() => {});
      }
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
  }, [slides, currentZoneKey, customImageVersion]);

  // Listen to custom images storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setCustomImageVersion((v) => v + 1);
    };
    window.addEventListener('custom-images-updated', handleUpdate);
    return () => window.removeEventListener('custom-images-updated', handleUpdate);
  }, []);

  // Reset tennis image index whenever slide changes
  useEffect(() => {
    setTennisImgIndex(0);
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
      if (isImageModalOpen || isLinkModalOpen) return;

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
  }, [isOpen, viewMode, currentIndex, slides.length, isImageModalOpen, isLinkModalOpen]);

  const currentSlide = slides[currentIndex];
  const availableImages = currentSlide?.images || [];
  const defaultActiveImage = availableImages[0];

  // Check if current slide is Nature-Based Recreational Apps (for video input and dedicated centered iPhone presentation)
  const isNatureBasedSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('nature-based') ||
    currentSlide?.id?.includes('nature') ||
    currentSlide?.badge?.toLowerCase().includes('eco friction')
  );

  // Resolve custom user image or video from permanent storage
  const customSavedImage = currentSlide
    ? getCustomImage(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id)
    : null;

  // For nature-based slide, prioritize user custom uploaded video, else use customSavedImage, else default imageUrl
  const isCustomVideo = Boolean(
    customSavedImage && (
      customSavedImage.startsWith('data:video/') ||
      customSavedImage.startsWith('blob:') ||
      /\.(mp4|mov|webm|m4v|ogv)(\?.*)?$/i.test(customSavedImage)
    )
  );

  const activeImageUrl = isNatureBasedSlide
    ? (isCustomVideo ? customSavedImage! : (defaultActiveImage?.imageUrl || '/cpm_08_prototype.mp4'))
    : ((customSavedImage && customSavedImage.trim().length > 0)
        ? customSavedImage
        : (defaultActiveImage?.imageUrl || ''));

  const isSpritzSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('spritz') ||
    activeImageUrl?.toLowerCase().includes('spritz')
  );

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
    Boolean(customSavedImage && (customSavedImage.startsWith('data:video/') || /\.(mp4|mov|webm|m4v|ogv)(\?.*)?$/i.test(customSavedImage))) ||
    Boolean(!customSavedImage && (defaultActiveImage?.isVideo || /\.(mp4|mov|webm|m4v|ogv)(\?.*)?$/i.test(activeImageUrl)));

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

  // Handle file input
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlide) return;

    setIsProcessingFile(true);
    setUploadError(null);
    try {
      const processed = await processImageFile(file);
      saveCustomImage(currentZoneKey, currentSlide.name, processed, currentSlide.badge, currentSlide.id);
      setCustomImageVersion((v) => v + 1);
      setIsImageModalOpen(false);
      setToastMessage(isNatureBasedSlide || isVideo ? 'Video saved permanently!' : 'Image saved permanently!');
      setSaveSuccessToast(true);
      playTennisPop(620);
      setTimeout(() => setSaveSuccessToast(false), 2600);
    } catch (err: unknown) {
      console.error('Failed to process uploaded file', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to process this file format.';
      setUploadError(errMsg);
      setTimeout(() => setUploadError(null), 4500);
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle URL save
  const handleSaveUrl = () => {
    if (!imageUrlInput.trim() || !currentSlide) return;
    saveCustomImage(currentZoneKey, currentSlide.name, imageUrlInput.trim(), currentSlide.badge, currentSlide.id);
    setCustomImageVersion((v) => v + 1);
    setImageUrlInput('');
    setIsImageModalOpen(false);
    setToastMessage(isNatureBasedSlide || isVideo ? 'Video saved permanently!' : 'Image saved permanently!');
    setSaveSuccessToast(true);
    playTennisPop(620);
    setTimeout(() => setSaveSuccessToast(false), 2600);
  };

  // Handle reset to default
  const handleResetImage = () => {
    if (!currentSlide) return;
    removeCustomImage(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id);
    setCustomImageVersion((v) => v + 1);
    setIsImageModalOpen(false);
    setToastMessage(isNatureBasedSlide ? 'Reset to default video' : 'Reset to default image');
    setSaveSuccessToast(true);
    playTennisPop(440);
    setTimeout(() => setSaveSuccessToast(false), 2600);
  };

  // Check if destination link is disabled for this slide
  const isLinkDisabled = currentSlide
    ? isSlideLinkDisabled(currentZoneKey, currentSlide.name, currentSlide.id)
    : false;

  // Resolve custom user link
  const customSavedLink = (currentSlide && !isLinkDisabled)
    ? getCustomLink(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id)
    : null;
  const activeLink = !isLinkDisabled && (customSavedLink !== null
    ? customSavedLink
    : (currentSlide?.link || currentSlide?.url || ''));

  // Check if current slide is L3 AV Auditory Framework paper slide
  const isAvPaperSlide = Boolean(
    currentSlide?.name?.toLowerCase().includes('auditory framework') ||
    currentSlide?.id?.includes('av')
  );

  // Handle open link modal
  const handleOpenLinkModal = () => {
    setLinkUrlInput(activeLink || '');
    setIsLinkModalOpen(true);
  };

  // Handle save link
  const handleSaveLink = () => {
    if (!currentSlide) return;
    const trimmed = linkUrlInput.trim();
    if (!trimmed) {
      removeCustomLink(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id);
      setToastMessage('Title link removed');
    } else {
      saveCustomLink(currentZoneKey, currentSlide.name, trimmed, currentSlide.badge, currentSlide.id);
      setToastMessage('Title link saved permanently!');
    }
    setCustomLinkVersion((v) => v + 1);
    setIsLinkModalOpen(false);
    setSaveSuccessToast(true);
    playTennisPop(660);
    setTimeout(() => setSaveSuccessToast(false), 2600);
  };

  // Handle remove link
  const handleRemoveLink = () => {
    if (!currentSlide) return;
    removeCustomLink(currentZoneKey, currentSlide.name, currentSlide.badge, currentSlide.id);
    setCustomLinkVersion((v) => v + 1);
    setLinkUrlInput('');
    setIsLinkModalOpen(false);
    setToastMessage('Title link removed');
    setSaveSuccessToast(true);
    playTennisPop(440);
    setTimeout(() => setSaveSuccessToast(false), 2600);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (viewMode === 'interests') {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (viewMode !== 'interests' || !currentSlide) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setIsProcessingFile(true);
      setUploadError(null);
      try {
        const processed = await processImageFile(file);
        saveCustomImage(currentZoneKey, currentSlide.name, processed, currentSlide.badge, currentSlide.id);
        setCustomImageVersion((v) => v + 1);
        setSaveSuccessToast(true);
        playTennisPop(640);
        setTimeout(() => setSaveSuccessToast(false), 2600);
      } catch (err) {
        console.error('Drop error:', err);
        setUploadError('Unable to process dropped file.');
        setTimeout(() => setUploadError(null), 4000);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="fixed inset-0 z-50 select-none overflow-hidden flex flex-col bg-transparent"
      >
        {/* Hidden file input for permanent image or video upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={isNatureBasedSlide ? "video/*,video/mp4,video/quicktime,video/webm,.mov,.MOV,.mp4,.MP4,.webm" : "image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,video/*,.mp4,.mov"}
          className="hidden"
        />

        {/* Drag & Drop Feedback Banner */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 pointer-events-none bg-black/80 border-2 border-dashed border-[#C8A462] flex flex-col items-center justify-center p-8 backdrop-blur-md">
            {isNatureBasedSlide ? (
              <Video className="w-16 h-16 text-[#C8A462] animate-bounce mb-4" />
            ) : (
              <Upload className="w-16 h-16 text-[#C8A462] animate-bounce mb-4" />
            )}
            <h3 className="text-2xl font-serif text-[#F6F3ED] mb-2">
              {isNatureBasedSlide ? 'Drop video to set permanently' : 'Drop image to set permanently'}
            </h3>
            <p className="text-sm font-mono text-[#D4CEBF]">Will save for: {currentSlide?.name}</p>
          </div>
        )}

        {/* Permanent Save Toast Notification */}
        <AnimatePresence>
          {saveSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#1A1916] text-[#C8A462] border border-[#C8A462]/40 shadow-[0_0_25px_rgba(200,164,98,0.4)] text-xs font-mono backdrop-blur-md pointer-events-none"
            >
              <Check className="w-4 h-4" />
              <span>{toastMessage || 'Saved permanently!'}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
            {/* Minimal Top Bar: ONLY Back to Racket, Audio & Image Input (NO Top Nav Bar) */}
            <header className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-none">
              {/* Left Control: Permanent Image Input Pill & Title Link Pill */}
              <div className="pointer-events-auto flex items-center space-x-2">
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  id="input-media-btn"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-[#D4CEBF] hover:text-[#C8A462] transition-all duration-300 text-xs font-mono border border-white/10 hover:border-[#C8A462]/40 backdrop-blur-md cursor-pointer shadow-md"
                  title={isNatureBasedSlide ? "Input permanent video for this project" : "Input permanent image for this project"}
                >
                  {isNatureBasedSlide ? (
                    <Video className="w-3.5 h-3.5 text-[#E8C988]" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isNatureBasedSlide
                      ? (customSavedImage ? 'Change Video' : 'Input Video')
                      : (customSavedImage ? 'Change Image' : 'Input Image')}
                  </span>
                </button>

                {isAvPaperSlide && (
                  <button
                    onClick={() => setIsPaperModalOpen(true)}
                    id="read-paper-header-btn"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] hover:text-white text-xs font-mono border border-[#C8A462]/60 hover:border-[#C8A462] backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md"
                    title="Read full literature review research paper"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Paper</span>
                  </button>
                )}

                {!isLinkDisabled && (
                  <button
                    onClick={handleOpenLinkModal}
                    id="insert-link-header-btn"
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-mono border backdrop-blur-md cursor-pointer shadow-md ${
                      activeLink
                        ? 'bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] border-[#C8A462]/60 hover:border-[#C8A462]'
                        : 'bg-black/40 hover:bg-black/70 text-[#D4CEBF] hover:text-[#C8A462] border-white/10 hover:border-[#C8A462]/40'
                    }`}
                    title={activeLink ? `Title linked to: ${activeLink} (click to edit)` : "Insert link into title"}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{activeLink ? 'Edit Link' : 'Insert Link'}</span>
                    {activeLink && <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />}
                  </button>
                )}
              </div>

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
                        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                          {/* Centered Demo Video Layer */}
                          <div className="relative z-10 w-full h-full flex items-center justify-center p-0">
                            {activeImageUrl && !natureVideoError ? (
                              <div className="relative flex items-center justify-center w-full h-full">
                                <video
                                  ref={natureVideoRef}
                                  key={`nature-video-${activeImageUrl}`}
                                  autoPlay
                                  loop
                                  muted={isMuted}
                                  playsInline
                                  preload="auto"
                                  onError={() => setNatureVideoError(true)}
                                  onLoadedData={(e) => {
                                    e.currentTarget.play().catch(() => {});
                                  }}
                                  onClick={handleTogglePlayVideo}
                                  className="w-full h-full object-cover cursor-pointer opacity-100 transition-opacity duration-300"
                                  style={{ objectPosition: '55% 45%' }}
                                >
                                  <source src={activeImageUrl} type="video/mp4" />
                                  <source src={activeImageUrl} type="video/quicktime" />
                                  <source src="/cpm_08_prototype.mp4" type="video/mp4" />
                                  <source src="/IMG_0904.MOV" type="video/quicktime" />
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
                            ) : (
                              /* Dedicated CPM 08 Prototype Video Upload Hub */
                              <div className="w-full h-full bg-[#11100E] relative flex items-center justify-center p-6 text-center">
                                <div className="absolute inset-0 bg-[radial-gradient(#C8A462_1px,transparent_1px)] [background-size:48px_48px] opacity-15" />
                                <div className="relative z-10 max-w-md flex flex-col items-center">
                                  <div className="w-16 h-16 rounded-2xl bg-[#C8A462]/10 border border-[#C8A462]/30 flex items-center justify-center mb-4 text-[#C8A462] shadow-lg">
                                    <Video className="w-8 h-8" />
                                  </div>
                                  <h3 className="text-xl font-serif text-[#F6F3ED] font-semibold mb-2">
                                    CPM 08 Prototype Video
                                  </h3>
                                  <p className="text-xs text-[#A8A294] font-mono mb-6 max-w-sm leading-relaxed">
                                    Drop your prototype video file (.mov or .mp4) anywhere on this screen, or click below to select it from your device.
                                  </p>
                                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="px-5 py-2.5 rounded-xl bg-[#C8A462] hover:bg-[#D4B272] text-[#161513] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    >
                                      <Upload className="w-4 h-4" />
                                      <span>Select Video File</span>
                                    </button>
                                    <button
                                      onClick={() => setIsImageModalOpen(true)}
                                      className="px-4 py-2.5 rounded-xl bg-[#1D1B18] hover:bg-[#2A2722] text-[#C8A462] border border-[#C8A462]/30 font-mono text-xs transition-all cursor-pointer active:scale-95"
                                    >
                                      Paste Video Link
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    ) : availableImages.length > 1 ? (
                      /* Layered Multi-Image Smooth Cross-Dissolve */
                      <div className="absolute inset-0 w-full h-full">
                        {availableImages.map((img, idx) => {
                          const isVisible = idx === (tennisImgIndex % availableImages.length);
                          const isFirstTennisImg = img.imageUrl?.includes('DSC00474') || img.id === 'tennis-img-1';
                          const objectPos = isFirstTennisImg ? 'center 28%' : 'center center';

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
                          objectPosition: (activeImageUrl.includes('DSC00474') || defaultActiveImage?.id === 'tennis-img-1')
                            ? 'center 28%'
                            : (activeImageUrl.includes('IMG_3371') || currentSlide?.id === 'tft-scaling')
                            ? 'center 18%'
                            : activeImageUrl.includes('IMG_1586')
                            ? 'center 24%'
                            : 'center center',
                        }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          (activeImageUrl.includes('IMG_3371') || currentSlide?.id === 'tft-scaling')
                            ? 'brightness-[1.12] contrast-[1.04]'
                            : ''
                        }`}
                      />
                    ) : (
                      /* Minimalist Canvas for projects without an image or video yet */
                      <div className="w-full h-full bg-[#11100E] relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(#C8A462_1px,transparent_1px)] [background-size:48px_48px] opacity-15" />
                        <div className="w-[500px] h-[500px] rounded-full border border-[#C8A462]/15 blur-[1px]" />
                        <div className="absolute flex flex-col items-center text-center p-6 max-w-md">
                          <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="group p-4 rounded-full bg-[#C8A462]/10 hover:bg-[#C8A462]/20 border border-[#C8A462]/30 text-[#C8A462] transition-all cursor-pointer mb-3 shadow-lg"
                            title={isNatureBasedSlide ? "Input a video" : "Upload an image"}
                          >
                            {isNatureBasedSlide ? (
                              <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            ) : (
                              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                          <span className="text-xs font-mono text-[#A8A294]">
                            {isNatureBasedSlide
                              ? 'Drop a video or click "Input Video" to set permanently'
                              : 'Drop an image or click "Input Image" to set permanently'}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Cinematic Dark Gradient Overlays */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-r from-black/55 via-transparent to-black/25"
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

                        <button
                          onClick={() => setIsPaperModalOpen(true)}
                          id={`read-paper-btn-${currentIndex}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] hover:text-white text-xs font-mono border border-[#C8A462]/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="Read complete research paper"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Paper</span>
                        </button>

                        {/* Quick Edit Link Trigger */}
                        <button
                          onClick={handleOpenLinkModal}
                          id={`edit-title-link-btn-${currentIndex}`}
                          className="opacity-70 hover:opacity-100 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/80 text-[#D4CEBF] hover:text-[#C8A462] text-xs font-mono border border-white/10 hover:border-[#C8A462]/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Edit destination link or Google Docs URL"
                        >
                          <Link2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit Link</span>
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

                        {isAvPaperSlide && (
                          <button
                            onClick={() => setIsPaperModalOpen(true)}
                            id={`read-paper-sub-btn-${currentIndex}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] hover:text-white text-xs font-mono border border-[#C8A462]/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            title="Read complete research paper"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Paper</span>
                          </button>
                        )}

                        {/* Quick Edit Link Trigger */}
                        <button
                          onClick={handleOpenLinkModal}
                          id={`edit-title-link-btn-${currentIndex}`}
                          className="opacity-70 hover:opacity-100 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/80 text-[#D4CEBF] hover:text-[#C8A462] text-xs font-mono border border-white/10 hover:border-[#C8A462]/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Edit destination link"
                        >
                          <Link2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit Link</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-[#F6F3ED] tracking-tight leading-none drop-shadow-md">
                          {currentSlide?.name}
                        </h2>
                        {isAvPaperSlide && (
                          <button
                            onClick={() => setIsPaperModalOpen(true)}
                            id={`read-paper-btn-nopermalink-${currentIndex}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] hover:text-white text-xs font-mono border border-[#C8A462]/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            title="Read complete research paper"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Paper</span>
                          </button>
                        )}
                        {!isLinkDisabled && (
                          <button
                            onClick={handleOpenLinkModal}
                            id={`insert-title-link-btn-${currentIndex}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/15 hover:bg-[#C8A462]/30 text-[#E8C988] hover:text-white text-xs font-mono border border-[#C8A462]/40 hover:border-[#C8A462] backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            title="Insert clickable destination link for this title"
                          >
                            <Link2 className="w-3.5 h-3.5 text-[#C8A462]" />
                            <span>+ Insert Link</span>
                          </button>
                        )}
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

        {/* ============================================================ */}
        {/* PERMANENT IMAGE INPUT MODAL                                   */}
        {/* ============================================================ */}
        <AnimatePresence>
          {isImageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md rounded-2xl bg-[#181714] border border-[#E6DECE]/15 p-6 shadow-2xl text-[#F6F3ED]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[#A8A294] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-serif font-medium mb-1">
                  {isNatureBasedSlide ? 'Set Project Video' : 'Set Project Image'}
                </h3>
                <p className="text-xs font-mono text-[#A8A294] mb-6">
                  {currentSlide?.name} {currentSlide?.badge ? `(${currentSlide.badge})` : ''} • Stays permanently across reloads
                </p>

                {/* Option A: Upload from Device */}
                <div className="mb-5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFile}
                    className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-xl bg-[#C8A462] hover:bg-[#D4B272] text-[#161513] font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isProcessingFile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#161513] border-t-transparent rounded-full animate-spin" />
                        <span>Processing & Optimizing...</span>
                      </>
                    ) : (
                      <>
                        {isNatureBasedSlide ? <Video className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        <span>{isNatureBasedSlide ? 'Upload Video From Device' : 'Upload From Device'}</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-[#8C8577] mt-2 font-mono">
                    {isNatureBasedSlide
                      ? 'Supports MP4, MOV, WebM, QuickTime up to 80MB'
                      : 'Supports JPG, PNG, WEBP, HEIC (iPhone) & Videos'}
                  </p>

                  {uploadError && (
                    <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-[11px] font-mono text-red-300 text-center">
                      {uploadError}
                    </div>
                  )}
                </div>

                <div className="relative flex py-2 items-center mb-5">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-xs font-mono text-[#736E63] uppercase">Or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Option B: Enter URL */}
                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-mono text-[#C4BCA8]">
                    {isNatureBasedSlide ? 'Video URL, YouTube, or Local Video Path:' : 'Image URL or Local Path:'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-[#736E63] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder={isNatureBasedSlide ? "e.g. https://youtu.be/... or /IMG_0904.MOV" : "/IMG_0155.jpg or https://..."}
                        className="w-full bg-[#23211D] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#5E5A51] focus:outline-none focus:border-[#C8A462]"
                      />
                    </div>
                    <button
                      onClick={handleSaveUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-4 py-2 rounded-lg bg-[#2A2722] hover:bg-[#34302A] text-xs font-mono text-[#C8A462] border border-[#C8A462]/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Option C: Reset to Default (if custom image exists) */}
                {customSavedImage && (
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-[#A8A294] font-mono">
                      {isNatureBasedSlide ? 'Custom video active' : 'Custom image active'}
                    </span>
                    <button
                      onClick={handleResetImage}
                      className="inline-flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-mono cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isNatureBasedSlide ? 'Reset to default video' : 'Reset to default'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* INSERT / EDIT TITLE LINK MODAL DIALOG                          */}
        {/* Persistent localStorage saving, custom to this specific slide */}
        {/* ============================================================ */}
        <AnimatePresence>
          {isLinkModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md rounded-2xl bg-[#181714] border border-[#E6DECE]/15 p-6 shadow-2xl text-[#F6F3ED]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[#A8A294] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="p-2 rounded-lg bg-[#C8A462]/15 text-[#C8A462] border border-[#C8A462]/30">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-serif font-medium">
                    {activeLink ? 'Edit Title Link' : 'Insert Title Link'}
                  </h3>
                </div>

                <p className="text-xs font-mono text-[#A8A294] mb-5">
                  Slide: <span className="text-[#E8C988]">{currentSlide?.name}</span> {currentSlide?.badge ? `(${currentSlide.badge})` : ''} • Stays permanently across reloads
                </p>

                {/* URL Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveLink();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-mono text-[#C4BCA8] mb-1.5">
                      Destination URL:
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-[#736E63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={linkUrlInput}
                        onChange={(e) => setLinkUrlInput(e.target.value)}
                        placeholder="https://example.com or github.com/..."
                        className="w-full bg-[#23211D] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-[#5E5A51] focus:outline-none focus:border-[#C8A462] focus:ring-1 focus:ring-[#C8A462]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8C8577] mt-1.5 font-mono">
                      Users clicking the title will be navigated to this destination in a new tab.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/5 text-xs font-mono text-[#A8A294] hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#C8A462] hover:bg-[#D4B272] text-[#161513] font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      Save Link
                    </button>
                  </div>
                </form>

                {/* Reset / Remove Link Option */}
                {activeLink && (
                  <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center space-x-1.5 text-xs text-[#A8A294] font-mono truncate max-w-[200px]">
                      <ExternalLink className="w-3 h-3 text-[#C8A462] shrink-0" />
                      <span className="truncate" title={activeLink}>{activeLink}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="inline-flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-mono cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove link</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
