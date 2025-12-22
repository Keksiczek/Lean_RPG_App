
import React, { useState } from 'react';
import { Users, Calendar, Award, Target, Plus, ChevronRight, User, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '../utils/themeColors';

const MOCK_TEAM = [
  { id: '1', name: 'Petr Novák', role: 'Operator', level: 3, xp: 2450, skillStatus: 'Expert', activeTasks: 2, lastAudit: '2023-10-24' },
  { id: '2', name: 'Jana Svobodová', role: 'Operator', level: 1, xp: 850, skillStatus: 'Junior', activeTasks: 1, lastAudit: '2023-10-26' },
  { id: '3', name: 'Martin Kučera', role: 'Operator', level: 4, xp: 4200, skillStatus: 'Master', activeTasks: 0, lastAudit: '2023-10-20' },
];

const TeamManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Team Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring and scheduling operational excellence.</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-red-700 transition-all">
          <Calendar className="w-4 h-4" /> Schedule New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                Operators Summary
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{MOCK_TEAM.length} Active Members</span>
            </div>
            <div className="divide-y dark:divide-slate-800">
              {MOCK_TEAM.map(member => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedUser(member)}
                  className={cn(
                    "p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    selectedUser?.id === member.id && "bg-indigo-50/50 dark:bg-indigo-900/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{member.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Award className="w-3 h-3 mr-1 text-amber-500" /> Level {member.level} • {member.skillStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Open Tasks</p>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", member.activeTasks > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                        {member.activeTasks} Finding{member.activeTasks !== 1 && 's'}
                      </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Audit</p>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.lastAudit}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 flex items-center">
                 <Target className="w-8 h-8 mr-3 text-red-400" />
                 Skill Gap Analysis
               </h3>
               <p className="text-indigo-200 text-sm max-w-lg mb-6">
                 Jana Svobodová is falling behind on 5S Sustainability targets. Consider assigning her a "Real World 5S Scan" this week to improve her score.
               </p>
               <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all">
                 Assign Training Module
               </button>
            </div>
          </div>
        </div>

        {/* Audit Schedule Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-amber-500" />
                Next 7 Days Schedule
             </h3>
             <div className="space-y-4">
                {[
                  { user: 'Petr Novák', task: 'Line A - 5S Audit', date: 'Tomorrow', status: 'priority' },
                  { user: 'Jana Svobodová', task: 'Safety Walk', date: 'Oct 28', status: 'normal' },
                  { user: 'Martin Kučera', task: 'LPA Audit (Manager)', date: 'Oct 30', status: 'normal' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={cn("w-1.5 h-8 rounded-full mt-1", item.status === 'priority' ? "bg-red-500" : "bg-slate-300 dark:bg-slate-700")}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.task}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] text-slate-400 font-bold uppercase">{item.user}</span>
                         <span className="text-[10px] text-red-500 font-black uppercase">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
               View Full Calendar
             </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
                Team Compliance
             </h3>
             <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">92%</div>
             <p className="text-xs text-slate-500 font-medium">+4% from last week. Great job!</p>
             <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
