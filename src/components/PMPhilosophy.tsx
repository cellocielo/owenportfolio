import React from 'react';
import { Compass, ShieldCheck, Zap, Award, BookOpen, Trophy } from 'lucide-react';

export const PMPhilosophy: React.FC = () => {
  const principles = [
    {
      icon: <Zap className="w-5 h-5 text-[#CCFF00]" />,
      tennisConcept: 'Split Step & First Step Readiness',
      pmPrinciple: 'Agile Discovery & Rapid Synthesis',
      description:
        'In tennis, the split step primes you to react to any trajectory. In product, continuous discovery and user interviews prime teams to pivot quickly without losing forward momentum.',
    },
    {
      icon: <Compass className="w-5 h-5 text-[#CCFF00]" />,
      tennisConcept: 'String Tension Calibration',
      pmPrinciple: 'Balancing Speed vs. Engineering Rigor',
      description:
        'Tighter strings yield surgical pinpoint control; looser strings maximize power and depth. Product strategy requires calibrating tension between tech debt, speed to market, and UX fidelity.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />,
      tennisConcept: 'Unforced Error Elimination',
      pmPrinciple: 'Relentless Operational Execution',
      description:
        'Championship matches are rarely won on flashy winners alone—they are won by minimizing unforced errors. Clean data models, automated QA, and disciplined documentation guarantee consistent delivery.',
    },
  ];

  const credentials = [
    {
      icon: <BookOpen className="w-4 h-4 text-[#CCFF00]" />,
      title: 'University of California, Los Angeles (UCLA)',
      detail: 'B.S. Linguistics & Computer Science • Expected 2030',
    },
    {
      icon: <Award className="w-4 h-4 text-[#CCFF00]" />,
      title: 'Mountain View High School',
      detail: 'GPA: 3.98 • SAT: 1540 • Athletic Council Representative',
    },
    {
      icon: <Trophy className="w-4 h-4 text-[#CCFF00]" />,
      title: 'Competitive Tennis Accomplishments',
      detail: 'USTA Sectionals Champion • 2021 4-Star Recruit • Varsity Captain (Singles 1)',
    },
  ];

  return (
    <section
      id="philosophy-section"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-[#090A0F] border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-[#FAFAFA]">
            Court Strategy as Product Leadership
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Tactical patience, spatial awareness, and decisive execution under pressure.
          </p>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {principles.map((p, idx) => (
            <div
              key={idx}
              className="p-6 md:p-7 rounded-2xl glass-panel hover:neon-border transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#CCFF00]/40 transition-colors">
                  {p.icon}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#CCFF00] font-bold block mb-1">
                  {p.tennisConcept}
                </span>
                <h3 className="text-base font-bold text-[#FAFAFA] mb-2 tracking-tight">
                  {p.pmPrinciple}
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Academic & Athletic Grounding Bar */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#CCFF00] font-bold block mb-1">
                Background & Foundation
              </span>
              <h3 className="text-xl font-extrabold text-[#FAFAFA] tracking-tight">
                Owen Kim • Palo Alto & Los Angeles
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
                Synthesizing formal computer science systems, human language semantics, and non-profit operational scale.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              {credentials.map((cred, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl glass-panel-subtle border border-white/10 flex flex-col justify-center"
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-xs font-semibold text-[#FAFAFA]">
                    {cred.icon}
                    <span className="truncate">{cred.title}</span>
                  </div>
                  <span className="text-[11px] text-[#A1A1AA] leading-snug">
                    {cred.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
