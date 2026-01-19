import React, { useState } from 'react';
import { ChecklistTemplate, ChecklistItem } from '../types';
import { X, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { checklistService } from '../services/checklistService';

interface AuditBuilderModalProps {
  initialTemplate?: ChecklistTemplate;
  onClose: () => void;
  onSave: () => void;
}

const AuditBuilderModal: React.FC<AuditBuilderModalProps> = ({ initialTemplate, onClose, onSave }) => {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [category, setCategory] = useState<any>(initialTemplate?.category || '5S');
  const [items, setItems] = useState<ChecklistItem[]>(initialTemplate?.items || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      question: '',
      expected_answer: 'Yes',
      scoring_weight: 5,
      guidance: '',
      photo_required: false,
      category: category
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ChecklistItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set custom drag image or data if needed
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Allow dropping
    if (draggedIndex === null || draggedIndex === index) return;

    // Create a copy and swap items
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the item from its original position
    newItems.splice(draggedIndex, 1);
    // Insert it at the new position
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!name || items.length === 0) return alert("Name and at least one item required.");

    const templateData: Partial<ChecklistTemplate> = {
      name,
      description,
      category,
      items,
      isPublic: true,
      version: initialTemplate ? initialTemplate.version + 1 : 1
    };

    if (initialTemplate) {
      await checklistService.updateTemplate(initialTemplate.id, templateData);
    } else {
      await checklistService.createTemplate(templateData);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">{initialTemplate ? 'Edit Template' : 'Create New Checklist'}</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Template Name</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Daily Line Audit"
              />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
               <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
               >
                 <option value="5S">5S</option>
                 <option value="LPA">LPA</option>
                 <option value="Safety">Safety</option>
                 <option value="Custom">Custom</option>
               </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <input 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Purpose of this checklist..."
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-bold text-gray-700 mb-3">Checklist Items</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-gray-50 p-4 rounded-lg border flex gap-4 items-start transition-all duration-200 ${
                    draggedIndex === idx 
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.01] opacity-90' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="flex flex-col gap-1 mt-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input 
                        value={item.question} onChange={e => updateItem(item.id, 'question', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm font-medium"
                        placeholder="Question / Check Item"
                      />
                    </div>
                    <div>
                      <select 
                        value={item.expected_answer} onChange={e => updateItem(item.id, 'expected_answer', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="Yes">Expect Yes</option>
                        <option value="No">Expect No</option>
                        <option value="Text">Text Input</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                       <input 
                        value={item.guidance} onChange={e => updateItem(item.id, 'guidance', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-xs text-gray-600"
                        placeholder="Guidance for auditor if fails..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                       <label className="flex items-center text-xs font-bold text-gray-600">
                         <input 
                           type="checkbox" 
                           checked={item.photo_required} 
                           onChange={e => updateItem(item.id, 'photo_required', e.target.checked)}
                           className="mr-2"
                         />
                         Photo Req.
                       </label>
                       <input 
                         type="number"
                         value={item.scoring_weight}
                         onChange={e => updateItem(item.id, 'scoring_weight', parseInt(e.target.value))}
                         className="w-16 p-1 border border-gray-300 rounded text-xs"
                         title="Score Weight"
                       />
                    </div>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-4 flex items-center text-blue-600 font-bold text-sm hover:underline">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditBuilderModal;