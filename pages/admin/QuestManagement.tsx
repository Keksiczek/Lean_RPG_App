
import React, { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { Quest, Difficulty } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  ClipboardList,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import ApiError from '../../components/ui/ApiError';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/themeColors';

const QuestManagement: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [filterSkill, setFilterSkill] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: quests, loading, error, refetch } = useFetch<Quest[]>(ENDPOINTS.ADMIN.QUESTS);
  /* FIX: construction of dynamic endpoint via second argument of execute() in handleToggleActive */
  const { execute: updateQuest } = useMutation<any, any>('DYNAMIC_PATH', 'PUT');
  /* FIX: construction of dynamic endpoint via second argument of execute() in handleDelete */
  const { execute: deleteQuest } = useMutation<any, any>('DYNAMIC_PATH', 'DELETE');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      /* FIX: construction of dynamic endpoint via second argument of execute() */
      await deleteQuest(null, ENDPOINTS.ADMIN.QUEST_DETAIL(id));
      success('Quest Deleted', 'The educational module has been removed.');
      refetch();
    }
  };

  const handleToggleActive = async (quest: Quest) => {
    /* FIX: construction of dynamic endpoint via second argument of execute() */
    await updateQuest({ isActive: !quest.isActive }, ENDPOINTS.ADMIN.QUEST_DETAIL(quest.id));
    success('Quest Updated', `Quest is now ${!quest.isActive ? 'active' : 'inactive'}.`);
    refetch();
  };

  if (error) return <ApiError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Quest Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Design and publish educational challenges.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> New Master Quest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={200} className="rounded-3xl" />)
        ) : quests?.map(quest => (
          <div key={quest.id} className={cn(
            "bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 transition-all group flex flex-col",
            quest.isActive ? "border-slate-100 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-60 grayscale"
          )}>
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl">
                  <ClipboardList className="w-6 h-6" />
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleToggleActive(quest)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    {quest.isActive ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                 </button>
                 <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <Edit className="w-4 h-4 text-blue-500" />
                 </button>
                 <button onClick={() => handleDelete(quest.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4 text-red-500" />
                 </button>
               </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{quest.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">{quest.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                 <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {quest.skillCode}
                 </span>
                 <span className={cn(
                   "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                   quest.difficulty === 'easy' ? "bg-emerald-100 text-emerald-700" :
                   quest.difficulty === 'medium' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                 )}>
                    {quest.difficulty}
                 </span>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center text-amber-500 font-black">
                  <Sparkles className="w-4 h-4 mr-1" /> +{quest.xpReward} XP
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase">
                  {quest.isActive ? 'Active' : 'Draft'}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestManagement;
