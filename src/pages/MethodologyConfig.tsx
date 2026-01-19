
import React, { useState } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, ShieldCheck, Zap, MoreVertical } from 'lucide-react';
import { cn } from '../utils/themeColors';

const MOCK_STANDARDS = [
  { id: '1', name: 'Standard Daily 5S Audit', category: '5S', version: '2.1', status: 'Active', items: 12, xp: 150 },
  { id: '2', name: 'Logistics Safety Check', category: 'Safety', version: '1.4', status: 'Draft', items: 8, xp: 100 },
  { id: '3', name: 'Layered Process Audit (LPA) - L1', category: 'LPA', version: '3.0', status: 'Active', items: 15, xp: 250 },
];

const MethodologyConfig: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Methodology Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Configure audit standards and gamification parameters.</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all">
          <Plus className="w-4 h-4" /> Create New Standard
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row gap-4 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search standards..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
           </div>
           <div className="flex gap-2">
             <select className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>All Categories</option>
                <option>5S</option>
                <option>LPA</option>
                <option>Safety</option>
             </select>
           </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="p-6">Standard Name</th>
              <th className="p-6">Category</th>
              <th className="p-6">Items</th>
              <th className="p-6">Reward (XP)</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {MOCK_STANDARDS.map(std => (
              <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{std.name}</p>
                      <p className="text-[10px] text-slate-400">Version {std.version}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">{std.category}</span>
                </td>
                <td className="p-6 font-mono text-xs text-slate-500">{std.items} Q's</td>
                <td className="p-6">
                  <div className="flex items-center text-amber-500 font-bold text-sm">
                    <Zap className="w-3.5 h-3.5 mr-1" /> {std.xp}
                  </div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                    std.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {std.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-600 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 dark:text-white">AI Analysis Precision</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Define how strict the Gemini Vision model should be when identifying 5S violations. Higher strictness requires perfect shadow-boarding for a "Pass".
            </p>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Detection Threshold</span>
                     <span className="text-xs font-black text-emerald-600 uppercase">Balanced (0.7)</span>
                  </div>
                  <input type="range" className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 dark:text-white">XP Global Multipliers</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Set permanent XP bonuses for high-quality findings to encourage team engagement.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Red Tag Base</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">50 XP</p>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">LPA Streak</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">1.2x</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MethodologyConfig;
