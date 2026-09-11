import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoneData, ProjectHighlight } from '../types';
import { 
  Sparkles, 
  GitCommit, 
  Cpu, 
  Target, 
  ArrowUpRight, 
  Layers, 
  Activity,
  Disc
} from 'lucide-react';
import { ProjectMediaGallery } from './ProjectMediaGallery';

interface ContentPanelProps {
  zoneData: ZoneData;
  onSelectProject?: (project: ProjectHighlight) => void;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ zoneData, onSelectProject }) => {
  const getZoneIcon = (id: string) => {
    switch (id) {
      case 'sweetSpot':
        return <Target className="w-4 h-4 text-[#CCFF00]" />;
      case 'strings':
        return <GitCommit className="w-4 h-4 text-[#CCFF00]" />;
      case 'dampener':
        return <Disc className="w-4 h-4 text-[#CCFF00]" />;
      case 'frame':
        return <Cpu className="w-4 h-4 text-[#CCFF00]" />;
      case 'grip':
        return <Sparkles className="w-4 h-4 text-[#CCFF00]" />;
      default:
        return <Activity className="w-4 h-4 text-[#CCFF00]" />;
    }
  };

  return (
    <div className="w-full flex flex-col justify-start">
      <AnimatePresence mode="wait">
        <motion.div
          key={zoneData.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col space-y-6"
        >
          {/* Streamlined Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                {getZoneIcon(zoneData.id)}
                <span>{zoneData.title}</span>
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAFAFA] mb-1">
              {zoneData.subtitle}
            </h4>

            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed mt-1">
              {zoneData.metaphor}
            </p>
          </div>

          {/* Project List */}
          <div className="flex flex-col space-y-4">
            {zoneData.projects.map((project, idx) => (
              <motion.div
                key={`${zoneData.id}-${project.name}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={() => onSelectProject && onSelectProject(project)}
                id={`project-card-${idx}`}
                className="group relative p-5 sm:p-6 rounded-xl glass-panel-subtle hover:glass-panel border border-white/10 hover:border-[#CCFF00]/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_18px_rgba(204,255,0,0.18)]"
              >
                {/* Arrow up right */}
                <div className="absolute top-5 right-5 text-[#A1A1AA] group-hover:text-[#CCFF00] transition-colors">
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="flex flex-col space-y-2 pr-6">
                  <span className="text-base font-bold text-[#FAFAFA] group-hover:text-[#CCFF00] transition-colors tracking-tight">
                    {project.name}
                  </span>
                  {project.summary && (
                    <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed group-hover:text-[#D4D4D8] transition-colors line-clamp-3">
                      {project.summary}
                    </p>
                  )}
                  {project.images && project.images.length > 0 && (
                    <ProjectMediaGallery images={project.images} isCompact className="mt-3" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
