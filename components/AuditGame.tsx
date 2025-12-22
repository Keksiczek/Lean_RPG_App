
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AuditScene, LensScanResult, RedTagData } from '../types';
import { AUDIT_SCENES } from '../constants';
import { analyze5SImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CheckCircle2, ArrowLeft, Camera, Scan, Loader2, MapPin, XCircle, ChevronRight, 
  Settings, Package, Users, Lightbulb, ShieldCheck, Zap, AlertTriangle, Trash2, 
  Cpu, Eye, Maximize, Sparkles
} from 'lucide-react';
import { cn } from '../utils/themeColors';

interface AuditGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
  checklist?: string[]; 
  initialContext?: string;
}

const AuditGame: React.FC<AuditGameProps> = ({ onComplete, onExit, isRealWorldStart = false, checklist = [], initialContext = '' }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedScene, setSelectedScene] = useState<AuditScene | null>(null);
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>({});
  
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LensScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [auditContext, setAuditContext] = useState(initialContext);
  const [isContextConfirmed, setIsContextConfirmed] = useState(!!initialContext);
  const [activeChecklistItems, setActiveChecklistItems] = useState<string[]>(checklist);
  const [selectedHazardIndex, setSelectedHazardIndex] = useState<number | null>(null);

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PREDEFINED_CATEGORIES = [
    { id: 'production', name: t('language') === 'cs' ? 'Výroba a Montáž' : 'Assembly & Production', icon: Settings, color: 'text-blue-500', checklist: ["Nářadí na místě", "Žádné úniky", "Čisté uličky"] },
    { id: 'logistics', name: t('language') === 'cs' ? 'Sklad a Logistika' : 'Warehouse & Logistics', icon: Package, color: 'text-amber-500', checklist: ["Palety v pořádku", "Značení viditelné"] },
    { id: 'quality', name: t('language') === 'cs' ? 'Kvalita a Laboratoř' : 'QA & Laboratory', icon: ShieldCheck, color: 'text-emerald-500', checklist: ["Kalibrace platná", "Vzorky zajištěny"] },
    { id: 'office', name: t('language') === 'cs' ? 'Kanceláře' : 'Administrative Office', icon: Users, color: 'text-purple-500', checklist: ["Stoly organizované", "Kabely uklizené"] }
  ];

  const performLiveScan = useCallback(async () => {
    if (!videoRef.current || isScanning || !isLiveScanning || !!capturedImage) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 640, 480);
    const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
    setIsScanning(true);
    try {
      const result = await analyze5SImage(base64, auditContext, activeChecklistItems);
      setScanResult(result);
    } catch (e) { console.warn("Scan error"); }
    finally { setIsScanning(false); }
  }, [auditContext, activeChecklistItems, isLiveScanning, isScanning, capturedImage]);

  useEffect(() => {
    if (isLiveScanning && isContextConfirmed && !capturedImage) {
      scanIntervalRef.current = setInterval(performLiveScan, 6000);
    } else if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, [isLiveScanning, isContextConfirmed, capturedImage, performLiveScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLensMode && !capturedImage && videoRef.current && isContextConfirmed) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(err => console.error("Camera error:", err));
    }
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [isLensMode, capturedImage, isContextConfirmed]);

  const syncTag = async (index: number) => {
    if (!scanResult || !user) return;
    const hazard = scanResult.detectedHazards[index];
    try {
      await gameService.createTask({
        title: `${t('games.audit.finding')}: ${hazard.name}`,
        description: hazard.suggestion,
        status: 'open',
        priority: hazard.severity.toLowerCase() as any,
        category: '5S',
        source: 'Live AR Scanner',
        location: auditContext,
        imageUrl: capturedImage || undefined
      });
      const newHazards = [...scanResult.detectedHazards];
      newHazards.splice(index, 1);
      setScanResult({ ...scanResult, detectedHazards: newHazards });
      setSelectedHazardIndex(null);
      if (newHazards.length === 0) onComplete(150, 100, "AR 5S Audit");
    } catch (e) { alert(t('common.error')); }
  };

  if (!selectedScene && !isLensMode) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 font-bold hover:text-slate-900 uppercase text-xs tracking-widest"><ArrowLeft className="w-4 h-4 mr-2" /> {t('common.cancel')}</button>
          <button onClick={() => setIsLensMode(true)} className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest hover:scale-105 shadow-lg"><Camera className="w-4 h-4 mr-2 inline" /> {t('games.audit.arTitle')}</button>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12"><Zap className="w-64 h-64" /></div>
           <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{t('games.audit.title')}</h2>
              <p className="text-slate-400 text-lg">{t('games.audit.subtitle')}</p>
           </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {AUDIT_SCENES.map(scene => (
            <div key={scene.id} onClick={() => setSelectedScene(scene)} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 cursor-pointer hover:border-red-500 transition-all group">
              <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">{scene.title}</h3>
              <p className="text-slate-500 text-sm mt-2">{scene.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLensMode) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] flex flex-col font-sans overflow-hidden">
        {!isContextConfirmed && (
          <div className="flex-1 flex flex-col p-8 md:p-16 overflow-y-auto">
            <header className="mb-12 flex justify-between items-start">
               <div>
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t('games.audit.arSetup')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">{t('games.audit.arHint')}</p>
               </div>
               <button onClick={() => setIsLensMode(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform"><XCircle className="w-8 h-8 text-slate-400" /></button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
               {PREDEFINED_CATEGORIES.map(cat => (
                 <button key={cat.id} onClick={() => { setAuditContext(cat.name); setActiveChecklistItems(cat.checklist); setIsContextConfirmed(true); setIsLiveScanning(true); }} className="flex flex-col items-start p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-red-500 transition-all text-left bg-white dark:bg-slate-900 group shadow-sm hover:shadow-2xl">
                    <div className={cn("p-5 rounded-2xl mb-6 bg-slate-50 dark:bg-slate-800", cat.color)}><cat.icon className="w-10 h-10" /></div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{cat.name}</h3>
                 </button>
               ))}
            </div>
          </div>
        )}

        {isContextConfirmed && (
          <div className="relative flex-1 bg-black flex flex-col">
            <div className="relative flex-1 bg-slate-900 overflow-hidden">
              {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover" /> : <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-80" />}
              {scanResult && scanResult.detectedHazards.map((h, i) => (
                  <button key={i} onClick={() => { if (!capturedImage) { const v = videoRef.current; if (v) { const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d')?.drawImage(v, 0, 0); setCapturedImage(c.toDataURL()); setIsLiveScanning(false); } } setSelectedHazardIndex(i); }} className={cn("absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-4 flex items-center justify-center transition-all z-20", selectedHazardIndex === i ? "border-white bg-red-600 scale-125" : "border-red-600 bg-red-600/30 hover:scale-110")} style={{ top: `${h.location?.top || 50}%`, left: `${h.location?.left || 50}%` }}>
                      {h.severity === 'High' ? <AlertTriangle className="w-6 h-6 text-white" /> : <Zap className="w-4 h-4 text-white" />}
                  </button>
              ))}
              {!capturedImage && isLiveScanning && <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="w-full h-1 bg-red-500/50 absolute top-0 left-0 animate-[scan_4s_linear_infinite]" /></div>}
              {scanResult && selectedHazardIndex !== null && (
                <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 z-50 animate-slide-up border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full flex items-center gap-2 w-fit"><Sparkles className="w-4 h-4" /> AI Insight</span>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-4 leading-none">{t('games.audit.confirmTag')}</h4>
                        </div>
                        <button onClick={() => { setSelectedHazardIndex(null); if (!capturedImage) setIsLiveScanning(true); }} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full"><XCircle className="w-8 h-8 text-slate-400" /></button>
                    </div>
                    <div className="space-y-6 mb-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objekt</p>
                               <p className="font-bold text-slate-900 dark:text-white truncate">{scanResult.detectedHazards[selectedHazardIndex].name}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Piliíř</p>
                               <p className="font-bold text-slate-900 dark:text-white">{scanResult.detectedHazards[selectedHazardIndex].action}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border-l-8 border-red-500 shadow-inner">
                           <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">{t('games.audit.recommendation')}</p>
                           <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">"{scanResult.detectedHazards[selectedHazardIndex].suggestion}"</p>
                        </div>
                    </div>
                    <button onClick={() => syncTag(selectedHazardIndex)} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all">
                        <ShieldCheck className="w-6 h-6" /> {t('games.audit.issueTag')}
                    </button>
                </div>
              )}
            </div>
            <div className="h-32 bg-slate-950 border-t border-white/10 flex items-center justify-between px-10">
              <button onClick={() => { setCapturedImage(null); setIsLiveScanning(true); setScanResult(null); }} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Reset</button>
              <button onClick={onExit} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">{t('common.finish')}</button>
              <button onClick={onExit} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedScene) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-32">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedScene(null)} className="flex items-center text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> {t('common.previous')}</button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedScene.title}</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden divide-y dark:divide-slate-800">
            {selectedScene.items.map((item) => (
              <div key={item.id} onClick={() => setLocalChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }))} className={cn("p-8 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group", localChecklist[item.id] && "bg-red-50/30 dark:bg-red-900/5")}>
                <div className="flex items-center gap-8">
                  <div className={cn("w-12 h-12 rounded-2xl border-4 flex items-center justify-center transition-all duration-300", localChecklist[item.id] ? "bg-red-600 border-red-600 text-white" : "border-slate-100 dark:border-slate-800")}>{localChecklist[item.id] ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}</div>
                  <div><p className={cn("font-black uppercase tracking-tight text-xl mb-1", localChecklist[item.id] ? "text-slate-900 dark:text-white" : "text-slate-500")}>{item.name}</p></div>
                </div>
              </div>
            ))}
        </div>
        <button onClick={() => onComplete(selectedScene.xpReward, 100, selectedScene.title)} className="w-full py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center group">{t('common.finish')} <ChevronRight className="w-6 h-6 ml-4" /></button>
      </div>
    );
  }
  return null;
};

export default AuditGame;
