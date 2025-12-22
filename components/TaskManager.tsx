
import React, { useEffect, useState } from 'react';
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
  Layout
} from 'lucide-react';
import { cn } from '../utils/themeColors';

interface TaskManagerProps {
    initialTaskId?: string;
}

const TASK_CATEGORIES: { id: TaskCategory; icon: any; color: string }[] = [
  { id: '5S', icon: Tag, color: 'text-blue-500' },
  { id: 'Safety', icon: ShieldAlert, color: 'text-red-500' },
  { id: 'Maintenance', icon: Wrench, color: 'text-amber-500' },
  { id: 'Quality', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'Process', icon: Zap, color: 'text-purple-500' }
];

const TaskManager: React.FC<TaskManagerProps> = ({ initialTaskId }) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
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

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await gameService.getTasks();
    // Pro demo účely přidáme pár mock úkolů, pokud je seznam prázdný
    if (data.length === 0) {
        setTasks([
            { 
                id: '1', title: 'Oprava stínové tabule', description: 'Chybí obrysy pro klíče 10 a 12.', 
                status: 'open', priority: 'medium', category: '5S', source: 'Audit', 
                workplaceId: 'wp-1', location: 'Assembly Line A', createdAt: new Date().toISOString() 
            },
            { 
                id: '2', title: 'Únik oleje pod lisem', description: 'Detekován drobný průsak, nutná kontrola těsnění.', 
                status: 'in_progress', priority: 'high', category: 'Maintenance', source: 'LPA', 
                workplaceId: 'wp-2', location: 'Paint Shop', createdAt: new Date().toISOString() 
            }
        ]);
    } else {
        setTasks(data);
    }
    setLoading(false);
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
    } else {
      setEditingTask(null);
      setFormTitle('');
      setFormDesc('');
      setFormStatus('open');
      setFormPriority('medium');
      setFormWorkplaceId('');
      setFormCategory('5S');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const workplace = WORKPLACES.find(w => w.id === formWorkplaceId);
    const taskData: any = {
      title: formTitle,
      description: formDesc,
      status: formStatus,
      priority: formPriority,
      category: formCategory,
      workplaceId: formWorkplaceId,
      location: workplace?.name || 'General Area',
      source: 'Manual Entry'
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
    <div className="space-y-6 animate-fade-in pb-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Action Plan</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage operational improvements and findings.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
                <Plus className="w-5 h-5 mr-2" /> {t('tasks.create')}
            </button>
        </header>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-3 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search findings or areas..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 text-sm font-bold dark:text-white"
                />
            </div>
            
            <div className="flex flex-wrap gap-2">
                <select 
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                >
                    <option value="all">All Areas</option>
                    {WORKPLACES.map(wp => (
                        <option key={wp.id} value={wp.id}>{wp.name}</option>
                    ))}
                </select>

                <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    {['all', 'open', 'in_progress', 'done'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filterStatus === s ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 gap-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-3xl" />)
            ) : filteredTasks.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-400 font-black uppercase tracking-widest">No matching tasks found</p>
                </div>
            ) : (
                filteredTasks.map(task => {
                    const category = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[0];
                    return (
                        <div 
                            key={task.id}
                            onClick={() => handleOpenModal(task)}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-start gap-5">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border-2",
                                    task.status === 'done' ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 text-emerald-600" : "bg-red-50 dark:bg-red-900/10 border-red-100 text-red-600"
                                )}>
                                    <category.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800", category.color)}>
                                            {task.category}
                                        </span>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded",
                                            task.priority === 'high' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {task.priority} Priority
                                        </span>
                                    </div>
                                    <h3 className={cn("text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-red-600 transition-colors", task.status === 'done' && "line-through opacity-50")}>
                                        {task.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-10 pt-4 md:pt-0 border-t md:border-0 dark:border-slate-800">
                                <div className="space-y-3">
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                        {task.location}
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {task.dueDate || 'No Deadline'}
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 group-hover:text-red-500 transition-all" />
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Task Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 flex justify-between items-center border-b dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">
                                    {editingTask ? 'Edit Finding' : 'New Improvement'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase">Corrective Action Detail</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-900 dark:text-white"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="Task summary..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workplace Assignment</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-900 dark:text-white appearance-none"
                                    value={formWorkplaceId}
                                    onChange={e => setFormWorkplaceId(e.target.value)}
                                >
                                    <option value="">Select Area...</option>
                                    {WORKPLACES.map(wp => (
                                        <option key={wp.id} value={wp.id}>{wp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Problem Description</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-900 dark:text-white min-h-[100px] resize-none"
                                value={formDesc}
                                onChange={e => setFormDesc(e.target.value)}
                                placeholder="Details about the issue or required action..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-bold dark:text-white outline-none"
                                    value={formCategory}
                                    onChange={e => setFormCategory(e.target.value as any)}
                                >
                                    {TASK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-bold dark:text-white outline-none"
                                    value={formStatus}
                                    onChange={e => setFormStatus(e.target.value as any)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl font-bold dark:text-white outline-none"
                                    value={formPriority}
                                    onChange={e => setFormPriority(e.target.value as any)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High (Urgent)</option>
                                </select>
                            </div>
                        </div>

                        {editingTask?.imageUrl && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Evidence</label>
                                <div className="w-full h-48 rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner">
                                    <img src={editingTask.imageUrl} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t dark:border-slate-700">
                        <button 
                            onClick={handleSave}
                            className="w-full py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {editingTask ? 'Apply Changes' : 'Publish Improvement'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TaskManager;
