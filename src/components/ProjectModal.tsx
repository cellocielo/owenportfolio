import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectHighlight } from '../types';
import { X, ArrowRight } from 'lucide-react';
import { ProjectMediaGallery } from './ProjectMediaGallery';

interface ProjectModalProps {
  project: ProjectHighlight | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0E0D0C]/85 backdrop-blur-md"
        />

        {/* Modal Window in Warm Card Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl warm-card border border-[#E6DECE]/15 shadow-2xl p-6 sm:p-8 z-10 custom-scrollbar text-[#F6F3ED]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full warm-panel-subtle text-[#A8A294] hover:text-[#F6F3ED] hover:bg-[#2A2722] border border-[#E6DECE]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="pr-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#F6F3ED]">
              {project.name}
            </h2>
          </div>

          {/* Summary */}
          {project.summary && (
            <p className="mt-4 text-sm sm:text-base text-[#DDD8CE] leading-relaxed">
              {project.summary}
            </p>
          )}

          {/* Media Gallery */}
          {project.images && project.images.length > 0 && (
            <ProjectMediaGallery images={project.images} />
          )}

          {/* Footer Action */}
          <div className="mt-8 pt-4 border-t border-[#E6DECE]/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#C8A462] text-[#161513] font-bold text-xs uppercase tracking-wider hover:bg-[#D6B575] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Close</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
