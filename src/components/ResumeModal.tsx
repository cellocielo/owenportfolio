import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, Award, BookOpen, Briefcase, Code, Download } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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

        {/* Modal Window in Warm Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl warm-card border border-[#E6DECE]/15 shadow-2xl p-6 sm:p-10 z-10 custom-scrollbar text-[#F6F3ED]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close resume modal"
            className="absolute top-6 right-6 p-2 rounded-full warm-panel-subtle text-[#A8A294] hover:text-[#F6F3ED] hover:bg-[#2A2722] border border-[#E6DECE]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Resume Header */}
          <div className="border-b border-[#E6DECE]/10 pb-6 mb-6">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C8A462] font-bold block mb-1">
              Curriculum Vitae
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#F6F3ED]">
              Owen Kim
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#A8A294] mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C8A462]" /> Palo Alto, CA
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#C8A462]" /> owenkim2k8@ucla.edu
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C8A462]" /> 650-471-1118
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-6 text-sm text-[#DDD8CE]">
            {/* Education */}
            <section>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A462] font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C8A462]" /> Education
              </h3>
              <div className="warm-panel-subtle p-4 rounded-xl border border-[#E6DECE]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[#F6F3ED]">University of California, Los Angeles (UCLA)</h4>
                    <p className="text-xs text-[#A8A294]">B.S. in Computer Science & Linguistics</p>
                  </div>
                  <span className="text-xs font-mono text-[#C8A462]">Expected 2030</span>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A462] font-bold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C8A462]" /> Experience & Leadership
              </h3>
              <div className="space-y-3">
                <div className="warm-panel-subtle p-4 rounded-xl border border-[#E6DECE]/5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-[#F6F3ED]">Founder & Head Organizer</h4>
                    <span className="text-xs font-mono text-[#C8A462]">2022 — Present</span>
                  </div>
                  <p className="text-xs text-[#A8A294] mt-0.5">Peninsula Youth Tennis League & Tech Initiative</p>
                  <ul className="list-disc list-inside text-xs text-[#C2BCB0] mt-2 space-y-1">
                    <li>Organized junior competitive circuits across Northern California, handling logistics for 200+ participants.</li>
                    <li>Built live tournament brackets, automated match registration systems, and court scheduling tools.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A462] font-bold mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#C8A462]" /> Technical & Product Skills
              </h3>
              <div className="warm-panel-subtle p-4 rounded-xl border border-[#E6DECE]/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-mono text-[11px] text-[#A8A294] uppercase tracking-wider mb-1.5">Languages & Frameworks</h5>
                  <p className="text-[#DDD8CE]">TypeScript, React, Three.js / WebGL, Python, Node.js, Tailwind CSS</p>
                </div>
                <div>
                  <h5 className="font-mono text-[11px] text-[#A8A294] uppercase tracking-wider mb-1.5">Product & Analysis</h5>
                  <p className="text-[#DDD8CE]">Product Roadmapping, Wireframing, Quantitative User Analytics, A/B Testing</p>
                </div>
              </div>
            </section>
          </div>

          {/* Modal Action Bar */}
          <div className="mt-8 pt-4 border-t border-[#E6DECE]/10 flex items-center justify-between">
            <span className="text-xs font-mono text-[#8C8577]">Owen Kim • Portfolio CV</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#C8A462] text-[#161513] font-bold text-xs uppercase tracking-wider hover:bg-[#D6B575] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
