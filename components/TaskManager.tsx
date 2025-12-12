import React, { useEffect, useState, useRef } from 'react';
import { ActionTask } from '../types';
import { gameService } from '../services/gameService';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Filter, 
  X,
  Camera,
  Save,
  ChevronRight,
  RefreshCw,
  Search,
  Factory
} from 'lucide-react';

interface TaskManagerProps {
    initialTaskId?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ initialTaskId }) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filters State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ActionTask | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAssignee, setFormAssignee] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPriority, setFormPriority] = useState<'low'|'medium'|'high'>('medium');
  const [formStatus, setFormStatus] = useState<'open'|'in_progress'|'done'>('open');

  // References for scrolling
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await gameService.getTasks();
    setTasks(data);
    setLoading(false);
  };

  // Handle Deep Linking / Initial Task
  useEffect(() => {
      if (initialTaskId && tasks.length > 0) {
          const task = tasks.find(t => t.id === initialTaskId);
          if (task) {
              // Reset filters to ensure the task is visible
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterSource('all');
              setFilterAssignee('all');
              setSearchQuery('');

              // 1. Open the modal for editing
              handleEdit(task);
              
              // 2. Scroll the list to the task with a slight delay to allow rendering
              setTimeout(() => {
                  const el = itemRefs.current.get(task.id);
                  if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
                      setTimeout(() => {
                          el.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
                      }, 2000);
                  }
              }, 100);
          }
      }
  }, [initialTaskId, tasks]);

  const handleEdit = (task: ActionTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormAssignee(task.assignee || '');
    setFormDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormAssignee('');
    setFormDate('');
    setFormPriority('medium');
    setFormStatus('open');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle) return;

    if (editingTask) {
        await gameService.updateTask(editingTask.id, {
            title: formTitle,
            description: formDesc,
            assignee: formAssignee,
            dueDate: formDate ? new Date(formDate).toISOString() : undefined,
            priority: formPriority,
            status: formStatus
        });
    } else {
        await gameService.createTask({
            title: formTitle,
            description: formDesc,
            assignee: formAssignee,
            dueDate: formDate ? new Date(formDate).toISOString() : undefined,
            priority: formPriority,
            status: formStatus,
            source: 'General'
        });
    }
    setIsModalOpen(false);
    loadTasks();
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterSource('all');
    setFilterAssignee('all');
    setSearchQuery('');
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'text-red-700 bg-red-100 border border-red-200';
    if (p === 'medium') return 'text-amber-700 bg-amber-100 border border-amber-200';
    return 'text-blue-700 bg-blue-100 border border-blue-200';
  };

  const getStatusColor = (s: string) => {
    if (s === 'done') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-300';
    return 'bg-white text-slate-700 border-slate-300';
  };

  // Complex Filtering Logic
  const filteredTasks = tasks.filter(task => {
    // 1. Search Query (Title/Desc)
    if (searchQuery) {
       const query = searchQuery.toLowerCase();
       if (!task.title.toLowerCase().includes(query) && !task.description.toLowerCase().includes(query)) {
           return false;
       }
    }
    // 2. Status
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    
    // 3. Priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    // 4. Source
    if (filterSource !== 'all' && task.source !== filterSource) return false;

    // 5. Assignee (My Tasks vs All)
    if (filterAssignee === 'me') {
       if (!task.assignee || (!task.assignee.includes('You') && task.assignee !== 'Me')) return false;
    }

    return true;
  });

  // Extract unique sources for the filter dropdown
  const uniqueSources = Array.from(new Set(tasks.map(t => t.source)));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('tasks.title')}</h1>
                <p className="text-slate-600 font-medium">{t('tasks.subtitle')}</p>
            </div>
            <button 
                onClick={handleCreate}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center justify-center transition-colors"
            >
                <Plus className="w-5 h-5 mr-2" /> {t('tasks.create')}
            </button>
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm mb-2">
                <Filter className="w-4 h-4" />
                <span>Filter Actions</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Search */}
                <div className="md:col-span-1 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
                    />
                </div>

                {/* Status Filter */}
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-700"
                >
                    <option value="all">Status: All</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                {/* Priority Filter */}
                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-700"
                >
                    <option value="all">Priority: All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                {/* Source Filter */}
                <select 
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-700"
                >
                    <option value="all">Source: All</option>
                    {uniqueSources.map(src => (
                        <option key={src} value={src}>{src}</option>
                    ))}
                </select>

                {/* Assignee Filter */}
                <select 
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-700"
                >
                    <option value="all">Assignee: All</option>
                    <option value="me">Assigned to Me</option>
                </select>
            </div>

            {/* Active Filter Badges & Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-bold">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </span>
                <button 
                    onClick={resetFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center"
                >
                    <RefreshCw className="w-3 h-3 mr-1" /> Reset Filters
                </button>
            </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 gap-4">
            {loading ? (
                <div className="text-center py-12 text-slate-500 font-medium">Loading actions...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-bold">{t('tasks.noTasks')}</p>
                    <button onClick={resetFilters} className="mt-2 text-sm text-blue-600 hover:underline font-medium">Clear filters</button>
                </div>
            ) : (
                filteredTasks.map(task => (
                    <div 
                        key={task.id}
                        ref={(el) => { if (el) itemRefs.current.set(task.id, el); else itemRefs.current.delete(task.id); }}
                        onClick={() => handleEdit(task)}
                        className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border hover:shadow-md hover:border-red-300 cursor-pointer transition-all group relative overflow-hidden ${
                            editingTask?.id === task.id ? 'ring-2 ring-red-500 border-red-500' : 'border-slate-200'
                        }`}
                    >
                        {/* Status bar indicator */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${task.priority === 'high' ? 'bg-red-600' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200 truncate max-w-[150px]">
                                        {task.source}
                                    </span>
                                    {task.location && (
                                        <span className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            <Factory className="w-3 h-3 mr-1" /> {task.location}
                                        </span>
                                    )}
                                </div>
                                <h3 className={`font-bold text-lg text-slate-900 mb-1 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                                    {task.title}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-2 font-medium">{task.description}</p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                {task.imageUrl && (
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group-hover:border-slate-300">
                                        <img src={task.imageUrl} alt="Finding" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex flex-col items-end space-y-2">
                                    <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(task.status)}`}>
                                        {t(`tasks.status.${task.status}`)}
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500 font-bold">
                                        <User className="w-3 h-3 mr-1" />
                                        {task.assignee || 'Unassigned'}
                                    </div>
                                    {task.dueDate && (
                                        <div className={`flex items-center text-xs font-bold ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-600' : 'text-slate-400'}`}>
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-300">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <h2 className="font-bold flex items-center text-lg">
                            {editingTask ? <ClipboardList className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                            {editingTask ? 'Edit Action Item' : 'Create New Action'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Context Header for Connected Task */}
                    {editingTask?.location && (
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center">
                            <MapPin className="w-3 h-3 text-red-600 mr-2" />
                            <span className="text-xs font-bold text-slate-600 uppercase">
                                Connected to: <span className="text-slate-900">{editingTask.location}</span>
                            </span>
                        </div>
                    )}
                    
                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                            <input 
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                            <textarea 
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none text-slate-700"
                                value={formDesc}
                                onChange={e => setFormDesc(e.target.value)}
                                placeholder="Details about the finding..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assignee</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
                                    value={formAssignee}
                                    onChange={e => setFormAssignee(e.target.value)}
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
                                    value={formDate}
                                    onChange={e => setFormDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
                                    value={formPriority}
                                    onChange={e => setFormPriority(e.target.value as any)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
                                    value={formStatus}
                                    onChange={e => setFormStatus(e.target.value as any)}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>

                        {editingTask?.imageUrl && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Evidence</label>
                                <div className="h-40 w-full bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                                    <img src={editingTask.imageUrl} className="h-full object-contain" alt="Evidence" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!formTitle}
                            className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 flex items-center disabled:opacity-50 transition-all"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Task
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TaskManager;