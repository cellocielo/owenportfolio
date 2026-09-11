/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { RacketEngineSection } from './components/RacketEngineSection';
import { ProjectsPage } from './components/ProjectsPage';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { RacketZone, ProjectHighlight } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'projects'>('home');
  const [selectedZone, setSelectedZone] = useState<RacketZone>('sweetSpot');
  const [selectedProject, setSelectedProject] = useState<ProjectHighlight | null>(null);

  const handleNavigateToProjects = (zone: RacketZone) => {
    setSelectedZone(zone);
    setCurrentView('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRacket = () => {
    setCurrentView('home');
    setTimeout(() => {
      const element = document.getElementById('court-engine');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#161513] text-[#F6F3ED] selection:bg-[#C8A462] selection:text-[#161513] overflow-x-hidden font-sans">
      {/* 
        NO NAVBAR: Entire navbar is removed as requested by the user.
        NO COURT STRATEGY PAGE: Court strategy page has been removed as requested.
      */}

      {currentView === 'home' ? (
        <main>
          {/* Section 1: Hero Landing Page with nostalgic video overlay & downward scroll animation */}
          <HeroSection />

          {/* Section 2: Interactive 3D Tennis Racket Engine */}
          <RacketEngineSection onNavigateToProjects={handleNavigateToProjects} />

          {/* Footer */}
          <Footer />
        </main>
      ) : (
        /* Entirely New Dedicated Projects Page */
        <ProjectsPage
          initialZone={selectedZone}
          onBackToRacket={handleBackToRacket}
          onSelectProjectModal={(project) => setSelectedProject(project)}
        />
      )}

      {/* Detail Modal for in-depth inspection of any project */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
