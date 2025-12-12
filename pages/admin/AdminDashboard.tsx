import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminRole } from '../../types';
import ChecklistManager from '../../components/ChecklistManager';
import { Shield, FileText, Users, AlertCircle, BarChart2 } from 'lucide-react';

// Sub-components placeholder for specific admin tabs
const WorkplacesAdmin = () => <div className="p-10 text-center text-gray-500">Workplace Management Module (Coming Soon)</div>;
const UsersAdmin = () => <div className="p-10 text-center text-gray-500">User Role Management Module (Coming Soon)</div>;
const AuditsAdmin = () => <div className="p-10 text-center text-gray-500">Audit History & Approval Queue (Coming Soon)</div>;

const AdminDashboard: React.FC = () => {
  const { role, isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'audits' | 'checklists' | 'workplaces' | 'users'>('audits');

  if (!isAdmin && role !== AdminRole.AUDIT_MANAGER) {
    return <div className="p-10 text-center text-red-600 font-bold">Access Denied. Tenant Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-600" />
          Admin Console
        </h1>
        <p className="text-sm text-gray-500 ml-9">Manage audits, checklists, and facility compliance.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('audits')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'audits' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <BarChart2 className="w-4 h-4 mr-2" /> Audits
           </button>
           <button 
             onClick={() => setActiveTab('checklists')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'checklists' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <FileText className="w-4 h-4 mr-2" /> Templates
           </button>
           <button 
             onClick={() => setActiveTab('workplaces')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'workplaces' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <AlertCircle className="w-4 h-4 mr-2" /> Workplaces
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Users className="w-4 h-4 mr-2" /> Users
           </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
           {activeTab === 'checklists' && <ChecklistManager />}
           {activeTab === 'audits' && <AuditsAdmin />}
           {activeTab === 'workplaces' && <WorkplacesAdmin />}
           {activeTab === 'users' && <UsersAdmin />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
