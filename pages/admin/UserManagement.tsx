
import React, { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { UserWithRole, UserRole } from '../../types';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Shield, 
  Mail, 
  Ban, 
  CheckCircle2, 
  Edit2, 
  Key,
  X,
  Loader2
} from 'lucide-react';
import ApiError from '../../components/ui/ApiError';
import Skeleton from '../../components/ui/Skeleton';
import { cn } from '../../utils/themeColors';
import { useToast } from '../../hooks/useToast';

const UserManagement: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: users, loading, error, refetch } = useFetch<UserWithRole[]>(ENDPOINTS.ADMIN.USERS);
  /* FIX: Passing placeholder string as base endpoint because the actual path is constructed dynamically during execute() */
  const { execute: updateRole } = useMutation<any, any>('DYNAMIC_ENDPOINT', 'PUT');

  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      /* FIX: construction of dynamic endpoint via second argument of execute() */
      await updateRole({ role: newRole }, ENDPOINTS.ADMIN.USER_ROLE(userId));
      success('Role Updated', 'User role has been successfully changed.');
      refetch();
    } catch (err) {
      toastError('Update Failed', 'Could not update user role.');
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'admin': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  if (error) return <ApiError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total active users: {filteredUsers.length}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-50 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex-1 md:flex-none px-6 py-2 bg-slate-900 dark:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
           >
              <Plus className="w-4 h-4" /> Add User
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 bg-gray-50/50 dark:bg-slate-900/50">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
           </div>
           <select 
             value={roleFilter}
             onChange={e => setRoleFilter(e.target.value)}
             className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
           >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
           </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <th className="p-4">User Details</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Progress</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton variant="text" width="60%" /></td>
                    <td className="p-4"><Skeleton variant="rounded" width={80} height={24} className="mx-auto" /></td>
                    <td className="p-4"><Skeleton variant="text" width="40%" className="mx-auto" /></td>
                    <td className="p-4"><Skeleton variant="text" width="70%" className="mx-auto" /></td>
                    <td className="p-4"><Skeleton variant="circular" width={32} height={32} className="ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">No users found matching your filters.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                            {user.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-full border", getRoleStyle(user.role))}>
                          {user.role}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <div className="flex items-center justify-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Active</span>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <div>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300">Level {user.level}</p>
                          <p className="text-[10px] text-slate-400">{user.xp.toLocaleString()} XP</p>
                       </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-1">
                          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 rounded-lg transition-colors" title="Edit Permissions">
                             <Shield className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-500 rounded-lg transition-colors" title="Reset Password">
                             <Key className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Deactivate">
                             <Ban className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Implementation detail placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-800">
              <div className="p-6 flex justify-between items-center border-b dark:border-slate-800">
                 <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Add New User</h2>
                 <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="p-8 space-y-4">
                 <p className="text-sm text-slate-500">Please enter the email address to send an invitation.</p>
                 <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" placeholder="user@company.com" />
                 <button className="w-full py-4 bg-slate-900 dark:bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl">Send Invite</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
