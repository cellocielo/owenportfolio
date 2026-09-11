export type RacketZone = 'sweetSpot' | 'strings' | 'dampener' | 'frame' | 'grip';

export interface ProjectImage {
  id: string;
  caption?: string;
  imageUrl?: string;
  aspectRatio?: 'video' | 'wide' | 'square';
  isVideo?: boolean;
  height?: string;
  objectPosition?: string;
  className?: string;
}

export interface ProjectHighlight {
  id?: string;
  name: string;
  badge: string;
  highlights: string[];
  summary?: string;
  stats?: string[];
  skills?: string[];
  images?: ProjectImage[];
  link?: string;
  url?: string;
  links?: {
    label: string;
    url?: string;
    type?: 'slides' | 'demo' | 'paper' | 'github' | 'external';
  }[];
}

export interface ZoneData {
  id: RacketZone;
  title: string;
  subtitle: string;
  label: string;
  metaphor: string;
  racketSpec: string;
  projects: ProjectHighlight[];
}

export type PortfolioContent = Record<RacketZone, ZoneData>;
