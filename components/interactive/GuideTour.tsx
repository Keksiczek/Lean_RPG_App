
import React, { useEffect, useState } from 'react';
import { useGuide } from '../../contexts/GuideContext';
import { ChevronRight, ChevronLeft, X, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '../../utils/themeColors';

const GuideTour: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, endTour } = useGuide();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const el = document.getElementById(steps[currentStep].targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep, steps]);

  if (!isActive || !steps[currentStep] || !targetRect) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none font-sans">
      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect 
              x={targetRect.left - 8} 
              y={targetRect.top - 8} 
              width={targetRect.width + 16} 
              height={targetRect.height + 16} 
              rx="12" 
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          x="0" y="0" width="100%" height="100%" 
          fill="rgba(2, 6, 23, 0.7)" 
          mask="url(#spotlight-mask)" 
          onClick={endTour}
        />
      </svg>

      {/* Tooltip Card */}
      <div 
        className="absolute z-50 pointer-events-auto animate-scale-in"
        style={{
          top: step.position === 'bottom' ? targetRect.bottom + 20 : 
               step.position === 'top' ? targetRect.top - 200 : 
               targetRect.top,
          left: step.position === 'right' ? targetRect.right + 20 :
                step.position === 'left' ? targetRect.left - 320 :
                targetRect.left,
          width: '300px'
        }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden">
          <div className="bg-red-600 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Interactive Guide</span>
            </div>
            <button onClick={endTour} className="hover:rotate-90 transition-transform">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6">
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{step.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{step.content}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">{currentStep + 1} of {steps.length}</span>
              <div className="flex gap-2">
                <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextStep}
                  className="bg-slate-900 dark:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideTour;
