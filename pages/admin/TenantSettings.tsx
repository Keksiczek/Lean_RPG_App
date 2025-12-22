
import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { 
  Save, 
  Upload, 
  Palette, 
  ToggleRight, 
  Globe, 
  Zap, 
  ShieldAlert, 
  Loader2,
  CheckCircle,
  Mail,
  Users
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/themeColors';

const TenantSettings: React.FC = () => {
  const { tenant, refetchTenant } = useTenant();
  const { isSuperAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    primaryColor: tenant?.primaryColor || '#DC2626',
    secondaryColor: tenant?.secondaryColor || '#1F2937',
    welcomeMessage: tenant?.settings.welcomeMessage || '',
    supportEmail: tenant?.settings.supportEmail || '',
    xpMultiplier: tenant?.settings.xpMultiplier || 1.0,
  });

  const { execute: updateTenant, loading } = useMutation(ENDPOINTS.ADMIN.TENANT, 'PUT');

  const handleSave = async () => {
    try {
      await updateTenant(formData);
      success('Settings Saved', 'Organization profile updated successfully.');
      refetchTenant();
    } catch (err) {
      toastError('Save Failed', 'Configuration could not be saved.');
    }
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
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Tenant Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage branding and system-wide rules for your organization.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-900 dark:bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <Section title="Visual Branding" desc="Customize colors and logos to match your corporate identity." icon={Palette}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Primary Color (Action)</label>
              <div className="flex gap-4">
                 <input 
                   type="color" 
                   value={formData.primaryColor}
                   onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                   className="w-12 h-12 rounded-xl border-0 p-0 cursor-pointer"
                 />
                 <input 
                   type="text" 
                   value={formData.primaryColor}
                   onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                   className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm"
                 />
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Secondary Color (Sidebar)</label>
              <div className="flex gap-4">
                 <input 
                   type="color" 
                   value={formData.secondaryColor}
                   onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                   className="w-12 h-12 rounded-xl border-0 p-0 cursor-pointer"
                 />
                 <input 
                   type="text" 
                   value={formData.secondaryColor}
                   onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                   className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm"
                 />
              </div>
           </div>
           <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Organization Logo</label>
              <div className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center group hover:border-red-500/20 transition-all cursor-pointer">
                 <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                 <p className="text-sm font-bold text-slate-400">Drag & drop logo or <span className="text-red-600">click to upload</span></p>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase">PNG, JPG up to 2MB. Recommended 200x200px.</p>
              </div>
           </div>
        </div>
      </Section>

      <Section title="Feature Management" desc="Enable or disable specific modules for your factory." icon={ToggleRight}>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(tenant?.features || {}).map((f: any) => (
              <label key={f} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{f.replace(/([A-Z])/g, ' $1')}</span>
                 <input type="checkbox" defaultChecked={tenant?.features[f as keyof typeof tenant.features]} className="w-6 h-6 accent-emerald-500" />
              </label>
            ))}
         </div>
      </Section>

      <Section title="System Rules" desc="Configure growth rate and support details." icon={Zap}>
         <div className="space-y-6">
            <div>
               <label className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-4">
                  <span>XP Multiplier Bonus</span>
                  <span className="text-red-600">{formData.xpMultiplier}x</span>
               </label>
               <input 
                 type="range" min="0.5" max="2.0" step="0.1" 
                 value={formData.xpMultiplier}
                 onChange={e => setFormData({...formData, xpMultiplier: parseFloat(e.target.value)})}
                 className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-red-600 cursor-pointer"
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      placeholder="ci-team@company.com"
                      value={formData.supportEmail}
                      onChange={e => setFormData({...formData, supportEmail: e.target.value})}
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Default Locale</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none appearance-none">
                       <option>English (US)</option>
                       <option>Čeština (CZ)</option>
                       <option>Deutsch (DE)</option>
                    </select>
                  </div>
               </div>
            </div>
         </div>
      </Section>

      {isSuperAdmin && (
        <Section title="Danger Zone" desc="Destructive actions. Access restricted to Super Admins." icon={ShieldAlert}>
           <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                 <p className="font-bold text-red-700 dark:text-red-400">Deactivate Organization</p>
                 <p className="text-xs text-red-600/70">Users will no longer be able to log in or access training.</p>
              </div>
              <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Deactivate Tenant</button>
           </div>
        </Section>
      )}
    </div>
  );
};

export default TenantSettings;
