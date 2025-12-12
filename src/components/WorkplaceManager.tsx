import React, { useEffect, useState } from 'react';
import { Workplace } from '../../types';
import { workplaceService } from '../services/workplaceService';
import { Factory, AlertCircle, CheckCircle, XCircle, Edit2, Plus, Save, X } from 'lucide-react';

const WorkplaceManager: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [editingWp, setEditingWp] = useState<Workplace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadWorkplaces();
  }, []);

  const loadWorkplaces = async () => {
    const data = await workplaceService.getAll();
    setWorkplaces(data);
  };

  const handleEdit = (wp: Workplace) => {
    setEditingWp({ ...wp });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingWp) {
      await workplaceService.update(editingWp.id, editingWp);
      setIsModalOpen(false);
      setEditingWp(null);
      loadWorkplaces();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Workplace Management</h2>
        <button 
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-800"
          onClick={() => alert("Create Workplace Mock")}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Workplace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workplaces.map(wp => (
          <div key={wp.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <Factory className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{wp.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{wp.type}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 {getStatusIcon(wp.status)}
                 <span className={`text-[10px] font-bold uppercase mt-1 ${
                     wp.status === 'optimal' ? 'text-emerald-600' : 
                     wp.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                 }`}>
                     {wp.status}
                 </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Red Tags</span>
                    <span className="font-bold">{wp.redTags}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Modules</span>
                    <span className="font-bold">{wp.activeTrainingModules}</span>
                </div>
            </div>

            <button 
              onClick={() => handleEdit(wp)}
              className="w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit Configuration
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && editingWp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                <h3 className="font-bold">Edit Workplace</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                    <input 
                        value={editingWp.name}
                        onChange={(e) => setEditingWp({...editingWp, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                        value={editingWp.status}
                        onChange={(e) => setEditingWp({...editingWp, status: e.target.value as any})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="optimal">Optimal</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkplaceManager;
