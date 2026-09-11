export interface PaperSection {
  id: string;
  title: string;
  content: string[];
}

export interface PaperData {
  title: string;
  subtitle: string;
  authors: string[];
  institution: string;
  abstract: string;
  sections: PaperSection[];
  figures: {
    id: string;
    caption: string;
    imageUrl: string;
  }[];
}

export const avFrameworkPaper: PaperData = {
  title: 'Designing an Auditory Feedback Framework in Level 3 Autonomous Vehicles',
  subtitle: 'Literature Review & Situational Multi-Variable Feedback Model',
  authors: ['Owen Kim'],
  institution: 'Santa Clara University / Human-Computer Interaction Research',
  abstract:
    'As the world’s leading technology companies such as Tesla and Google continue to advance autonomous vehicle (AV) systems, the prevalence of Level 3 autonomous vehicles is expected to increase significantly. As these systems become more common, driver safety remains a critical concern, particularly in situations requiring transitions of control between the vehicle and the human driver. Human–computer interaction (HCI) research has increasingly examined how interface design influences driver awareness and reaction in such contexts.\n\nThis literature review synthesizes prior research on auditory feedback in autonomous vehicles, focusing on how variations in audio design parameters, such as timing, urgency, and modality, affect driver perception and reaction time. Drawing from existing studies, the review organizes key findings into an adaptive, situation-based auditory feedback framework intended to balance safety and practical usability. By consolidating prior research into a unified conceptual model, this work highlights design considerations and gaps that are relevant to future AV interface development.',
  figures: [
    {
      id: 'flowchart-fig',
      caption: 'Figure 1 & Figure 2: Situational Adaptive Auditory Warning Decision Tree (Low Urgency Continuous Feedback vs. High Urgency Take-Over Scenarios)',
      imageUrl: '/av_framework_ss.png'
    }
  ],
  sections: [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: [
        'As AVs become more advanced, we are reaching a point where drivers can become hands-off and let autonomous systems take control. Many benefits arise from this. First, AVs increase safety and reduce accidents. Most accidents result from human error, and vehicle safety technologies like the automatic emergency brake assistant have been statistically proven to reduce accidents. Additionally, the driver is free to do other things like work, engage in entertainment, or relax, as they do not need to supervise the vehicle (unless prompted to) (Brenner and Herrmann, 2018).',
        'However, in route to achieving completely autonomous vehicles that don’t need human intervention, there is inevitably a period during the development of AVs where AVs are in control but require human intervention at any given moment. This AV is defined as level 3, according to the Society of Automotive Engineering (SAE). Level 3 AVs are particularly challenging in ensuring safety because they require a shift in control between the autonomous system and the driver. In AV levels 1-2, although the autonomous system is implemented, the driver supervises it and is aware of their surroundings at all times. In contrast, level 3 AVs allow the driver to disengage with the wheel. Consequently, the driver’s situational awareness drops, making it difficult for the driver to regain control safely.',
        'This highlights the need for feedback to help the driver regain control smoothly and safely. Feedback can be presented in haptic, visual, and auditory forms, each with unique benefits. Visual feedback isn’t very effective because the driver is likely occupied in a secondary task, where their eyes are distracted. While haptic feedback can be felt at any moment, it is difficult to convey information haptically. In level 3 AVs, auditory feedback is the most valuable. This is supported by a study finding that in level 3 AVs, auditory feedback had 94% accuracy, while tactile feedback had 88% accuracy and visual feedback had 40% accuracy (Politis et al., 2015).',
        'Additionally, internal and external factors play a huge role in driver take-over. Some internal factors are driver fatigue, the presence of a secondary task, and nervousness. Some external factors are weather conditions and the direction of potential danger. By considering these factors, designers can develop auditory feedback that maximally ensures safe driver take-over.',
        'We present a systematic overview of the current research on auditory feedback in AVs. We begin by reviewing the parameters of auditory design, the psychological concepts behind them, and how they impact the driver. After reviewing the components of auditory feedback and their benefits, we develop an adaptive auditory warning system design taking into account situational factors to produce an optimal auditory sound.'
      ]
    },
    {
      id: 'forms-of-feedback',
      title: '2. Forms of Auditory Feedback',
      content: [
        'Auditory feedback can be classified into two groups: non-verbal sounds and verbal sounds. These can be further classified into four subgroups: auditory icons and earcons (non-verbal), and speech and spearcons (verbal) (Dingler et al., 2008).',
        'Auditory icons are nonverbal sounds that convey simple, iconic sounds that are common in everyday life. For example, the crumpling of paper symbolizes the deletion of a computer file. Similar to visual icons which are more distinctive and quickly processed than visual text, auditory icons are more easily identifiable than speech (Dingler et al., 2008). Auditory icons have proven to have been successful in the AV setting, improving driver performance compared to conventional warning tones (Belz et al., 1999).',
        'Yet, auditory icons are limited to well-known sounds that humans are often exposed to. To convey more specific and complex meanings, researchers have developed "earcons." Earcons are abstract, synthetic tones that can be used in structured combinations to create sound messages representing parts of an interface. Earcons modulate parameters like pitch, repetition, and timbre. However, studies have shown earcons resulted in slower response times and less accuracy than auditory icons (McKeown and Isherwood, 2007) due to arbitrary associations.',
        'Speech, the presentation of words, is another form of auditory feedback. Research has shown speech is less effective than icons/earcons in emergency scenarios because it is harder to localize and takes longer to process (Walker and Lindsay, 2003). However, learnability for speech is exceptionally high. Therefore, speech is optimal for non-emergency continuous feedback and building driver trust.',
        'Spearcons are speech sped up until incomprehensible while preserving cadence, rhythm, and acoustic envelope. Studies demonstrate spearcons achieve faster reaction times and high learning rates in menu and command structures (Walker et al., 2013).'
      ]
    },
    {
      id: 'continuous-feedback',
      title: '3. Continuous Auditory Feedback',
      content: [
        'Continuous feedback gives the user a constant input of information about vehicle status. Studies demonstrate that continuous auditory feedback yields high situational awareness (Rosati et al., 2012).',
        'However, audio can become annoying when repeated incessantly. Cognitive load theory states that high perceived cognitive demands can amplify annoyance (Sweller, 2011; Ellermeier et al., 2020). Sustained auditory processing causes mental fatigue and decreased responsiveness. Thus, continuous auditory feedback in AVs must maintain subtlety, calibrated intervals (20-30 seconds), and adaptive emotional valence.'
      ]
    },
    {
      id: 'sonification-emotion',
      title: '4. Sonification of Emotion',
      content: [
        'Music and acoustic structure provoke emotional and physiological mechanisms through brainstem reflexes, evaluative conditioning, emotional contagion, visual imagery, episodic memory, and musical expectancy (Juslin and Västfjäll, 2008).',
        'Brainstem reflexes and emotional contagion are involuntary and instantaneous—crucial for sub-second take-over transitions in autonomous driving. By varying volume, repetition rate, harmonic structure, and frequency, auditory cues elicit calibrated states: negative valences (anxiety/alertness) trigger instant takeover during imminent danger, while warm, positive valences sustain calm during nominal cruising.'
      ]
    },
    {
      id: 'driver-trust',
      title: '5. Driver Trust: Overtrust vs. Distrust',
      content: [
        'Smooth interaction requires balancing two detrimental failure modes: distrust (which leads to unnecessary driver interventions, speed oscillations, and abandonment) and overtrust (where drivers disregard system operating boundaries and engage in reckless distraction).',
        'Multimodal audio-visual feedback consistently generates the healthiest calibrated trust profile over visual-only displays. Courteous speech and clear acoustic state boundaries prevent both overreliance and panic.'
      ]
    },
    {
      id: 'spatialization',
      title: '6. Auditory Spatialization & 3D Acoustics',
      content: [
        'Auditory spatialization leverages 3-dimensional binaural head-related transfer functions (HRTF) to convey directional hazard data instantly. In low visibility conditions (fog, night, torrential rain), spatialized audio lets drivers instinctively look in the direction of the hazard before visual confirmation is possible, reducing reaction times by over 250ms.'
      ]
    },
    {
      id: 'measures-optimal-audio',
      title: '7. Measures for Optimal Audio: Urgency & Situational Awareness',
      content: [
        'The driver take-over sequence consists of three distinct phases: Look Up, Take Control, and Respond. Urgency governs the speed of the first two phases, while situational awareness (SA) dictates the accuracy of the final response.',
        'Excessive urgency can induce cognitive freezing or panicked over-steering (Jeon et al., 2022). Using the Situation Awareness Global Assessment Technique (SAGAT), auditory cues are calibrated to achieve the optimal trade-off point between reaction velocity and cognitive composure.'
      ]
    },
    {
      id: 'adaptive-framework',
      title: '8. Developing the Adaptive Framework',
      content: [
        'The situational decision tree branches first on urgency level (Low Urgency nominal vs. High Urgency imminent hazard). Low urgency triggers continuous feedback using speech (for tentative drivers) or subtle earcons (for experienced drivers). High urgency bypasses speech entirely to deploy spatialized, high-inharmonicity auditory icons.',
        'Secondary branches evaluate driver age (subtly increasing urgency gradients for older demographics to counter latency) and environmental conditions (elevating gain in rain/snow ambient noise, and activating binaural spatialization in zero-visibility fog).'
      ]
    },
    {
      id: 'implementation-conclusion',
      title: '9. Implementation & Conclusion',
      content: [
        'Autonomous driving platforms equipped with in-cabin computer vision sensors dynamically compute driver gaze, fatigue, and external telemetry to select the optimal acoustic archetype. A continuous heartbeat frequency of 20–30 seconds ensures alertness without auditory fatigue.',
        'By harmonizing technological sensor inputs with cognitive psychology and psychoacoustics, this framework provides a foundation for safer human-machine transitions in Level 3 autonomous vehicles.'
      ]
    }
  ]
};
