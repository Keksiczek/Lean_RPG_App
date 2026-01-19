
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
  Sparkles,
  X
} from 'lucide-react';
import ApiError from '../../components/ui/ApiError';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/themeColors';

const QuestManagement: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  const { data: quests, loading, error, refetch } = useFetch<Quest[]>(ENDPOINTS.ADMIN.QUESTS);
  const { execute: updateQuest } = useMutation<any, any>('DYNAMIC_PATH', 'PUT');
  const { execute: createQuest } = useMutation<any, any>(ENDPOINTS.ADMIN.QUESTS, 'POST');
  const { execute: deleteQuest } = useMutation<any, any>('DYNAMIC_PATH', 'DELETE');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      await deleteQuest(null, ENDPOINTS.ADMIN.QUEST_DETAIL(id));
      success('Quest Deleted', 'The educational module has been removed.');
      refetch();
    }
  };

  const handleToggleActive = async (quest: Quest) => {
    await updateQuest({ isActive: !quest.isActive }, ENDPOINTS.ADMIN.QUEST_DETAIL(quest.id));
    success('Quest Updated', `Quest is now ${!quest.isActive ? 'active' : 'inactive'}.`);
    refetch();
  };

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const QuestModal = ({ isOpen, onClose, quest }: { isOpen: boolean; onClose: () => void; quest: Quest | null }) => {
    const [formData, setFormData] = useState<Partial<Quest>>(
      quest || {
        title: '',
        description: '',
        skillCode: 'KAIZEN_5S',
        difficulty: Difficulty.EASY,
        xpReward: 500,
        isActive: true,
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (quest) {
          await updateQuest(formData, ENDPOINTS.ADMIN.QUEST_DETAIL(quest.id));
          success('Quest Updated', 'Changes saved successfully.');
        } else {
          await createQuest(formData);
          success('Quest Created', 'New master quest published.');
        }
        refetch();
        onClose();
      } catch (err) {
        toastError('Action Failed', 'Could not save quest data.');
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {quest ? 'Edit Master Quest' : 'New Master Quest'}
              </h2>
              <p className="text-sm text-slate-500">Configure educational challenge parameters.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Quest Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-bold"
                  placeholder="e.g. 5S Workplace Organization"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all text-sm"
                  placeholder="Explain the learning objectives and scenario..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Skill Association</label>
                <select
                  value={formData.skillCode}
                  onChange={(e) => setFormData({ ...formData, skillCode: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 rounded-2xl outline-none appearance-none font-bold"
                >
                  <option value="KAIZEN_5S">5S Methodology</option>
                  <option value="LPA_AUDIT">LPA Guardian</option>
                  <option value="RCA_ISHIKAWA">Ishikawa Analysis</option>
                  <option value="GEMBA_WALK">Gemba Walk</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 rounded-2xl outline-none appearance-none font-bold"
                >
                  <option value={Difficulty.EASY}>Easy (Introductory)</option>
                  <option value={Difficulty.MEDIUM}>Medium (Applied)</option>
                  <option value={Difficulty.HARD}>Hard (Complex Case)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">XP Reward</label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 rounded-2xl outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-6 h-6 accent-red-600 rounded-lg"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">Quest is Active & Published</label>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-8 py-4 bg-slate-900 dark:bg-red-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20 transition-all uppercase tracking-widest text-xs"
              >
                {quest ? 'Save Changes' : 'Publish Master Quest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
          onClick={handleCreate}
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
                <button
                  onClick={() => handleToggleActive(quest)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title={quest.isActive ? "Deactivate" : "Activate"}
                >
                  {quest.isActive ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>
                <button
                  onClick={() => handleEdit(quest)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(quest.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Delete"
                >
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

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quest={editingQuest}
      />
    </div>
  );
};

export default QuestManagement;
