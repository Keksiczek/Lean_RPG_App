import { AuditScene, LPAAudit, Difficulty, IshikawaCategory, IshikawaProblem, Achievement, Skill, Workplace } from './types';

export const LEVEL_THRESHOLDS = [0, 1000, 2500, 4500, 7000, 10000];

export const TRANSLATIONS = {
  cs: {
    menu: {
      dashboard: "Nástěnka",
      factoryMap: "Mapa Továrny",
      workplaceHub: "Tréninkové Centrum",
      tasks: "Akční Plán",
      skills: "Dovednosti",
      leaderboard: "Žebříček",
      player: "Hráč",
      signOut: "Odhlásit se"
    },
    dashboard: {
      title: "Nástěnka",
      welcome: "Vítej zpět, CI Specialisto.",
      totalXp: "Celkem XP",
      level: "Úroveň",
      completed: "Hotovo",
      avgScore: "Prům. Skóre",
      trophyCase: "Síň Slávy",
      performance: "Trend Výkonnosti",
      recentActivity: "Nedávná Aktivita",
      noActivity: "Žádné nedávné hry.",
      game: "Hra",
      score: "Skóre"
    },
    tasks: {
      title: "Akční Plán Nápravných Opatření",
      subtitle: "Spravuj neshody z 5S auditů, LPA a Ishikawa analýz.",
      create: "Nový Úkol",
      status: {
        open: "Otevřeno",
        in_progress: "V řešení",
        done: "Hotovo"
      },
      priority: "Priorita",
      assignee: "Odpovědná osoba",
      dueDate: "Termín",
      source: "Zdroj",
      save: "Uložit Úkol",
      cancel: "Zrušit",
      filterAll: "Vše",
      filterMy: "Moje Úkoly",
      noTasks: "Všechny úkoly vyřešeny! Skvělá práce."
    },
    leaderboard: {
      title: "Výsledková Tabulka",
      subtitle: "Nejlepší CI Specialisté v továrně.",
      rank: "Pořadí",
      player: "Hráč",
      level: "Úroveň",
      score: "Skóre",
      xp: "XP",
      top3: "Top 3 Specialisté"
    },
    hub: {
      title: "Centrum Pracoviště",
      subtitle: "Vyber si mezi tréninkovou simulací nebo aplikací Lean v reálném prostředí.",
      realWorld: "Reálná Akce",
      realWorldDesc: "Řeš skutečné problémy na pracovišti pomocí AI.",
      createRedTag: "Vytvořit Červený Štítek",
      createRedTagDesc: "Naskenuj nepořádek. AI vygeneruje standardní štítek pro 5S tabuli.",
      runLPA: "Provést LPA",
      runLPADesc: "Ověř dodržování procesů a bezpečnosti pomocí kamery.",
      solveProblem: "Vyřešit Můj Problém",
      solveProblemDesc: "Zadej reálný problém. Použij Ishikawa diagram a AI k nalezení příčin.",
      simulation: "Tréninkové Simulace",
      virtualAudit: "5S Virtuální Audit",
      virtualAuditDesc: "Procvič si identifikaci plýtvání v bezpečném prostředí.",
      virtualLPA: "LPA Simulátor",
      virtualLPADesc: "Trénuj vrstvené procesní audity pomocí kontrolních seznamů.",
      ishikawaSim: "Analýza Kořenových Příčin",
      ishikawaSimDesc: "Nauč se metodu 6M řešením historických problémů.",
      start: "Spustit",
      backendConnected: "BACKEND PŘIPOJEN"
    },
    map: {
      title: "Digitální Dvojče Továrny",
      subtitle: "Monitoruj stav 5S a přistupuj k tréninku dle lokace.",
      zones: {
        optimal: "Optimální",
        warning: "Varování",
        critical: "Kritické"
      },
      scan: "Skenovat",
      train: "Trénovat",
      lpa: "LPA Audit",
      redTags: "Červené Štítky",
      available: "Dostupné"
    },
    skills: {
      title: "Strom Dovedností",
      subtitle: "Odemkni pokročilé Lean schopnosti získáváním zkušeností a plněním úkolů.",
      locked: "ZAMČENO",
      unlocked: "AKTIVNÍ",
      progress: "Postup",
      requirements: "Požadavky",
      benefit: "Bonus"
    },
    chatbot: {
      title: "Lean Sensei",
      status: "Online",
      welcome: "Ahoj! Já jsem tvůj Lean Sensei. Zeptej se mě na cokoliv ohledně 5S, Kaizen nebo řešení problémů v továrně! 🏭✨",
      placeholder: "Zeptej se na Lean...",
      send: "Odeslat"
    }
  },
  en: {
    menu: {
      dashboard: "Dashboard",
      factoryMap: "Factory Map",
      workplaceHub: "Training Hub",
      tasks: "Action Plan",
      skills: "Skills",
      leaderboard: "Leaderboard",
      player: "Player",
      signOut: "Sign Out"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back, CI Specialist.",
      totalXp: "Total XP",
      level: "Level",
      completed: "Completed",
      avgScore: "Avg Score",
      trophyCase: "Trophy Case",
      performance: "Performance Trend",
      recentActivity: "Recent Activity",
      noActivity: "No recent games played.",
      game: "Game",
      score: "Score"
    },
    tasks: {
      title: "Corrective Action Plan",
      subtitle: "Manage non-conformities from 5S audits, LPA, and Ishikawa.",
      create: "New Task",
      status: {
        open: "Open",
        in_progress: "In Progress",
        done: "Done"
      },
      priority: "Priority",
      assignee: "Assignee",
      dueDate: "Due Date",
      source: "Source",
      save: "Save Task",
      cancel: "Cancel",
      filterAll: "All",
      filterMy: "My Tasks",
      noTasks: "All tasks resolved! Great job."
    },
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Top CI Specialists in the factory.",
      rank: "Rank",
      player: "Player",
      level: "Level",
      score: "Score",
      xp: "XP",
      top3: "Top 3 Specialists"
    },
    hub: {
      title: "Workplace Hub",
      subtitle: "Choose between training simulations or apply Lean to your real environment.",
      realWorld: "Real World Action",
      realWorldDesc: "Solve actual problems in your workplace using AI.",
      createRedTag: "Create 5S Red Tag",
      createRedTagDesc: "Scan a real messy area. AI generates a standard Red Tag for your 5S board.",
      runLPA: "Conduct LPA",
      runLPADesc: "Verify process & safety compliance using camera vision.",
      solveProblem: "Solve My Problem",
      solveProblemDesc: "Input a real factory issue. Use the Fishbone tool & AI to find root causes.",
      simulation: "Training Simulations",
      virtualAudit: "5S Virtual Audit",
      virtualAuditDesc: "Practice identifying waste in a safe, virtual environment.",
      virtualLPA: "LPA Simulator",
      virtualLPADesc: "Train Layered Process Audits with standard checklists.",
      ishikawaSim: "Root Cause Analysis",
      ishikawaSimDesc: "Learn the 6M framework by solving historical factory problems.",
      start: "Start",
      backendConnected: "BACKEND PŘIPOJEN"
    },
    map: {
      title: "Factory Digital Twin",
      subtitle: "Monitor 5S status and access training modules by location.",
      zones: {
        optimal: "Optimal",
        warning: "Warning",
        critical: "Critical"
      },
      scan: "Scan",
      train: "Train",
      lpa: "LPA Audit",
      redTags: "Red Tags",
      available: "Available"
    },
    skills: {
      title: "Skill Tree",
      subtitle: "Unlock advanced Lean capabilities by gaining experience and completing tasks.",
      locked: "LOCKED",
      unlocked: "ACTIVE",
      progress: "Progress",
      requirements: "Requirements",
      benefit: "Benefit"
    },
    chatbot: {
      title: "Lean Sensei",
      status: "Online",
      welcome: "Hello! I am your Lean Sensei. Ask me anything about 5S, Kaizen, or factory problem solving! 🏭✨",
      placeholder: "Ask about Lean...",
      send: "Odeslat"
    }
  }
};

