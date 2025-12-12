import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import ChecklistManager from '../../components/ChecklistManager';
import AuditApprovalQueue from '../../components/AuditApprovalQueue';
import WorkplaceManager from '../../components/WorkplaceManager';
import UserManager from '../../components/UserManager';
import { Shield, FileText, Users, BarChart2, Briefcase, Lock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuditManager } = useAdmin();
  const [activeTab, setActiveTab] = useState<'audits' | 'checklists' | 'workplaces' | 'users'>('audits');

  // Redirect if user loses admin privileges while on restricted tab
  useEffect(() => {
    if ((activeTab === 'workplaces' || activeTab === 'users') && !isAdmin) {
      setActiveTab('audits');
    }
  }, [isAdmin, activeTab]);

  // Access Control: Must be at least Audit Manager
  if (!isAuditManager) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-red-100">
           <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
             <Lock className="w-8 h-8 text-red-600" />
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
           <p className="text-gray-500">You do not have permission to view the Admin Console. Audit Manager privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-600" />
          Admin Console
        </h1>
        <p className="text-sm text-gray-500 ml-9">Manage audits, checklists, facility, and users.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('audits')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'audits' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <BarChart2 className="w-4 h-4 mr-2" /> Audit Management
           </button>
           <button 
             onClick={() => setActiveTab('checklists')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'checklists' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <FileText className="w-4 h-4 mr-2" /> Checklists
           </button>
           
           {isAdmin && (
             <>
               <button 
                 onClick={() => setActiveTab('workplaces')}
                 className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'workplaces' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 <Briefcase className="w-4 h-4 mr-2" /> Workplaces
               </button>
               <button 
                 onClick={() => setActiveTab('users')}
                 className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 <Users className="w-4 h-4 mr-2" /> Users
               </button>
             </>
           )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
           {activeTab === 'audits' && <AuditApprovalQueue />}
           {activeTab === 'checklists' && <ChecklistManager />}
           {activeTab === 'workplaces' && isAdmin && <WorkplaceManager />}
           {activeTab === 'users' && isAdmin && <UserManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;