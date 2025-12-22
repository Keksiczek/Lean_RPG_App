
import React, { useState } from 'react';
import { ViewState, Workplace } from '../types';
import { Factory, AlertCircle, CheckCircle, Package, Settings, Users, ArrowRight, ScanLine, ShieldCheck, ClipboardList, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { WORKPLACES } from '../constants';

interface FactoryMapProps {
  onNavigate: (view: ViewState, data?: any) => void;
}

const FactoryMap: React.FC<FactoryMapProps> = ({ onNavigate }) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'optimal': return 'bg-emerald-600 border-emerald-400';
      case 'warning': return 'bg-amber-50 border-amber-300';
      case 'critical': return 'bg-red-600 border-red-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'optimal': return <CheckCircle className="w-3 h-3 text-white" />;
      case 'warning': return <AlertCircle className="w-3 h-3 text-white" />;
      case 'critical': return <XCircle className="w-3 h-3 text-white" />;
      default: return null;
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'production': return <Settings className="w-5 h-5 text-white" />;
      case 'logistics': return <Package className="w-5 h-5 text-white" />;
      case 'quality': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'office': return <Users className="w-5 h-5 text-white" />;
      default: return <Factory className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('map.title')}</h1>
          <p className="text-gray-500">{t('map.subtitle')}</p>
        </div>
        <div className="flex space-x-4 text-sm">
            <div className="flex items-center text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></span> {t('map.zones.optimal')}</div>
            <div className="flex items-center text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> {t('map.zones.warning')}</div>
            <div className="flex items-center text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span> {t('map.zones.critical')}</div>
        </div>
      </div>

      <div id="digital-twin-map" className="flex-1 relative bg-gray-100 dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-200 dark:border-slate-800 overflow-hidden shadow-inner group">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>

        {/* Workplaces */}
        {WORKPLACES.map((wp) => (
          <button
            key={wp.id}
            onClick={() => setSelectedWorkplace(wp)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              selectedWorkplace?.id === wp.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
            }`}
            style={{ top: `${wp.coordinates.y}%`, left: `${wp.coordinates.x}%` }}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-lg shadow-xl flex items-center justify-center border-b-4 ${getStatusColor(wp.status)}`}>
                {getIcon(wp.type)}
              </div>
              <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm ${
                wp.status === 'optimal' ? 'bg-emerald-600' : wp.status === 'warning' ? 'bg-amber-500' : 'bg-red-600'
              }`}>
                {getStatusIcon(wp.status)}
              </div>
              {wp.redTags > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wp.redTags}
                </div>
              )}
            </div>
            <div className="mt-2 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black text-white whitespace-nowrap shadow-sm flex flex-col items-center">
                <span>{wp.name}</span>
            </div>
          </button>
        ))}

        {selectedWorkplace && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 border border-gray-200 dark:border-slate-800 animate-slide-up z-30 flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{selectedWorkplace.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{selectedWorkplace.type} Zone</span>
                  </div>
               </div>
               <button onClick={() => setSelectedWorkplace(null)} className="text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90">
                 <XCircle className="w-6 h-6" />
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <p className="text-[10px] font-black text-red-400 uppercase mb-1">Open Tags</p>
                    <p className="text-2xl font-black text-red-600">{selectedWorkplace.redTags}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Compliance</p>
                    <p className="text-2xl font-black text-emerald-600">92%</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3" id="ar-scan-btn">
                <button 
                  onClick={() => onNavigate(ViewState.GAME_AUDIT, { isRealWorld: true, checklist: selectedWorkplace.checklist, context: selectedWorkplace.name })}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg"
                >
                    <ScanLine className="w-4 h-4 mr-2" /> Scan
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.GAME_LPA, { isRealWorld: true, checklist: selectedWorkplace.checklist, context: selectedWorkplace.name })}
                  className="bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg"
                >
                    <ShieldCheck className="w-4 h-4 mr-2" /> LPA
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryMap;
