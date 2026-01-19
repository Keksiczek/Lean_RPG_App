
import { AuditScene, LPAAudit, Difficulty, IshikawaCategory, IshikawaProblem, Achievement, Skill, Workplace } from './types';

export const LEVEL_THRESHOLDS = [0, 1000, 2500, 4500, 7000, 10000];

// Added missing achievements list for gamification tracking
export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete your first training module.', icon: 'Zap' },
  { id: 'consistency', title: 'Consistency King', description: 'Complete 5 training modules in one week.', icon: 'Calendar' },
  { id: 'lean_enthusiast', title: 'Lean Enthusiast', description: 'Reach Level 2.', icon: 'Star' },
  { id: 'master_mind', title: 'Master Mind', description: 'Reach Level 5.', icon: 'Trophy' },
  { id: 'junior_auditor', title: 'Junior Auditor', description: 'Score 100% on a virtual audit.', icon: 'ClipboardList' },
  { id: 'problem_solver', title: 'Problem Solver', description: 'Complete your first Ishikawa diagram.', icon: 'GitBranch' },
  { id: 'speedster', title: 'Speedster', description: 'Complete a game in under 60 seconds.', icon: 'Timer' },
];

// Added missing skills list for progression system
export const AVAILABLE_SKILLS: Skill[] = [
  {
    id: 's1',
    title: '5S Specialist',
    description: 'Master the art of workplace organization.',
    benefit: '+10% XP from Audit games',
    icon: 'CheckCircle',
    requirements: { level: 2, auditCount: 5 }
  },
  {
    id: 's2',
    title: 'RCA Expert',
    description: 'Expertise in Root Cause Analysis using 6M.',
    benefit: 'Unlock advanced Ishikawa templates',
    icon: 'GitBranch',
    requirements: { level: 3, ishikawaCount: 3 }
  },
  {
    id: 's3',
    title: 'Visual Management',
    description: 'Use visual cues to maintain standards.',
    benefit: 'Red Tag creation time reduced',
    icon: 'Eye',
    requirements: { totalScore: 5000 }
  }
];

