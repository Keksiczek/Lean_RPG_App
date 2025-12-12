import React, { useEffect, useState } from 'react';
import { Player, AdminRole } from '../types';
import { userService } from '../services/userService';
import { Users, Shield, Award, Edit2, Plus, Trash2, X, Save, Mail, User } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<Player>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getAll();
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      await userService.delete(userId);
      loadUsers();
    }
  };

  const handleEdit = (user: Player) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser({ role: AdminRole.OPERATOR, username: '', email: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser.username || !editingUser.email) {
      alert("Username and Email are required.");
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingUser.id) {
        await userService.update(editingUser.id, editingUser);
      } else {
        await userService.create(editingUser);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (e) {
      alert("Failed to save user.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case AdminRole.TENANT_ADMIN: return "bg-purple-100 text-purple-700 border-purple-200";
      case AdminRole.AUDIT_MANAGER: return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-800">User Management</h2>
           <p className="text-sm text-gray-500">Manage access and roles.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="p-4 font-bold">User</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold">Stats</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded border uppercase ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-xs text-gray-600">
                        <Award className="w-4 h-4 mr-1 text-amber-500" />
                        Lvl {user.level}
                    </div>
                    <div className="text-xs text-gray-400">
                        {user.totalXp.toLocaleString()} XP
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(user)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                <h3 className="font-bold">{editingUser.id ? 'Edit User' : 'Add New User'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            value={editingUser.username || ''}
                            onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            value={editingUser.email || ''}
                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="email@company.com"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <select 
                            value={editingUser.role || AdminRole.OPERATOR}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value={AdminRole.OPERATOR}>Operator</option>
                            <option value={AdminRole.AUDIT_MANAGER}>Audit Manager</option>
                            <option value={AdminRole.TENANT_ADMIN}>Tenant Admin</option>
                        </select>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        * Admins have full access. Managers can approve audits.
                    </p>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" /> Save User
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;