export const AVAILABLE_SKILLS: Skill[] = [
  {
    id: '5s_master',
    title: '5S Master Auditor',
    description: 'Expertise in identifying workplace waste and organization issues instantly.',
    benefit: 'Visual Audit Hint: Highlights one missed item in 5S games.',
    icon: 'ScanEye',
    requirements: {
      auditCount: 5,
      level: 2
    }
  },
  {
    id: 'lpa_pro',
    title: 'LPA Professional',
    description: 'Consistent execution of Layered Process Audits ensuring standard work.',
    benefit: 'Audit Speed: +10% score for fast LPA completion.',
    icon: 'ClipboardList',
    requirements: {
      level: 3,
      totalScore: 3000
    }
  },
  {
    id: 'root_cause_analyst',
    title: 'Root Cause Analyst',
    description: 'Deep understanding of the 6M framework and causal relationships.',
    benefit: 'Ishikawa Insight: Auto-fills one category in Ishikawa diagrams.',
    icon: 'GitBranch',
    requirements: {
      ishikawaCount: 5,
      level: 3
    }
  },
  {
    id: 'kaizen_leader',
    title: 'Kaizen Leader',
    description: 'Demonstrated leadership in continuous improvement initiatives.',
    benefit: 'XP Multiplier: Earn +10% XP from all training modules.',
    icon: 'TrendingUp',
    requirements: {
      totalScore: 5000,
      level: 4
    }
  },
  {
    id: 'efficiency_expert',
    title: 'Efficiency Expert',
    description: 'Mastery of flow and standard work principles.',
    benefit: 'Time Bonus: +30 seconds in timed challenges.',
    icon: 'Timer',
    requirements: {
      level: 5
    }
  }
];

