import { AuditScene, Difficulty, IshikawaCategory, IshikawaProblem, Achievement } from './types';

export const LEVEL_THRESHOLDS = [0, 1000, 2500, 4500, 7000, 10000];

export const TRANSLATIONS = {
  cs: {
    menu: {
      dashboard: "Nástěnka",
      factoryMap: "Mapa Továrny",
      workplaceHub: "Tréninkové Centrum",
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
    hub: {
      title: "Centrum Pracoviště",
      subtitle: "Vyber si mezi tréninkovou simulací nebo aplikací Lean v reálném prostředí.",
      realWorld: "Reálná Akce",
      realWorldDesc: "Řeš skutečné problémy na pracovišti pomocí AI.",
      createRedTag: "Vytvořit Červený Štítek",
      createRedTagDesc: "Naskenuj nepořádek. AI vygeneruje standardní štítek pro 5S tabuli.",
      solveProblem: "Vyřešit Můj Problém",
      solveProblemDesc: "Zadej reálný problém. Použij Ishikawa diagram a AI k nalezení příčin.",
      simulation: "Tréninkové Simulace",
      virtualAudit: "5S Virtuální Audit",
      virtualAuditDesc: "Procvič si identifikaci plýtvání v bezpečném prostředí.",
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
      redTags: "Červené Štítky",
      available: "Dostupné"
    }
  },
  en: {
    menu: {
      dashboard: "Dashboard",
      factoryMap: "Factory Map",
      workplaceHub: "Training Hub",
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
    hub: {
      title: "Workplace Hub",
      subtitle: "Choose between training simulations or apply Lean to your real environment.",
      realWorld: "Real World Action",
      realWorldDesc: "Solve actual problems in your workplace using AI.",
      createRedTag: "Create 5S Red Tag",
      createRedTagDesc: "Scan a real messy area. AI generates a standard Red Tag for your 5S board.",
      solveProblem: "Solve My Problem",
      solveProblemDesc: "Input a real factory issue. Use the Fishbone tool & AI to find root causes.",
      simulation: "Training Simulations",
      virtualAudit: "5S Virtual Audit",
      virtualAuditDesc: "Practice identifying waste in a safe, virtual environment.",
      ishikawaSim: "Root Cause Analysis",
      ishikawaSimDesc: "Learn the 6M framework by solving historical factory problems.",
      start: "Start",
      backendConnected: "BACKEND CONNECTED"
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
      redTags: "Red Tags",
      available: "Available"
    }
  }
};

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