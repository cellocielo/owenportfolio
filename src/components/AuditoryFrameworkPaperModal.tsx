import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ExternalLink, ArrowDown, FileText, Check, Copy } from 'lucide-react';
import { avFrameworkPaper } from '../data/avFrameworkPaper';

interface AuditoryFrameworkPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  externalDocUrl?: string;
}

export const AuditoryFrameworkPaperModal: React.FC<AuditoryFrameworkPaperModalProps> = ({
  isOpen,
  onClose,
  externalDocUrl,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCitation = () => {
    const citation = `Kim, O. (2025). Designing an Auditory Feedback Framework in Level 3 Autonomous Vehicles: A Literature Review. Santa Clara University.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#141311] border border-[#C8A462]/30 rounded-2xl shadow-2xl overflow-hidden text-[#E4DFD5]"
          >
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1815]/90 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#C8A462]/15 text-[#C8A462] border border-[#C8A462]/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#C8A462] block">
                    Academic Research Paper & Literature Review
                  </span>
                  <span className="text-xs text-[#A8A295] font-sans">
                    Level 3 Autonomous Vehicle HCI
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {externalDocUrl && (
                  <a
                    href={externalDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8A462]/20 hover:bg-[#C8A462]/35 text-[#E8C988] text-xs font-mono border border-[#C8A462]/40 transition-all shadow-sm"
                  >
                    <span>Google Doc</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#D4CEBF] text-xs font-mono border border-white/10 transition-all cursor-pointer"
                  title="Copy paper citation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Cite'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#D4CEBF] hover:text-white transition-all cursor-pointer ml-1"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Paper Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 py-8 sm:py-10 space-y-8 select-text">
              {/* Paper Header */}
              <div className="border-b border-white/10 pb-6 space-y-3">
                <span className="inline-block px-2.5 py-0.75 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#C8A462]/15 text-[#E8C988] border border-[#C8A462]/30">
                  HCI & Automotive Safety Literature Review
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#F6F3ED] tracking-tight leading-snug">
                  {avFrameworkPaper.title}
                </h1>
                <p className="text-sm sm:text-base text-[#C8A462] font-mono">
                  {avFrameworkPaper.subtitle}
                </p>
                <div className="pt-2 text-xs sm:text-sm text-[#A8A295] flex items-center gap-3 flex-wrap">
                  <span className="text-[#F6F3ED] font-medium">Authors: {avFrameworkPaper.authors.join(', ')}</span>
                  <span>•</span>
                  <span>{avFrameworkPaper.institution}</span>
                </div>
              </div>

              {/* Abstract Callout */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#1C1A17] border border-[#C8A462]/20 space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-[#C8A462]">
                  Abstract
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-[#D8D2C5] italic font-serif">
                  {avFrameworkPaper.abstract}
                </p>
              </div>

              {/* Research Diagram Figure */}
              <div className="my-8 rounded-xl overflow-hidden border border-white/15 bg-black/60 p-4 space-y-3">
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                  <img
                    src="/av_framework_ss.png"
                    alt="Auditory Framework Decision Flowchart"
                    className="w-full max-h-[460px] object-contain"
                  />
                </div>
                <p className="text-xs sm:text-sm font-mono text-[#A8A295] text-center px-4">
                  {avFrameworkPaper.figures[0].caption}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-8 divide-y divide-white/5">
                {avFrameworkPaper.sections.map((section) => (
                  <div key={section.id} className="pt-6 space-y-3">
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#F6F3ED]">
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="text-sm sm:text-base text-[#D4CEBF] leading-relaxed font-sans"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Citation */}
              <div className="border-t border-white/10 pt-6 pb-2 text-xs font-mono text-[#8C857B] text-center">
                Literature Review on Auditory Feedback Architectures for Level 3 Autonomous Vehicles • Owen Kim
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