export const TRANSLATIONS = {
  cs: {
    common: {
      next: "Další",
      previous: "Předchozí",
      finish: "Dokončit",
      cancel: "Zrušit",
      save: "Uložit",
      score: "Skóre",
      xp: "XP",
      loading: "Načítání...",
      error: "Chyba",
      success: "Úspěch",
      step: "Krok",
      confirm: "Potvrdit"
    },
    menu: {
      sections: {
        monitoring: "Monitoring",
        toolkit: "Lean Toolkit",
        global: "Globální",
        admin: "Správa"
      },
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
    games: {
      audit: {
        title: "5S Audit",
        subtitle: "Dodržujte metodiku pro zajištění excelence pracoviště.",
        arTitle: "AR Skenování",
        arSetup: "Kalibrace AR",
        arHint: "Namiřte kameru na pracovní stanici k analýze.",
        confirmTag: "Potvrdit Červený Štítek",
        issueTag: "Vydat Štítek",
        syncing: "Synchronizace s tovární databází...",
        finding: "Nález 5S",
        recommendation: "Doporučení Senseie",
        steps: {
          sort: { name: "Sort (Seiri - Třídění)", desc: "Odstraňte nepotřebné předměty z pracoviště." },
          set: { name: "Set in Order (Seiton - Uspořádání)", desc: "Vše má své místo a vše je na svém místě." },
          shine: { name: "Shine (Seiso - Čištění)", desc: "Udržujte pracoviště čisté a stroje v kondici." },
          standard: { name: "Standardize (Seiketsu - Standardizace)", desc: "Vytvořte pravidla pro udržení prvních 3S." },
          sustain: { name: "Sustain (Shitsuke - Disciplína)", desc: "Udělejte z 5S každodenní zvyk." }
        }
      },
      ishikawa: {
        title: "Analýza Rybí Kostry",
        subtitle: "Identifikujte kořenové příčiny pomocí 6M frameworku.",
        addCause: "Přidat příčinu",
        isRoot: "Identifikována hlavní příčina",
        generate: "Generovat nápravná opatření",
        diagram: "Ishikawa Diagram",
        categories: {
          man: "Lidé (Man)",
          machine: "Stroje (Machine)",
          method: "Metody (Method)",
          material: "Materiál (Material)",
          measurement: "Měření (Measurement)",
          env: "Prostředí (Environment)"
        }
      },
      gemba: {
        title: "Gemba Walk",
        subtitle: "Jděte na dílnu, pozorujte procesy a hledejte plýtvání.",
        record: "Co pozorujete?",
        type: "Klasifikace",
        nextStation: "Další stanoviště",
        summary: "Shrnutí Gemby"
      },
      lpa: {
        title: "LPA Audit",
        subtitle: "Ověření standardní práce na pracovišti.",
        verifyPhoto: "Vyfotit důkaz pro ověření",
        aiProcessing: "AI Ověřování...",
        finalize: "Finalizovat LPA"
      }
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
    common: {
      next: "Next",
      previous: "Previous",
      finish: "Finish",
      cancel: "Cancel",
      save: "Save",
      score: "Score",
      xp: "XP",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      step: "Step",
      confirm: "Confirm"
    },
    menu: {
      sections: {
        monitoring: "Monitoring",
        toolkit: "Lean Toolkit",
        global: "Global",
        admin: "Administration"
      },
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
    games: {
      audit: {
        title: "5S Audit",
        subtitle: "Follow methodology to ensure workstation excellence.",
        arTitle: "AR Scan",
        arSetup: "AR Calibration",
        arHint: "Point camera at workstation for analysis.",
        confirmTag: "Confirm Red Tag",
        issueTag: "Issue Tag",
        syncing: "Syncing with factory record...",
        finding: "5S Finding",
        recommendation: "Sensei Recommendation",
        steps: {
          sort: { name: "Sort (Seiri)", desc: "Remove unnecessary items from the workplace." },
          set: { name: "Set in Order (Seiton)", desc: "A place for everything and everything in its place." },
          shine: { name: "Shine (Seiso)", desc: "Keep the area clean and equipment maintained." },
          standard: { name: "Standardize (Seiketsu)", desc: "Establish rules for maintaining the first 3S." },
          sustain: { name: "Sustain (Shitsuke)", desc: "Make 5S a daily habit." }
        }
      },
      ishikawa: {
        title: "Fishbone Analysis",
        subtitle: "Identify root causes using the 6M framework.",
        addCause: "Add Cause",
        isRoot: "Root cause identified",
        generate: "Generate Countermeasures",
        diagram: "Ishikawa Diagram",
        categories: {
          man: "Man",
          machine: "Machine",
          method: "Method",
          material: "Material",
          measurement: "Measurement",
          env: "Environment"
        }
      },
      gemba: {
        title: "Gemba Walk",
        subtitle: "Go to the floor, observe processes and find waste.",
        record: "What do you observe?",
        type: "Classification",
        nextStation: "Next Station",
        summary: "Gemba Summary"
      },
      lpa: {
        title: "LPA Audit",
        subtitle: "Verification of standard work on the floor.",
        verifyPhoto: "Capture verification photo",
        aiProcessing: "AI Verification...",
        finalize: "Finalize LPA"
      }
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

// Data pro scény (zůstávají v angličtině identifikátory, ale texty budou lokalizovány při renderu pokud je to nutné)
export const WORKPLACES: Workplace[] = [
  {
    id: 'wp-1',
    name: 'Montážní Linka A',
    type: 'production',
    coordinates: { x: 20, y: 30 },
    status: 'warning',
    redTags: 2,
    activeTrainingModules: 1,
    checklist: [
      "Průchody jsou čisté",
      "Nástroje ve stínových tabulích",
      "Žádné úniky oleje na podlaze"
    ]
  },
  {
    id: 'wp-2',
    name: 'Lakovna',
    type: 'production',
    coordinates: { x: 50, y: 20 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 2,
    checklist: [
      "Filtry ventilace zkontrolovány",
      "Barvy v ohnivzdorné skříni",
      "OOPP dostupné u vchodu"
    ]
  },
  {
    id: 'wp-3',
    name: 'Sklad - Expedice',
    type: 'logistics',
    coordinates: { x: 80, y: 40 },
    status: 'critical',
    redTags: 5,
    activeTrainingModules: 1,
    checklist: [
      "Nabíjecí zóna VZV čistá",
      "Palety max 3 na sobě",
      "Značení uliček viditelné",
      "Prošlé zboží separováno"
    ]
  },
  {
    id: 'wp-4',
    name: 'QA Laboratoř',
    type: 'quality',
    coordinates: { x: 30, y: 70 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 1,
    checklist: [
      "Kalibrační štítky platné",
      "Pracovní plochy čisté",
      "Vzorky správně označené"
    ]
  },
  {
    id: 'wp-5',
    name: 'Kancelář Manažera',
    type: 'office',
    coordinates: { x: 70, y: 75 },
    status: 'warning',
    redTags: 1,
    activeTrainingModules: 0,
    checklist: [
      "Důvěrné spisy zamčené",
      "Tabule KPI aktualizované",
      "Zasedací místnost uklizená"
    ]
  }
];

export const AUDIT_SCENES: AuditScene[] = [
  {
    id: 'audit-1',
    title: 'Hala - Zóna A',
    description: 'Montážní prostor je zaneřáděný. Identifikujte položky k odstranění (Sort) nebo vyčištění (Shine).',
    difficulty: Difficulty.EASY,
    xpReward: 150,
    items: [
      { id: '1', name: 'Zlomený klíč', status: 'broken', correctAction: 'remove' },
      { id: '2', name: 'Rozlitý olej', status: 'dirty', correctAction: 'clean' },
      { id: '3', name: 'Standardní nářadí', status: 'clean', correctAction: 'keep' },
      { id: '4', name: 'Kovový šrot', status: 'misplaced', correctAction: 'remove' },
      { id: '5', name: 'Bezpečnostní instrukce', status: 'clean', correctAction: 'keep' },
    ]
  },
  {
    id: 'audit-2',
    title: 'Sklad Expedice',
    description: 'Vysokofrekvenční zóna. Zaměřte se na standardizaci a uspořádání.',
    difficulty: Difficulty.MEDIUM,
    xpReward: 300,
    items: [
      { id: '6', name: 'Neoznačená krabice', status: 'misplaced', correctAction: 'organize' },
      { id: '7', name: 'Paleťák v uličce', status: 'misplaced', correctAction: 'organize' },
      { id: '8', name: 'Balicí páska', status: 'clean', correctAction: 'keep' },
      { id: '9', name: 'Staré přepravní štítky', status: 'dirty', correctAction: 'clean' },
      { id: '10', name: 'Expirovaný materiál', status: 'broken', correctAction: 'remove' },
    ]
  }
];

export const LPA_AUDITS: LPAAudit[] = [
  {
    id: 'lpa-1',
    title: 'Kontrola na začátku směny',
    description: 'Ověření základní bezpečnosti a provozní připravenosti.',
    frequency: 'Daily',
    xpReward: 100,
    questions: [
      { id: 'q1', question: 'Mají operátoři OOPP (brýle, obuv)?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'q2', question: 'Je prostor bez rizik zakopnutí?', category: 'Safety', correctAnswer: 'Yes' },
      { id: 'q3', question: 'Jsou standardní instrukce (SWI) viditelné?', category: 'Process', correctAnswer: 'Yes' },
      { id: 'q4', question: 'Byla provedena kontrola prvního kusu?', category: 'Quality', correctAnswer: 'Yes' }
    ]
  }
];

export const ISHIKAWA_PROBLEMS: IshikawaProblem[] = [
  {
    id: 'prob-1',
    title: 'Vysoká zmetkovitost lakování',
    description: 'Míra vad v lakovacím boxu vzrostla z 2% na 8% během posledního týdne.',
    difficulty: Difficulty.MEDIUM,
    category: 'Quality'
  },
  {
    id: 'prob-2',
    title: 'Zastavení montážní linky',
    description: 'Stanice 4 vykazuje časté mikrozastávky (pod 2 minuty), způsobující 15% ztrátu OEE.',
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

// Demo leaderboard for frontend-only mode
export const DEMO_LEADERBOARD = [
  { rank: 1, userId: 'demo-1', userName: 'Jan Novák', xp: 15200, level: 5, totalXp: 15200, totalScore: 9800 },
  { rank: 2, userId: 'demo-2', userName: 'Petr Svoboda', xp: 12500, level: 4, totalXp: 12500, totalScore: 8200 },
  { rank: 3, userId: 'demo-3', userName: 'Eva Kozlová', xp: 11800, level: 4, totalXp: 11800, totalScore: 7600 },
  { rank: 4, userId: 'demo-4', userName: 'Tomáš Horák', xp: 9500, level: 3, totalXp: 9500, totalScore: 6100 },
  { rank: 5, userId: 'demo-5', userName: 'Marie Králová', xp: 8200, level: 3, totalXp: 8200, totalScore: 5500 },
  { rank: 6, userId: 'demo-6', userName: 'Jakub Němec', xp: 6800, level: 2, totalXp: 6800, totalScore: 4300 },
  { rank: 7, userId: 'demo-7', userName: 'Lukáš Dvořák', xp: 5100, level: 2, totalXp: 5100, totalScore: 3200 },
  { rank: 8, userId: 'demo-8', userName: 'Kateřina Veselá', xp: 4200, level: 2, totalXp: 4200, totalScore: 2700 },
];
