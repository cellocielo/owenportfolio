import { PortfolioContent } from '../types';

export const portfolioData: PortfolioContent = {
  sweetSpot: {
    id: 'sweetSpot',
    title: 'The Sweet Spot',
    subtitle: 'High-Impact Metrics & Product Value',
    label: 'Core Value & High-Impact Metrics',
    metaphor: 'The point on the strings where power transfers perfectly. In product management, this represents my highest impact work driving user growth, delivering core value, and creating measurable results.',
    racketSpec: 'FSI Spin 16x19 String Bed • Cortex Pure Feel • Pure Aero 100 sq in Sweet Spot',
    projects: [
      {
        id: 'sweetspot-jamma',
        name: 'JAMMA Tennis',
        badge: 'Financial Growth',
        link: 'https://jammatennis.com',
        highlights: [
          '$46k raised in funds',
          'Community outreach & retention scaling'
        ],
        summary: 'Was an executive director of non-profit tennis organization coaching local youth. Through weekly clinics, fundraising, and social events, we fundraised $150k over four years. We were invited to the Micheal J. Fox event in New York for top fundraisers.',
        images: [
          {
            id: 'jamma-team-img',
            imageUrl: '/jamma_team_cooper_park.png'
          }
        ],
        stats: ['$46K+ Capital Raised', '100+ Athletes Coached', '4-Year Growth'],
        skills: ['Financial Modeling', 'Community Operations', 'Flyer & Brand Distribution', 'Retention Strategy']
      },
      {
        id: 'sweetspot-coaching',
        name: 'Coaching Tennis',
        badge: 'Mentorship & Human Connection',
        highlights: [
          'Work closely with students across all skill levels, breaking down technical mechanics with patience, empathy, and positive reinforcement',
          'Cultivate lasting, heartfelt relationships by celebrating small daily breakthroughs and fostering self-belief on and off the court'
        ],
        summary: 'I’ve cultivated some of my most heartfelt relationships coaching tennis. Coaching tennis means so much more than teaching proper technique and making my students run from line to line. It means listening intently to the stories my students would tell me during water breaks and doing what it takes bringing out my students’ passion for tennis.',
        images: [
          {
            id: 'coaching-img-1',
            imageUrl: '/IMG_1586.jpg'
          }
        ],
        stats: ['Patient Technical Instruction', 'Fostering Confidence', 'Heartfelt Mentorship'],
        skills: ['Empathic Mentorship', 'Individualized Pedagogy', 'Communication & Trust', 'Psychological Encouragement']
      },
      {
        id: 'tft-scaling',
        name: 'Tech For Tomorrow',
        badge: 'Scaling Stats',
        highlights: [
          'Scaled to 11 nationwide chapters',
          '$30k hardware refurbished',
          '$5k international emergency aid'
        ],
        summary: 'I drafted operational procedures for new chapter onboarding and collaborated with friends in Ukraine to send thousands of dollars of grant earnings to savED, aiding bombed Ukrainian communities with tech.',
        images: [
          {
            id: 'tft-scaling-img-1',
            imageUrl: '/IMG_3371.jpg'
          }
        ],
        stats: ['11 Chapters Nationwide', '$30,000 Refurbished Tech', '$5,000 Direct International Aid'],
        skills: ['Multi-Chapter GTM', 'Logistics Supply Chain', 'Stakeholder Management', 'Impact Auditing']
      },
      {
        id: 'tft-teaching',
        name: 'Tech For Tomorrow',
        badge: 'Teaching & Digital Literacy',
        highlights: [
          'Led student and community technology education workshops, developing accessible hands-on digital literacy curricula',
          'Taught foundational computing skills, software workflows, and guided students through hands-on hardware refurbishment'
        ],
        summary: 'I helped facilitate STEM digital literacy instruction, empowering underserved students and community members with technology education and foundational computing skills in Scratch.',
        images: [
          {
            id: 'tft-teaching-img-1',
            imageUrl: '/oakpickupimage2.jpg'
          }
        ],
        stats: ['Hands-On Digital Workshops', '500+ Students Instructed', 'Interactive Curriculum Design'],
        skills: ['Curriculum Development', 'Student Instruction', 'Digital Literacy Mentorship', 'Community Workshops']
      }
    ]
  },
  strings: {
    id: 'strings',
    title: 'The Strings',
    subtitle: 'Navigating Friction, Trade-offs & Priorities',
    label: 'Strategic Tension & Trade-offs',
    metaphor: 'Stringing higher tension gives control while lower tension gives power. In my work the strings represent making smart trade offs between speed and quality to hit the right target.',
    racketSpec: 'Babolat RPM Blast 16 (1.30mm) • 52 lbs Mains / 50 lbs Crosses • Clean Poly Matrix',
    projects: [
      {
        name: 'Nature-Based Recreational Apps (SIP 2025)',
        badge: 'User vs. Eco Friction',
        link: 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',
        highlights: [
          'Balanced rider UX engagement against ecological nature degradation constraints'
        ],
        summary: 'Great product design balances ambitious goals with real-world constraints. For the mountain biking prototype, that meant aligning rider engagement with practical trail sustainability so environmental protection feels like a natural part of the user experience.',
        images: [
          {
            id: 'nature-app-demo-video',
            imageUrl: '/cpm_08_prototype.mov',
            isVideo: true
          }
        ],
        stats: ['Constraint-Driven Product Design', 'Dual-Incentive Framework', 'Ecological Impact Literature Review'],
        skills: ['Behavioral Economics', 'Trade-off Modeling', 'User Advocacy vs Nature Conservation']
      },
      {
        name: 'Human-AI Collaboration Research (SIP 2026)',
        badge: 'Agency vs. Automation',
        link: 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',
        highlights: [
          'Researched and prototyped Figma AI tools balancing automated guidance with user creative agency'
        ],
        summary: 'Prototyped an AI design tool that assist designers without stripping away creative control.',
        images: [
          {
            id: 'cpm-06-img',
            imageUrl: '/cpm_06_ss.png'
          }
        ],
        stats: ['GPT-4o Multimodal Benchmark', 'Post-Task Interview Synthesis', 'Figma AI Workflow Prototype'],
        skills: ['Human-AI Interaction', 'Autoethnographic Research', 'Qualitative Analysis', 'Figma AI Plugins']
      },
      {
        name: 'JAMMA Tennis Strike System',
        badge: 'Operations & Governance',
        highlights: [
          'Balanced legal obligations, budget allocation, and community accountability strike systems'
        ],
        summary: 'Implemented an accountability strike system for volunteer coaches and clinic staff. Balancing accountability with leniency required understanding how it would affect both an individual coach and the organization as a whole.',
        images: [
          {
            id: 'jamma-strike-img',
            imageUrl: '/IMG_9961.jpg'
          }
        ],
        stats: ['Accountability Strike Framework', 'Legal Compliance Governance', 'Transparent Budgeting'],
        skills: ['Operational Governance', 'Conflict Resolution', 'Policy Architecture']
      }
    ]
  },
  frame: {
    id: 'frame',
    title: 'The Frame',
    subtitle: 'System Architecture, Code & Technical Foundations',
    label: 'System Architecture & Engineering',
    metaphor: 'Just as the carbon fibers and aerodynamic design of the frame give a racket its stability and power, this represents my technical foundation programming and designing systems that supports every feature.',
    racketSpec: 'Aeromodular3 Beam • 300g (10.6 oz) • 23-26mm Tapered Beam • NF²-Tech Flax Dampening',
    projects: [
      {
        name: 'Interactive 3D Unity Simulation',
        badge: 'Game Engine Dev',
        link: 'https://youtu.be/pECVg5tfTos',
        highlights: [
          'Coded a full interactive 3D virtual home simulation with visual object logic'
        ],
        summary: 'I designed an interactive virtual home environment in Unity using C# where users learn about sustainability through immersive animations. Click the link to see a demo!',
        images: [
          {
            id: 'unity-sim-img',
            imageUrl: '/unity_livingfootprints_ss.png'
          }
        ],
        stats: ['Custom C# Object Logic', '3D Spatial Audio & Physics', 'Integrated Educational Curricula'],
        skills: ['Unity / C#', '3D Scene Graph', 'Event-Driven Architecture', 'Interactive Logic']
      },
      {
        name: 'Spritz',
        badge: 'Web Application Dev',
        link: 'https://spritzfragranceapp.vercel.app/',
        highlights: [
          'Full-stack web application development, custom data schema handling, and dynamic UI chart rendering'
        ],
        summary: 'Inspired by my recent interest in collecting fragrances, I designed a mobile social media app called Spritz for fragrance fanatics. It allows users to showcase their collection digitally and see others’ collections.',
        images: [
          {
            id: 'spritz-img',
            imageUrl: '/spritz_ss.png'
          }
        ],
        stats: ['Dynamic Chart Vector Engine', 'Normalized Relational Data Schema', 'Low-Latency Filter Queries'],
        skills: ['TypeScript / React', 'API Engineering', 'Data Schema Design', 'Responsive SVG Visuals']
      },
      {
        name: 'L3 Autonomous Vehicle Auditory Framework',
        badge: 'Decision Systems',
        link: '#paper-l3-av',
        highlights: [
          'Built dynamic multi-variable decision models altering 3D audio alerts based on real-time driver vectors'
        ],
        summary: 'Curious about communication in autonomous vehicles, I investigated how to optimize audio specific to the driving situation at hand. Click the link to read the paper I wrote!',
        images: [
          {
            id: 'l3-av-framework-img',
            imageUrl: '/av_framework_ss.png'
          }
        ],
        stats: ['Multi-Variable Decision Alg', 'Spatial 3D Sound Alteration', 'Santa Clara Univ Collaboration'],
        skills: ['Decision Modeling', 'Spatial Acoustics', 'Human Factors Research', 'Algorithmic Logic']
      }
    ]
  },
  grip: {
    id: 'grip',
    title: 'The Grip',
    subtitle: 'Leadership, Operations & Go-To-Market',
    label: 'Execution, Go-To-Market & Leadership',
    metaphor: 'Control doesn’t mean micromanaging every part of the tennis swing, but setting the foundation before even swinging. The grip represents taking ownership and leading by setting the initial strategy and bringing stability to the team.',
    racketSpec: 'Babolat Syntec Pro Grip • Size 4 3/8 • Yellow Babolat Collar & Butt Cap',
    projects: [
      {
        id: 'grip-jamma',
        name: 'JAMMA Tennis',
        badge: 'Executive Leadership',
        link: 'https://jammatennis.com',
        highlights: [
          'Executive Director managing coaches, monthly community syncs, and distribution marketing'
        ],
        summary: 'As an executive director for JAMMA, I led monthly sync meetings, planned social events, and managed finances and legal obligations.',
        images: [
          {
            id: 'jamma-grip-img',
            imageUrl: '/jamma_team_cooper_park.png'
          }
        ],
        stats: ['Executive Team Oversight', 'Monthly Community Townhalls', 'End-to-End Clinic Operations'],
        skills: ['Executive Leadership', 'Coach Mentorship', 'Community Building', 'Marketing Strategy']
      },
      {
        id: 'tft-operations',
        name: 'Tech For Tomorrow',
        badge: 'Operational Logistics',
        highlights: [
          'Directed chapter setup, supply chain refurbishing, and international aid logistics'
        ],
        summary: 'As the chapter director of TechforTomorrow, I expanded chapter operations nationwide through new chapter starter guides and continuous check-ins. Due to differing regional policies, we create customized workarounds that contributed to our mission of spreading technology accessibility to underprivileged populations.',
        images: [
          {
            id: 'tft-grip-img',
            imageUrl: '/oakpickupimage2.jpg'
          }
        ],
        stats: ['National Chapter Playbook', 'Hardware QA Pipeline', 'International Customs Logistics'],
        skills: ['Operations Orchestration', 'Logistics Protocol', 'Rapid Chapter Onboarding']
      }
    ]
  },
  dampener: {
    id: 'dampener',
    title: 'The Vibration Dampener',
    subtitle: 'Interests, Equilibrium & Unwinding',
    label: 'Balance, Creativity & Unwinding',
    metaphor: 'The small insert in the strings that absorbs extra vibration and keeps every stroke stable. In my work, this represents my stabilizing forces through personal hobbies and creative outlets that keep me grounded, centered, and operating smoothly under pressure.',
    racketSpec: 'Silicone Kinetic Insert • Harmonic Shock Absorption • Balance & Flow',
    projects: [
      {
        name: 'Indoor Bouldering',
        badge: 'Physical Problem-Solving',
        link: 'https://kaya-app.kayaclimb.com/user/vamanos6871',
        highlights: [
          'Deconstruct boulder problems as physical algorithms—analyzing balance, dynamic movement, and route beta',
          'Cultivate acute spatial awareness, tactile grip strength, and resilience through repeated attempts'
        ],
        summary: 'Bouldering has exposed untrained gaps in my fitness. Nothing builds grip and forearm strength like hanging off small holds, and no two routes feel the same. Depending on the wall, one climb demands raw core tension while another relies entirely on hips and balance. I’ve been bouldering for a couple months now and still consider myself a beginner. Quite a humbling sport.',
        images: [
          {
            id: 'bouldering-img-1',
            imageUrl: '/IMG_0155.jpg'
          }
        ],
        stats: ['Route Beta Solving', 'Kinesthetic Balance', 'High-Focus Flow State'],
        skills: ['Route Reading (Beta)', 'Spatial Geometry', 'Kinesthetic Balance', 'Iterative Resilience']
      },
      {
        name: 'Denzel Curry Superfan',
        badge: 'Auditory Architecture',
        link: 'https://open.spotify.com/playlist/1B86vjWFKG2VQWsJFahaYm?si=d0a158a286624ef4',
        highlights: [
          'I’ve ran to the ground every one of his albums. How can one artist pivot from rapid-fire hungry flows over dark beats to meditative bars over jazz? And each style being something I dig. I’m really loving his new 2026 album “ii”, a sequel to Unlocked. Give it a listen, especially if you like MF Doom and Madlib. I’ve linked my “10s” playlist.'
        ],
        summary: 'I’ve ran to the ground every one of his albums. How can one artist pivot from rapid-fire hungry flows over dark beats to meditative bars over jazz? And each style being something I dig. I’m really loving his new 2026 album “ii”, a sequel to Unlocked. Give it a listen, especially if you like MF Doom and Madlib. I’ve linked my “10s” playlist.',
        images: [
          {
            id: 'music-img-1',
            imageUrl: '/denzel_pic_for_website.jpg'
          }
        ],
        stats: ['Stem & Layer Analysis', 'Harmonic Transitions', 'Acoustic & Electronic Breadth'],
        skills: ['Active Listening', 'Harmonic Analysis', 'Soundscape Design', 'Auditory Storytelling']
      },
      {
        name: 'Collecting Fragrances',
        badge: 'Olfactory Sensory Design',
        highlights: [
          'Curate niche and artisanal fragrance profiles across complex accord pyramids (top, heart, and base notes)',
          'Study how volatile aromachemicals evoke memory, setting tone and sensory presence throughout the day'
        ],
        summary: 'I treat fragrance as an invisible form of creative expression. Similar to how a specific track or album can anchor you to a memory, a single scent has that same ability to instantly pull you back to a distinct moment or era in your life. Exploring different fragrance notes and how they evolve led me to create ScentMatch, bridging my appreciation for scent with custom software.',
        images: [
          {
            id: 'fragrance-img-1',
            imageUrl: '/IMG_2826.jpg'
          }
        ],
        stats: ['Accord Architecture', 'Niche & Artisanal Notes', 'Origin Inspiration for ScentMatch'],
        skills: ['Sensory Evaluation', 'Accord Taxonomy', 'Memory & Mood Association', 'Aesthetic Discernment']
      },
      {
        name: 'Tennis',
        badge: 'Kinetic Focus & Flow',
        highlights: [
          'Translate footwork precision, racket head acceleration, and point construction into mental clarity',
          'Find meditation in competitive rallies, split-step timing, and clean sweet-spot ball pocketing'
        ],
        summary: 'Tennis is my escape paradise when I’ve had a long day. It’s one of the only activities that can make me forget about all my worries. It’s impact on my life has been indescribable.',
        images: [
          {
            id: 'tennis-img-1',
            imageUrl: '/DSC00474.jpg'
          },
          {
            id: 'tennis-img-2',
            imageUrl: '/IMG_1740.JPG'
          }
        ],
        stats: ['Bay Area Match Play', 'Point Tactical Construction', 'Sweet Spot Precision'],
        skills: ['Tactical Court Vision', 'Kinetic Acceleration', 'Mental Composure', 'Split-Second Execution']
      }
    ]
  }
};
