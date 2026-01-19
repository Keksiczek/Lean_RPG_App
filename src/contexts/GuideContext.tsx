
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ViewState, UserRole } from '../types';

interface GuideStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface GuideContextType {
  isActive: boolean;
  currentStep: number;
  steps: GuideStep[];
  startTour: (view: ViewState, role: UserRole) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<GuideStep[]>([]);

  const getStepsForView = (view: ViewState, role: UserRole): GuideStep[] => {
    const commonSteps: Record<string, GuideStep[]> = {
      [ViewState.DASHBOARD]: [
        { targetId: 'nav-monitoring', title: 'Monitoring Center', content: 'Track real-time factory health and compliance trends here.', position: 'right' },
        { targetId: 'xp-stat-card', title: 'XP & Progression', content: 'Earn XP by completing audits and solving problems to unlock new skills.', position: 'bottom' }
      ],
      [ViewState.FACTORY_MAP]: [
        { targetId: 'digital-twin-map', title: 'Digital Twin', content: 'Click on any workstation to see its live 5S status and red tags.', position: 'bottom' },
        { targetId: 'ar-scan-btn', title: 'Vision Scan', content: 'Use this to launch Gemini AI and analyze real-world workplace clutter.', position: 'top' }
      ]
    };

    const roleSpecific: Record<string, Record<string, GuideStep[]>> = {
      [UserRole.TEAM_LEADER]: {
        [ViewState.TEAM_MANAGEMENT]: [
          { targetId: 'schedule-audit-btn', title: 'Planning', content: 'Schedule mandatory audits for your team members here.', position: 'bottom' },
          { targetId: 'skill-gap-card', title: 'Skill Gaps', content: 'AI analyzes your team\'s performance and suggests training.', position: 'left' }
        ]
      },
      [UserRole.CI_SPECIALIST]: {
        [ViewState.METHODOLOGY_CONFIG]: [
          { targetId: 'create-standard-btn', title: 'Standard Work', content: 'Define new checklist standards that will be deployed factory-wide.', position: 'bottom' },
          { targetId: 'ai-precision-slider', title: 'AI Strictness', content: 'Configure how strict the Vision AI should be when identifying waste.', position: 'top' }
        ]
      }
    };

    return [...(commonSteps[view] || []), ...(roleSpecific[role]?.[view] || [])];
  };

  const startTour = useCallback((view: ViewState, role: UserRole) => {
    const newSteps = getStepsForView(view, role);
    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStep(0);
      setIsActive(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    else endTour();
  };

  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const endTour = () => setIsActive(false);

  return (
    <GuideContext.Provider value={{ isActive, currentStep, steps, startTour, nextStep, prevStep, endTour }}>
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) throw new Error('useGuide must be used within a GuideProvider');
  return context;
};
