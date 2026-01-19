import React from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { DEMO_TENANTS } from '../../data/demoTenants';
import { Settings } from 'lucide-react';

/**
 * Dev-only floating tenant switcher.
 * Allows quick switching between demo tenants without changing URL.
 */
const TenantSwitcher: React.FC = () => {
    const { tenantId, switchTenant, tenant } = useTenant();
    const [isOpen, setIsOpen] = React.useState(false);

    // Only show in development
    if ((import.meta as any).env.PROD) return null;

    const tenantIds = Object.keys(DEMO_TENANTS);

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center hover:bg-slate-700 transition-all"
                title="Tenant Switcher (Dev)"
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute bottom-14 left-0 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 min-w-[200px]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Switch Tenant</h4>
                    <div className="space-y-1">
                        {tenantIds.map((id) => {
                            const t = DEMO_TENANTS[id];
                            const isActive = id === tenantId;
                            return (
                                <button
                                    key={id}
                                    onClick={() => {
                                        switchTenant(id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${isActive
                                        ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: t.primaryColor }}
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{t.name}</span>
                                    {isActive && <span className="text-xs text-green-500 ml-auto">●</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400">
                            Current: <span className="font-mono">{tenantId}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                            XP Mult: <span className="font-mono">{tenant?.settings.xpMultiplier || 1}x</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantSwitcher;
