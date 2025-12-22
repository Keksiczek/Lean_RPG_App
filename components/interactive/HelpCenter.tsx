
import React, { useState } from 'react';
import { HelpCircle, BookOpen, MessageSquare, Shield, Target, Play, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ViewState } from '../../types';
import { useGuide } from '../../contexts/GuideContext';
import { cn } from '../../utils/themeColors';

const HELP_CONTENT: Record<string, { title: string, items: { q: string, a: string }[] }> = {
  [UserRole.OPERATOR]: {
    title: 'Operator Guide',
    items: [
      { q: 'How to report a 5S violation?', a: 'Go to Factory Map, select your area, and click "Scan". Use the AI camera to identify clutter.' },
      { q: 'What are XP for?', a: 'XP unlock new skill badges that grant permanent bonuses in audit simulations.' }
    ]
  },
  [UserRole.TEAM_LEADER]: {
    title: 'Leader Handbook',
    items: [
      { q: 'How to schedule an LPA?', a: 'Open "Team Management" and click the calendar icon next to an operator.' },
      { q: 'Managing skills?', a: 'Check the "Skill Gap Analysis" on your dashboard to see who needs training.' }
    ]
  }
};

const HelpCenter: React.FC<{ isOpen: boolean, onClose: () => void, activeView: ViewState }> = ({ isOpen, onClose, activeView }) => {
  const { user } = useAuth();
  const { startTour } = useGuide();
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const role = user?.role || UserRole.OPERATOR;
  const content = HELP_CONTENT[role as string] || HELP_CONTENT[UserRole.OPERATOR];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white dark:bg-slate-900 shadow-2xl z-[100] animate-slide-in-right flex flex-col border-l dark:border-slate-800">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-black uppercase tracking-tighter">Lean Playbook</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <button 
            onClick={() => { onClose(); startTour(activeView, role as UserRole); }}
            className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl group hover:bg-red-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-red-600 group-hover:text-white" />
              <span className="text-sm font-bold text-red-700 dark:text-red-400 group-hover:text-white">Start Interactive Tour</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white" />
          </button>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{content.title}</h3>
          <div className="space-y-3">
            {content.items.map((item, i) => (
              <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setSelectedTopic(selectedTopic === i ? null : i)}
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.q}</span>
                  <ChevronRight className={cn("w-4 h-4 text-slate-300 transition-transform", selectedTopic === i && "rotate-90")} />
                </button>
                {selectedTopic === i && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t dark:border-slate-800">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-xs text-slate-400 mb-4 font-medium italic">Still stuck? Ask Lean Sensei for live advice.</p>
        <button className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" /> Open Chatbot
        </button>
      </div>
    </div>
  );
};

export default HelpCenter;
