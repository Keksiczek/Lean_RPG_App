import React, { useState } from 'react';
import { ViewState, Workplace } from '../types';
import { Factory, AlertCircle, CheckCircle, Package, Settings, Users, ArrowRight, ScanLine, ShieldCheck, ClipboardList, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { WORKPLACES } from '../constants';

interface FactoryMapProps {
  onNavigate: (view: ViewState, isRealWorld?: boolean, contextData?: any) => void;
}

const FactoryMap: React.FC<FactoryMapProps> = ({ onNavigate }) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'optimal': return 'bg-emerald-600 border-emerald-400';
      case 'warning': return 'bg-amber-500 border-amber-300';
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
          <h1 className="text-2xl font-bold text-gray-900">{t('map.title')}</h1>
          <p className="text-gray-500">{t('map.subtitle')}</p>
        </div>
        <div className="flex space-x-4 text-sm">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></span> {t('map.zones.optimal')}</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> {t('map.zones.warning')}</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span> {t('map.zones.critical')}</div>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden shadow-inner group">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>

        {/* Decorative Elements (Simulating Floor Plan) */}
        <div className="absolute top-[10%] left-[10%] w-[60%] h-[40%] border-4 border-gray-300 rounded-xl pointer-events-none opacity-50"></div>
        <div className="absolute top-[10%] right-[10%] w-[15%] h-[80%] border-4 border-gray-300 rounded-xl pointer-events-none opacity-50"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[30%] border-4 border-gray-300 rounded-xl pointer-events-none opacity-50"></div>

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
              
              {/* Status Badge Icon */}
              <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm ${
                wp.status === 'optimal' ? 'bg-emerald-600' : wp.status === 'warning' ? 'bg-amber-500' : 'bg-red-600'
              }`}>
                {getStatusIcon(wp.status)}
              </div>

              {/* Red Tag Counter */}
              {wp.redTags > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wp.redTags}
                </div>
              )}
            </div>
            <div className="mt-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-bold text-white whitespace-nowrap shadow-sm flex flex-col items-center">
                <span>{wp.name}</span>
                <span className={`text-[9px] uppercase tracking-wider ${
                    wp.status === 'optimal' ? 'text-emerald-400' : wp.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                }`}>
                    {wp.status}
                </span>
            </div>
          </button>
        ))}

        {/* Selection Modal / Popover */}
        {selectedWorkplace && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white rounded-xl shadow-2xl p-5 border border-gray-200 animate-slide-up z-30 flex flex-col max-h-[80%]">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-xl text-gray-900">{selectedWorkplace.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded">{selectedWorkplace.type} Zone</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded flex items-center ${
                          selectedWorkplace.status === 'optimal' ? 'bg-emerald-100 text-emerald-800' : 
                          selectedWorkplace.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                          {getStatusIcon(selectedWorkplace.status)}
                          <span className="ml-1">{selectedWorkplace.status}</span>
                      </span>
                  </div>
               </div>
               <button onClick={() => setSelectedWorkplace(null)} className="text-gray-400 hover:text-gray-600">
                 <span className="sr-only">Close</span>
                 &times;
               </button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">{t('map.redTags')}</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedWorkplace.redTags}</span>
                </div>
            </div>

            {/* CHECKLIST SECTION */}
            <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-gray-100 py-3">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-blue-600" />
                        Standard 5S Checklist
                    </h4>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100">Edit (Admin)</span>
                </div>
                <ul className="space-y-2">
                    {selectedWorkplace.checklist.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="mr-2 text-gray-400">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => onNavigate(ViewState.GAME_AUDIT, true, { checklist: selectedWorkplace.checklist, context: selectedWorkplace.name })}
                  className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-md"
                >
                    <ScanLine className="w-4 h-4 mr-2" /> {t('map.scan')}
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.GAME_LPA, true, { checklist: selectedWorkplace.checklist, context: selectedWorkplace.name })}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-md"
                >
                    <ShieldCheck className="w-4 h-4 mr-2" /> {t('map.lpa')}
                </button>
            </div>
            <button 
              onClick={() => onNavigate(ViewState.GAME_HUB, false)}
              className="w-full mt-3 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-md"
            >
                {t('map.train')} <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryMap;