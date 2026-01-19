import React, { useState } from 'react';
import {
    ClipboardList,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle,
    Clock,
    Settings2,
    Tag
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/themeColors';

interface TaskTemplate {
    id: string;
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    isMandatory: boolean;
    frequency: 'once' | 'daily' | 'weekly';
}

const TaskConfiguration: React.FC = () => {
    const { success } = useToast();
    const [categories, setCategories] = useState(['5S', 'Safety', 'Maintenance', 'Quality', 'Process']);
    const [newCategory, setNewCategory] = useState('');

    const [templates, setTemplates] = useState<TaskTemplate[]>([
        { id: '1', title: 'Daily 5S Workplace Audit', category: '5S', priority: 'high', isMandatory: true, frequency: 'daily' },
        { id: '2', title: 'Weekly PPE Safety Check', category: 'Safety', priority: 'high', isMandatory: true, frequency: 'weekly' },
        { id: '3', title: 'Monthly Machine Calibration', category: 'Maintenance', priority: 'medium', isMandatory: false, frequency: 'weekly' },
    ]);

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
            success('Category Added', `${newCategory} has been added to the system.`);
        }
    };

    const handleDeleteCategory = (cat: string) => {
        setCategories(categories.filter(c => c !== cat));
    };

    const toggleMandatory = (id: string) => {
        setTemplates(templates.map(t =>
            t.id === id ? { ...t, isMandatory: !t.isMandatory } : t
        ));
        success('Template Updated', 'Automatic task assignment modified.');
    };

    const Section = ({ title, desc, icon: Icon, children }: any) => (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-500">{desc}</p>
                </div>
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Task Configuration</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage task procedural logic and automatic assignment rules.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Section title="Categories" desc="Manage task classification." icon={Tag}>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    placeholder="New category..."
                                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 rounded-xl outline-none text-sm font-bold"
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="p-2 bg-slate-900 dark:bg-red-600 text-white rounded-xl hover:scale-110 transition-transform"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full group">
                                        <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">{cat}</span>
                                        <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-2 text-red-700 dark:text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-black uppercase text-sm tracking-tight">Procedural Guard</h4>
                        </div>
                        <p className="text-xs text-red-600/80 leading-relaxed">
                            Changes to categories will affect real-time filtering for all active operators across the tenant. Use with caution.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Section title="Task Templates & Automation" desc="Define recurring tasks that are automatically assigned." icon={Settings2}>
                        <div className="space-y-4">
                            {templates.map(template => (
                                <div key={template.id} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-red-500/20 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl bg-opacity-10",
                                                template.priority === 'high' ? "bg-red-500 text-red-500" : "bg-blue-500 text-blue-500"
                                            )}>
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{template.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-lg">{template.category}</span>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {template.frequency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleMandatory(template.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                template.isMandatory
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}
                                        >
                                            {template.isMandatory ? 'Mandatory' : 'Optional'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold text-sm hover:border-red-500/20 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> New Automated Template
                            </button>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default TaskConfiguration;
