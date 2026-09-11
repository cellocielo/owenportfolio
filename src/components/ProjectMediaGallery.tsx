import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectImage } from '../types';
import { Image as ImageIcon, Video as VideoIcon, Maximize2, X, Upload, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectMediaGalleryProps {
  images?: ProjectImage[];
  className?: string;
  isCompact?: boolean;
}

const MediaItemView: React.FC<{
  item: ProjectImage;
  onExpand?: (src: string, isVideo: boolean) => void;
  isCompact?: boolean;
}> = ({ item, onExpand, isCompact }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawUrl = item.imageUrl || '';
  const cleanFileName = rawUrl.split('/').pop()?.split('?')[0] || 'Media file';
  
  // Generate list of fallback candidates
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (rawUrl) {
      list.push(rawUrl);
      const encoded = encodeURI(rawUrl);
      if (encoded !== rawUrl) list.push(encoded);
    }
    if (cleanFileName) {
      list.push(`/${cleanFileName}`);
      list.push(encodeURI(`/${cleanFileName}`));
      list.push(`/assets/aistudio/${cleanFileName}`);
      list.push(encodeURI(`/assets/aistudio/${cleanFileName}`));

      // Check alternate extensions & stripped names
      const dotIndex = cleanFileName.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? cleanFileName.substring(0, dotIndex) : cleanFileName;
      
      // If filename has parentheses like "IMG_2806 (online-video-cutter.com)"
      const strippedBase = baseName.replace(/\s*\([^)]*\)/g, '').trim();

      const baseVariants = Array.from(new Set([baseName, strippedBase].filter(Boolean)));

      baseVariants.forEach((b) => {
        list.push(`/${b}.mp4`);
        list.push(`/${b}.MP4`);
        list.push(`/${b}.mov`);
        list.push(`/${b}.MOV`);
        list.push(`/${b}.jpg`);
        list.push(`/${b}.JPG`);
        list.push(`/${b}.jpeg`);
        list.push(`/${b}.HEIC`);
        list.push(`/${b}.heic`);
        list.push(`/${b}.png`);
      });
    }
    return Array.from(new Set(list));
  }, [rawUrl, cleanFileName]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const currentCandidateUrl = candidates[candidateIndex] || rawUrl;

  const [activeUrl, setActiveUrl] = useState<string>(currentCandidateUrl);
  const [loadError, setLoadError] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isVideo = item.isVideo || /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(activeUrl) || /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(cleanFileName);
  const isHeic = /\.(heic)(\?.*)?$/i.test(activeUrl);

  const handleCandidateError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setLoadError(true);
    }
  };

  // Check if candidate URL actually exists on the server to prevent blank video tags
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!currentCandidateUrl || currentCandidateUrl.startsWith('blob:') || currentCandidateUrl.startsWith('data:')) {
      setActiveUrl(currentCandidateUrl);
      setLoadError(false);
      return;
    }

    // Fast HEAD check so non-existent videos immediately show the upload button
    fetch(currentCandidateUrl, { method: 'HEAD' })
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          if (isHeic) {
            setIsConverting(true);
            fetch(currentCandidateUrl)
              .then((r) => r.blob())
              .then(async (blob) => {
                try {
                  const heic2any = (await import('heic2any')).default;
                  const conversionResult = await heic2any({
                    blob,
                    toType: 'image/jpeg',
                    quality: 0.88,
                  });
                  const finalBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
                  if (active && finalBlob) {
                    objectUrl = URL.createObjectURL(finalBlob);
                    setActiveUrl(objectUrl);
                    setLoadError(false);
                  }
                } catch {
                  if (active) setActiveUrl(currentCandidateUrl);
                }
              })
              .catch(() => {
                if (active) handleCandidateError();
              })
              .finally(() => {
                if (active) setIsConverting(false);
              });
          } else {
            setActiveUrl(currentCandidateUrl);
            setLoadError(false);
          }
        } else {
          handleCandidateError();
        }
      })
      .catch(() => {
        if (active) handleCandidateError();
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentCandidateUrl]);

  const processFile = async (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setActiveUrl(blobUrl);
    setLoadError(false);
    setIsUploading(true);

    try {
      const targetFilename = cleanFileName || file.name;
      await fetch(`/api/upload-media?filename=${encodeURIComponent(targetFilename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      // Also upload under the actual original file name if different
      if (file.name !== targetFilename) {
        await fetch(`/api/upload-media?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });
      }
    } catch (err) {
      console.warn('Could not persist media to server:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const fileAcceptTypes = isVideo
    ? 'video/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.MOV,.webm'
    : 'image/*,image/jpeg,image/png,image/heic,.jpg,.jpeg,.png,.heic,.HEIC';

  // Fallback Upload Container
  if (loadError) {
    return (
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-6 rounded-xl warm-panel-subtle border text-center min-h-[190px] sm:min-h-[220px] transition-all ${
          isDragging ? 'border-[#C8A462] bg-[#C8A462]/10 scale-[1.01]' : 'border-[#E6DECE]/15 hover:border-[#C8A462]/40'
        }`}
      >
        {isVideo ? (
          <VideoIcon className="w-9 h-9 text-[#C8A462] mb-2.5 animate-pulse" />
        ) : (
          <ImageIcon className="w-9 h-9 text-[#C8A462] mb-2.5" />
        )}
        <span className="text-xs font-mono text-[#F6F3ED] font-semibold tracking-wide">
          {cleanFileName}
        </span>
        <p className="text-[11px] text-[#A8A294] mt-1.5 max-w-xs leading-relaxed">
          {isVideo 
            ? 'Video pending upload. Drag & drop your video file here or click below.' 
            : 'Image pending upload. Drag & drop your photo file here or click below.'}
        </p>
        
        {/* Instant File Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualUpload}
          accept={fileAcceptTypes}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C8A462] hover:bg-[#D6B575] text-[#161513] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Uploading & saving...' : isVideo ? 'Choose video to upload' : 'Choose photo to upload'}</span>
        </button>
      </div>
    );
  }

  // Video Player with drag-over & replace support
  if (isVideo) {
    return (
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative group overflow-hidden rounded-xl border border-[#E6DECE]/15 bg-[#0C0B0A] shadow-md"
      >
        {/* Hidden File Input for Video */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualUpload}
          accept={fileAcceptTypes}
          className="hidden"
        />

        <video
          key={activeUrl}
          src={activeUrl}
          controls
          playsInline
          preload="metadata"
          className={`w-full ${isCompact ? 'max-h-64' : 'max-h-96'} object-cover rounded-xl`}
          onError={handleCandidateError}
          onEmptied={handleCandidateError}
        >
          Your browser does not support the video tag.
        </video>

        {/* Action button overlay on video */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-[#F6F3ED] text-[11px] font-mono flex items-center gap-1 backdrop-blur-sm border border-white/15 cursor-pointer shadow-sm"
            title="Upload or replace this video"
          >
            <RefreshCw className="w-3 h-3 text-[#C8A462]" />
            <span>Replace Video</span>
          </button>
          {onExpand && (
            <button
              onClick={() => onExpand(activeUrl, true)}
              className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-[#F6F3ED] backdrop-blur-sm border border-white/15 cursor-pointer shadow-sm"
              title="Fullscreen view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-10 border-2 border-dashed border-[#C8A462]">
            <Upload className="w-8 h-8 text-[#C8A462] mb-2 animate-bounce" />
            <span className="text-xs font-mono text-[#F6F3ED]">Drop your video file to upload</span>
          </div>
        )}

        {item.caption && (
          <p className="p-2 text-xs font-mono text-[#A8A294] text-center border-t border-[#E6DECE]/10">
            {item.caption}
          </p>
        )}
      </div>
    );
  }

  // Photo View
  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative group overflow-hidden rounded-xl border border-[#E6DECE]/15 bg-[#0C0B0A] shadow-md"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleManualUpload}
        accept={fileAcceptTypes}
        className="hidden"
      />

      {isConverting ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[180px] warm-panel-subtle">
          <div className="w-5 h-5 border-2 border-[#C8A462] border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-mono text-[#A8A294]">Decoding HEIC...</span>
        </div>
      ) : (
        <div className="relative">
          <img
            src={activeUrl}
            alt={item.caption || cleanFileName}
            loading="lazy"
            onError={handleCandidateError}
            style={{
              ...(item.height ? { height: item.height } : {}),
              ...(item.objectPosition ? { objectPosition: item.objectPosition } : {}),
            }}
            className={`w-full ${item.height ? '' : isCompact ? 'max-h-64' : 'max-h-96'} object-cover transition-transform duration-300 group-hover:scale-[1.01] ${item.className || ''}`}
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-[#F6F3ED] text-[11px] font-mono flex items-center gap-1 backdrop-blur-sm border border-white/15 cursor-pointer shadow-sm"
              title="Upload or replace this photo"
            >
              <RefreshCw className="w-3 h-3 text-[#C8A462]" />
              <span>Replace</span>
            </button>
            {onExpand && (
              <button
                onClick={() => onExpand(activeUrl, false)}
                className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-[#F6F3ED] backdrop-blur-sm border border-white/15 cursor-pointer shadow-sm"
                title="Expand image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-10 border-2 border-dashed border-[#C8A462]">
          <Upload className="w-8 h-8 text-[#C8A462] mb-2 animate-bounce" />
          <span className="text-xs font-mono text-[#F6F3ED]">Drop your photo to upload</span>
        </div>
      )}

      {item.caption && (
        <p className="p-2.5 text-xs text-[#A8A294] text-center border-t border-[#E6DECE]/10">
          {item.caption}
        </p>
      )}
    </div>
  );
};

export const ProjectMediaGallery: React.FC<ProjectMediaGalleryProps> = ({
  images,
  className = '',
  isCompact = false,
}) => {
  const [expandedMedia, setExpandedMedia] = useState<{ src: string; isVideo: boolean } | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div
        className={`mt-5 ${
          images.length === 1
            ? 'max-w-xl'
            : images.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        } ${className}`}
      >
        {images.map((img) => (
          <MediaItemView
            key={img.id || img.imageUrl}
            item={img}
            isCompact={isCompact}
            onExpand={(src, isVideo) => setExpandedMedia({ src, isVideo })}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {expandedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedMedia(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div
              className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedMedia(null)}
                className="absolute -top-10 right-0 sm:-right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {expandedMedia.isVideo ? (
                <video
                  src={expandedMedia.src}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-full rounded-xl border border-white/20 shadow-2xl"
                />
              ) : (
                <img
                  src={expandedMedia.src}
                  alt="Expanded view"
                  className="max-h-[85vh] max-w-full object-contain rounded-xl border border-white/20 shadow-2xl"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