export const AVAILABLE_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first training module.',
    icon: 'Footprints'
  },
  {
    id: 'junior_auditor',
    title: 'Junior Auditor',
    description: 'Complete a 5S Audit with a perfect score (100%).',
    icon: 'ClipboardCheck'
  },
  {
    id: 'process_guardian',
    title: 'Process Guardian',
    description: 'Complete 3 LPA audits.',
    icon: 'ShieldCheck'
  },
  {
    id: 'problem_solver',
    title: 'Problem Solver',
    description: 'Complete an Ishikawa Analysis.',
    icon: 'BrainCircuit'
  },
  {
    id: 'lean_enthusiast',
    title: 'Lean Enthusiast',
    description: 'Reach Level 2.',
    icon: 'Zap'
  },
  {
    id: 'consistency',
    title: 'Consistent Improver',
    description: 'Complete 5 training modules.',
    icon: 'Repeat'
  },
  {
    id: 'master_mind',
    title: 'Kaizen Master',
    description: 'Reach Level 5.',
    icon: 'Crown'
  }
];

export const WORKPLACES: Workplace[] = [
  {
    id: 'wp-1',
    name: 'Assembly Line A',
    type: 'production',
    coordinates: { x: 20, y: 30 },
    status: 'warning',
    redTags: 2,
    activeTrainingModules: 1,
    checklist: [
      "Walkways are clear of boxes",
      "Tools are in shadow boards",
      "No oil leaks on floor"
    ]
  },
  {
    id: 'wp-2',
    name: 'Paint Shop',
    type: 'production',
    coordinates: { x: 50, y: 20 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 2,
    checklist: [
      "Ventilation filters checked",
      "Paints stored in fireproof cabinet",
      "PPE available at entrance"
    ]
  },
  {
    id: 'wp-3',
    name: 'Warehouse Dispatch',
    type: 'logistics',
    coordinates: { x: 80, y: 40 },
    status: 'critical',
    redTags: 5,
    activeTrainingModules: 1,
    checklist: [
      "Forklift charging area clear",
      "Pallets stacked max 3 high",
      "Aisle markings visible",
      "Expired goods separated"
    ]
  },
  {
    id: 'wp-4',
    name: 'QA Lab',
    type: 'quality',
    coordinates: { x: 30, y: 70 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 1,
    checklist: [
      "Calibration stickers valid",
      "Desk surfaces clear",
      "Samples labeled correctly"
    ]
  },
  {
    id: 'wp-5',
    name: 'Manager Office',
    type: 'office',
    coordinates: { x: 70, y: 75 },
    status: 'warning',
    redTags: 1,
    activeTrainingModules: 0,
    checklist: [
      "Confidential files locked",
      "Whiteboards updated",
      "Meeting room chairs arranged"
    ]
  }
];

export const AUDIT_SCENES: AuditScene[] = [
  {
    id: 'audit-1',
    title: 'Factory Floor - Zone A',
    description: 'The assembly area is cluttered. Identify items that need to be Sorted (removed) or Shined (cleaned).',
    difficulty: Difficulty.EASY,
    xpReward: 150,
    items: [
      { id: '1', name: 'Broken Wrench', status: 'broken', correctAction: 'remove' },
      { id: '2', name: 'Oil Spill', status: 'dirty', correctAction: 'clean' },
      { id: '3', name: 'Standard Tools', status: 'clean', correctAction: 'keep' },
      { id: '4', name: 'Scrap Metal', status: 'misplaced', correctAction: 'remove' },
      { id: '5', name: 'Safety Instructions', status: 'clean', correctAction: 'keep' },
    ]
  },
  {
    id: 'audit-2',
    title: 'Warehouse Dispatch',
    description: 'High traffic area. Focus on Standardization and Set in Order.',
    difficulty: Difficulty.MEDIUM,
    xpReward: 300,
    items: [
      { id: '6', name: 'Unlabeled Box', status: 'misplaced', correctAction: 'organize' },
      { id: '7', name: 'Pallet Jack (In Walkway)', status: 'misplaced', correctAction: 'organize' },
      { id: '8', name: 'Packing Tape', status: 'clean', correctAction: 'keep' },
      { id: '9', name: 'Old Shipping Labels', status: 'dirty', correctAction: 'clean' },
      { id: '10', name: 'Expired Inventory', status: 'broken', correctAction: 'remove' },
    ]
  }
];

export const LPA_AUDITS: LPAAudit[] = [
  {
    id: 'lpa-1',
    title: 'Daily Shift Start Check',
    description: 'Verify basic safety and operational readiness at the start of the shift.',
    frequency: 'Daily',
    xpReward: 100,
    questions: [
      { id: 'q1', question: 'Are operators wearing required PPE (Safety Glasses, Shoes)?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'q2', question: 'Is the work area free of trip hazards?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'q3', question: 'Are Standard Work Instructions (SWI) visible?', category: 'Process', correctAnswer: 'Yes' },
      { id: 'q4', question: 'Is the first piece inspection completed?', category: 'Quality', correctAnswer: 'Yes' }
    ]
  },
  {
    id: 'lpa-2',
    title: 'Welding Station Process Audit',
    description: 'Deep dive into welding parameters and material handling.',
    frequency: 'Weekly',
    xpReward: 250,
    questions: [
      { id: 'w1', question: 'Is the welding curtain fully closed?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'w2', question: 'Are current and voltage settings matching the control plan?', category: 'Process', correctAnswer: 'Yes' },
      { id: 'w3', question: 'Are raw materials stored in designated bins?', category: 'Material', correctAnswer: 'Yes' },
      { id: 'w4', question: 'Is the fume extraction system active?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'w5', question: 'Are scrap parts red-tagged immediately?', category: 'Quality', correctAnswer: 'Yes' }
    ]
  }
];

export const ISHIKAWA_PROBLEMS: IshikawaProblem[] = [
  {
    id: 'prob-1',
    title: 'High Defect Rate in Painting',
    description: 'The defect rate in the chassis painting booth has risen from 2% to 8% in the last week.',
    difficulty: Difficulty.MEDIUM,
    category: 'Quality'
  },
  {
    id: 'prob-2',
    title: 'Assembly Line Stoppage',
    description: 'Station 4 experiences frequent micro-stops (under 2 minutes) causing a 15% OEE loss.',
    difficulty: Difficulty.HARD,
    category: 'Production'
  }
];

export const ISHIKAWA_CATEGORIES = [
  IshikawaCategory.MAN,
  IshikawaCategory.MACHINE,
  IshikawaCategory.MATERIAL,
  IshikawaCategory.METHOD,
  IshikawaCategory.MEASUREMENT,
  IshikawaCategory.ENVIRONMENT,
];