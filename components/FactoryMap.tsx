import React, { useState } from 'react';
import { ViewState, Workplace } from '../types';
import { Factory, AlertTriangle, CheckCircle, Package, Settings, Users, ArrowRight, ScanLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FactoryMapProps {
  onNavigate: (view: ViewState, isRealWorld?: boolean) => void;
}

// Mock Data for Workplaces
const WORKPLACES: Workplace[] = [
  {
    id: 'wp-1',
    name: 'Assembly Line A',
    type: 'production',
    coordinates: { x: 20, y: 30 },
    status: 'warning',
    redTags: 2,
    activeTrainingModules: 1
  },
  {
    id: 'wp-2',
    name: 'Paint Shop',
    type: 'production',
    coordinates: { x: 50, y: 20 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 2
  },
  {
    id: 'wp-3',
    name: 'Warehouse Dispatch',
    type: 'logistics',
    coordinates: { x: 80, y: 40 },
    status: 'critical',
    redTags: 5,
    activeTrainingModules: 1
  },
  {
    id: 'wp-4',
    name: 'QA Lab',
    type: 'quality',
    coordinates: { x: 30, y: 70 },
    status: 'optimal',
    redTags: 0,
    activeTrainingModules: 1
  },
  {
    id: 'wp-5',
    name: 'Manager Office',
    type: 'office',
    coordinates: { x: 70, y: 75 },
    status: 'warning',
    redTags: 1,
    activeTrainingModules: 0
  }
];

const FactoryMap: React.FC<FactoryMapProps> = ({ onNavigate }) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'optimal': return 'bg-emerald-600';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-500';
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
              <div className={`w-12 h-12 rounded-sm shadow-lg flex items-center justify-center border-2 border-white ${getStatusColor(wp.status)}`}>
                {getIcon(wp.type)}
              </div>
              
              {/* Badges */}
              {wp.redTags > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wp.redTags}
                </div>
              )}
            </div>
            <div className="mt-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-white whitespace-nowrap shadow-sm">
                {wp.name}
            </div>
          </button>
        ))}

        {/* Selection Modal / Popover */}
        {selectedWorkplace && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white rounded-xl shadow-2xl p-5 border border-gray-200 animate-slide-up z-30">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedWorkplace.name}</h3>
                  <span className="text-xs font-medium text-gray-500 uppercase">{selectedWorkplace.type} Zone</span>
               </div>
               <button onClick={() => setSelectedWorkplace(null)} className="text-gray-400 hover:text-gray-600">
                 <span className="sr-only">Close</span>
                 &times;
               </button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">{t('map.redTags')}</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedWorkplace.redTags}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <Factory className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Simulations</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedWorkplace.activeTrainingModules} {t('map.available')}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onNavigate(ViewState.GAME_AUDIT, true)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-md"
                >
                    <ScanLine className="w-4 h-4 mr-2" /> {t('map.scan')}
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.GAME_HUB)}
                  className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-md"
                >
                    {t('map.train')} <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryMap;