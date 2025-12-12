import React, { useEffect, useState } from 'react';
import { ChecklistTemplate } from '../types';
import { checklistService } from '../services/checklistService';
import { Edit2, Copy, Trash, Plus, FileText, CheckCircle } from 'lucide-react';
import AuditBuilderModal from './AuditBuilderModal';
import { useAdmin } from '../contexts/AdminContext';

const ChecklistManager: React.FC = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuditManager } = useAdmin();

  const loadTemplates = async () => {
    const data = await checklistService.getTemplates();
    setTemplates(data);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await checklistService.deleteTemplate(id);
      loadTemplates();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Checklist Templates</h2>
        {isAuditManager && (
          <button 
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Template
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                template.category === '5S' ? 'bg-red-100 text-red-700' :
                template.category === 'LPA' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {template.category}
              </div>
              <span className="text-xs text-gray-400 font-mono">v{template.version}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
            <p className="text-gray-500 text-sm mb-4 h-10 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center text-xs text-gray-500 mb-4">
              <FileText className="w-3 h-3 mr-1" /> {template.items.length} Items
            </div>

            {isAuditManager && (
              <div className="flex border-t border-gray-100 pt-3 gap-2">
                <button onClick={() => handleEdit(template)} className="flex-1 text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center justify-center">
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </button>
                <button className="flex-1 text-gray-600 hover:text-green-600 text-sm font-medium flex items-center justify-center">
                  <Copy className="w-3 h-3 mr-1" /> Clone
                </button>
                <button onClick={() => handleDelete(template.id)} className="flex-1 text-gray-600 hover:text-red-600 text-sm font-medium flex items-center justify-center">
                  <Trash className="w-3 h-3 mr-1" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AuditBuilderModal 
          initialTemplate={editingTemplate}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
};

export default ChecklistManager;
