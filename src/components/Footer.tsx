import React from 'react';
import { Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-8 px-4 sm:px-6 lg:px-8 bg-[#141311] border-t border-[#E6DECE]/10 text-[#A8A294]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#C8A462]" />
          <span className="text-xs font-serif font-medium tracking-wider text-[#F6F3ED] uppercase">
            Owen Kim
          </span>
          <span className="text-[#E6DECE]/20">/</span>
          <span className="text-[11px] font-mono text-[#8C8577]">
            UCLA CS & Linguistics '30
          </span>
        </div>

        {/* Right contact & back-to-top */}
        <div className="flex items-center space-x-4">
          <a
            href="mailto:owenkim2k8@ucla.edu"
            className="text-[11px] font-mono text-[#A8A294] hover:text-[#C8A462] transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-[#C8A462]" />
            <span>owenkim2k8@ucla.edu</span>
          </a>

          <button
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="p-2 rounded-full warm-panel-subtle hover:bg-[#25231F] border border-[#E6DECE]/15 hover:border-[#C8A462]/50 text-[#A8A294] hover:text-[#C8A462] transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
