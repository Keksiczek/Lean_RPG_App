
import React, { useEffect, useState, useRef } from 'react';
import { ActionTask, TaskCategory } from '../types';
import { gameService } from '../services/gameService';
import { useLanguage } from '../contexts/LanguageContext';
import { WORKPLACES } from '../constants';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  X,
  ChevronRight,
  Search,
  Tag,
  ShieldAlert,
  Wrench,
  Zap,
  Layout,
  Filter,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '../utils/themeColors';

interface TaskManagerProps {
    initialTaskId?: string;
}

const TASK_CATEGORIES: { id: TaskCategory; icon: any; color: string; bgColor: string }[] = [
  { id: '5S', icon: Tag, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'Safety', icon: ShieldAlert, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  { id: 'Maintenance', icon: Wrench, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'Quality', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'Process', icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }
];

const TaskManager: React.FC<TaskManagerProps> = ({ initialTaskId }) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ActionTask | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'open'|'in_progress'|'done'>('open');
  const [formPriority, setFormPriority] = useState<'low'|'medium'|'high'>('medium');
  const [formWorkplaceId, setFormWorkplaceId] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('5S');
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
        const data = await gameService.getTasks();
        if (data.length === 0) {
            setTasks([
                { 
                    id: '1', title: 'Refill Lubricant Station 3', description: 'Weekly top-up required to prevent bearing wear.', 
                    status: 'open', priority: 'medium', category: 'Maintenance', source: 'Standard Work', 
                    workplaceId: 'wp-1', location: 'Assembly Line A', createdAt: new Date().toISOString() 
                }
            ]);
        } else {
            setTasks(data);
        }
    } catch (e) {
        console.error("Failed to load tasks", e);
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (task: ActionTask | null = null) => {
    if (task) {
      setEditingTask(task);
      setFormTitle(task.title);
      setFormDesc(task.description);
      setFormStatus(task.status);
      setFormPriority(task.priority);
      setFormWorkplaceId(task.workplaceId || '');
      setFormCategory(task.category || '5S');
      setFormImageUrl(task.imageUrl || null);
    } else {
      setEditingTask(null);
      setFormTitle('');
      setFormDesc('');
      setFormStatus('open');
      setFormPriority('medium');
      setFormWorkplaceId('');
      setFormCategory('5S');
      setFormImageUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle) return alert("Task title is mandatory");
    
    const workplace = WORKPLACES.find(w => w.id === formWorkplaceId);
    const taskData: any = {
      title: formTitle,
      description: formDesc,
      status: formStatus,
      priority: formPriority,
      category: formCategory,
      workplaceId: formWorkplaceId,
      location: workplace?.name || 'General Factory',
      source: editingTask?.source || 'Manual CI Entry',
      imageUrl: formImageUrl
    };

    if (editingTask) {
      const updated = tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t);
      setTasks(updated);
    } else {
      const newTask: ActionTask = {
        ...taskData,
        id: `t-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesArea = filterArea === 'all' || task.workplaceId === filterArea;
    return matchesSearch && matchesStatus && matchesArea;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">Action Board</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">Track and resolve non-conformities identified during audits and Gemba walks.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-red-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
            >
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" /> {t('tasks.create')}
            </button>
        </header>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-4 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by keyword, tool, or area..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl focus:ring-2 focus:ring-red-500 text-sm font-bold dark:text-white placeholder:text-slate-400"
                />
            </div>
            
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 px-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <Filter className="w-4 h-4 text-slate-400 mr-3" />
                    <select 
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="bg-transparent border-0 py-4 text-xs font-black uppercase tracking-widest focus:ring-0 outline-none dark:text-white min-w-[140px]"
                    >
                        <option value="all">All Locations</option>
                        {WORKPLACES.map(wp => (
                            <option key={wp.id} value={wp.id}>{wp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                    {['all', 'open', 'in_progress', 'done'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterStatus === s 
                                  ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm ring-1 ring-black/5" 
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[2.5rem]" />)
            ) : filteredTasks.length === 0 ? (
                <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-40" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Zero non-conformities found</p>
                </div>
            ) : (
                filteredTasks.map(task => {
                    const category = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[0];
                    return (
                        <div 
                            key={task.id}
                            onClick={() => handleOpenModal(task)}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer group flex flex-col xl:flex-row xl:items-center justify-between gap-8 hover:shadow-2xl"
                        >
                            <div className="flex items-start gap-8 flex-1">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl shrink-0 flex items-center justify-center border-4",
                                    task.status === 'done' 
                                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600" 
                                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-red-500 group-hover:border-red-100"
                                )}>
                                    <category.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full", category.bgColor, category.color)}>
                                            {task.category}
                                        </span>
                                        {task.imageUrl && (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                                <ImageIcon className="w-3 h-3" /> Evidence
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={cn("text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-red-600 transition-colors leading-none mt-2", task.status === 'done' && "line-through opacity-40")}>
                                        {task.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{task.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between xl:justify-end gap-12 pt-6 xl:pt-0 border-t xl:border-0 dark:border-slate-800">
                                <div className="space-y-4 text-right">
                                    <div className="flex items-center justify-end text-xs font-black uppercase tracking-widest text-slate-400">
                                        {task.location}
                                        <MapPin className="w-4 h-4 ml-3 text-red-500" />
                                    </div>
                                    <div className="flex items-center justify-end text-xs font-black uppercase tracking-widest text-slate-400">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Continuous'}
                                        <Clock className="w-4 h-4 ml-3 text-blue-500" />
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-red-600 group-hover:text-white transition-all group-hover:scale-110">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Task Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-4 sm:p-8">
                <div className="bg-white dark:bg-slate-900 rounded-t-[3.5rem] sm:rounded-[3.5rem] w-full max-w-4xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[95vh]">
                    <div className="p-10 bg-slate-50 dark:bg-slate-900 flex justify-between items-center border-b dark:border-slate-800">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] text-white shadow-2xl flex items-center justify-center">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                                    {editingTask ? 'Action Review' : 'New Continuous Improvement'}
                                </h2>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                   <Sparkles className="w-3 h-3 text-red-500" /> Operational Record System
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all hover:rotate-90">
                            <X className="w-8 h-8 text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Title</label>
                                <input 
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl focus:ring-2 focus:ring-red-500 outline-none font-black text-xl text-slate-900 dark:text-white tracking-tight"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="Task title..."
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location</label>
                                <select 
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-900 dark:text-white appearance-none"
                                    value={formWorkplaceId}
                                    onChange={e => setFormWorkplaceId(e.target.value)}
                                >
                                    <option value="">Select Area</option>
                                    {WORKPLACES.map(wp => (
                                        <option key={wp.id} value={wp.id}>{wp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea 
                                className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-700 dark:text-slate-300 min-h-[140px] resize-none leading-relaxed"
                                value={formDesc}
                                onChange={e => setFormDesc(e.target.value)}
                                placeholder="Describe the finding or required action..."
                            />
                        </div>

                        {/* Physical Evidence Section */}
                        <div className="space-y-6 pt-4 border-t dark:border-slate-800">
                             <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Physical Evidence / Photo</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        <Upload className="w-4 h-4" /> Upload
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        capture="environment"
                                    />
                                </div>
                             </div>

                             {formImageUrl ? (
                                <div className="relative w-full h-80 rounded-[3rem] overflow-hidden group border-8 border-slate-50 dark:border-slate-800 shadow-inner">
                                    <img src={formImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Evidence" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => setFormImageUrl(null)}
                                            className="p-5 bg-red-600 text-white rounded-3xl hover:scale-110 transition-all shadow-2xl"
                                        >
                                            <Trash2 className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>
                             ) : (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-red-500 hover:border-red-500/20 transition-all group"
                                >
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-all">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Tap to add visual proof</p>
                                </button>
                             )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-black uppercase text-xs dark:text-white outline-none"
                                    value={formCategory}
                                    onChange={e => setFormCategory(e.target.value as any)}
                                >
                                    {TASK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-black uppercase text-xs dark:text-white outline-none"
                                    value={formStatus}
                                    onChange={e => setFormStatus(e.target.value as any)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">Working</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-black uppercase text-xs dark:text-white outline-none"
                                    value={formPriority}
                                    onChange={e => setFormPriority(e.target.value as any)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 flex gap-4">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-10 py-5 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 rounded-[2rem] transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex-1 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95"
                        >
                            Save Action
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TaskManager;
