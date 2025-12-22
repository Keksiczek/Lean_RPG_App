
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AuditScene, LensScanResult, RedTagData } from '../types';
import { AUDIT_SCENES, WORKPLACES } from '../constants';
import { analyze5SImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Camera, 
  Scan, 
  Loader2, 
  MapPin, 
  XCircle, 
  ChevronRight, 
  Settings, 
  Package, 
  Users, 
  Lightbulb, 
  ShieldCheck, 
  Zap,
  AlertTriangle,
  Trash2,
  Cpu,
  Eye,
  Maximize,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/themeColors';

interface AuditGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
  checklist?: string[]; 
  initialContext?: string;
}

const PREDEFINED_CATEGORIES = [
  { id: 'production', name: 'Assembly & Production', icon: Settings, color: 'text-blue-500', checklist: ["Tools in shadow boards", "No oil leaks", "Walkways clear", "Parts labeled"] },
  { id: 'logistics', name: 'Warehouse & Logistics', icon: Package, color: 'text-amber-500', checklist: ["Pallets stacked correctly", "Aisles unobstructed", "Labels visible", "PPE in use"] },
  { id: 'quality', name: 'QA & Laboratory', icon: ShieldCheck, color: 'text-emerald-500', checklist: ["Calibration stickers valid", "Surfaces clean", "Samples secured", "Documentation updated"] },
  { id: 'office', name: 'Administrative Office', icon: Users, color: 'text-purple-500', checklist: ["Desks organized", "Confidentiality maintained", "Cables managed", "Common areas tidy"] }
];

const AuditGame: React.FC<AuditGameProps> = ({ onComplete, onExit, isRealWorldStart = false, checklist = [], initialContext = '' }) => {
  const { user } = useAuth();
  const [selectedScene, setSelectedScene] = useState<AuditScene | null>(null);
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>({});
  
  // Real World State
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

  // AR Continuous Loop Logic
  // Fix: Cannot find namespace 'NodeJS'. Using ReturnType<typeof setInterval> for cross-environment compatibility.
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const performLiveScan = useCallback(async () => {
    if (!videoRef.current || isScanning || !isLiveScanning) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640; // Lower res for faster AI processing
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

    setIsScanning(true);
    try {
      const result = await analyze5SImage(base64, auditContext, activeChecklistItems);
      // Merge results with existing ones to maintain stability
      setScanResult(result);
    } catch (e) {
      console.warn("Background scan failed");
    } finally {
      setIsScanning(false);
    }
  }, [auditContext, activeChecklistItems, isLiveScanning, isScanning]);

  useEffect(() => {
    if (isLiveScanning && isContextConfirmed && !capturedImage) {
      scanIntervalRef.current = setInterval(performLiveScan, 5000);
    } else {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isLiveScanning, isContextConfirmed, capturedImage, performLiveScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLensMode && !capturedImage && videoRef.current && isContextConfirmed) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Error camera:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isLensMode, capturedImage, isContextConfirmed]);

  const captureAndFreeze = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 1.0));
    setIsLiveScanning(false);
  };

  const syncTag = async (index: number) => {
    if (!scanResult || !user) return;
    const hazard = scanResult.detectedHazards[index];
    
    try {
      await gameService.createTask({
        title: `Red Tag: ${hazard.name}`,
        description: `Live AI finding: ${hazard.suggestion}. Pillar: ${hazard.action}`,
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

      if (newHazards.length === 0) {
          onComplete(150, scanResult.overallCompliance, "Live AR 5S Scan");
      }
    } catch (e) {
      alert("Failed to sync.");
    }
  };

  if (!selectedScene && !isLensMode) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
          <button onClick={() => setIsLensMode(true)} className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-red-900/20"><Camera className="w-4 h-4 mr-2 inline" /> Real World AR Scan</button>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10"><Zap className="w-40 h-40" /></div>
           <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">5S Methodology</h2>
              <p className="text-slate-400 text-lg">Use the AR Lens to identify real workplace waste or practice in virtual simulations.</p>
           </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {AUDIT_SCENES.map(scene => (
            <div key={scene.id} onClick={() => setSelectedScene(scene)} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 cursor-pointer hover:border-red-500 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">{scene.title}</h3>
                 <ChevronRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-slate-500 text-sm mt-2">{scene.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- REAL WORLD AR FLOW ---
  if (isLensMode) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] flex flex-col font-sans overflow-hidden">
        {!isContextConfirmed && (
          <div className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto">
            <header className="mb-10 flex justify-between items-start">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">AR Calibration</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Select workstation to load AI models and standards.</p>
               </div>
               <button onClick={() => setIsLensMode(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform">
                  <XCircle className="w-6 h-6 text-slate-400" />
               </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               {PREDEFINED_CATEGORIES.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => {
                     setAuditContext(cat.name);
                     setActiveChecklistItems(cat.checklist);
                     setIsContextConfirmed(true);
                     setIsLiveScanning(true);
                   }}
                   className="flex flex-col items-start p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 transition-all text-left bg-white dark:bg-slate-900 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                 >
                    <div className={cn("p-4 rounded-2xl mb-6 bg-slate-50 dark:bg-slate-800 transition-colors group-hover:bg-red-50 dark:group-hover:bg-red-900/20", cat.color)}>
                       <cat.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{cat.name}</h3>
                 </button>
               ))}
            </div>
          </div>
        )}

        {isContextConfirmed && (
          <div className="relative flex-1 bg-black flex flex-col">
            <div className="relative flex-1 bg-slate-900 overflow-hidden">
              {capturedImage ? (
                <img src={capturedImage} className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-80" />
              )}
              
              {/* LIVE AR PINS OVERLAY */}
              {scanResult && scanResult.detectedHazards.map((h, i) => (
                  <button 
                      key={i}
                      onClick={() => {
                        if (!capturedImage) captureAndFreeze();
                        setSelectedHazardIndex(i);
                      }}
                      className={cn(
                          "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-4 flex items-center justify-center transition-all z-20",
                          selectedHazardIndex === i ? "border-white bg-red-600 scale-125 shadow-[0_0_20px_rgba(220,38,38,0.8)]" : "border-red-600 bg-red-600/30 hover:scale-110 backdrop-blur-sm",
                          h.severity === 'High' ? "animate-pulse" : ""
                      )}
                      style={{ top: `${h.location?.top || 50}%`, left: `${h.location?.left || 50}%` }}
                  >
                      {h.severity === 'High' ? <AlertTriangle className="w-6 h-6 text-white" /> : <Zap className="w-4 h-4 text-white" />}
                  </button>
              ))}

              {/* SCANNING LASER EFFECT (Only when live) */}
              {!capturedImage && isLiveScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                   <div className="w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,1)] absolute top-0 left-0 animate-[scan_3s_linear_infinite]" />
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-[20%] animate-[scan-glow_3s_linear_infinite]" />
                </div>
              )}

              {/* HUD OVERLAY */}
              {!capturedImage && (
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-white">
                         <div className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">AR Digital Twin</div>
                         <div className="font-bold flex items-center gap-2 text-sm uppercase">
                            <MapPin className="w-3 h-3 text-red-500" /> {auditContext}
                         </div>
                      </div>
                      <div className="flex gap-2 pointer-events-auto">
                        <button 
                          onClick={() => setIsLiveScanning(!isLiveScanning)} 
                          className={cn("p-3 rounded-full border border-white/10 backdrop-blur-md transition-colors", isLiveScanning ? "bg-red-600/80 text-white" : "bg-black/60 text-slate-400")}
                        >
                          <Zap className={cn("w-5 h-5", isLiveScanning && "fill-current")} />
                        </button>
                        <button onClick={() => setIsContextConfirmed(false)} className="bg-black/60 p-3 rounded-full border border-white/10 text-white"><Settings className="w-5 h-5" /></button>
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-6">
                      {isScanning && (
                        <div className="px-6 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl animate-pulse flex items-center gap-2">
                           <Cpu className="w-3 h-3 animate-spin" /> Gemini AI Processing
                        </div>
                      )}
                      {!scanResult && !isScanning && (
                        <div className="px-6 py-2 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                           Point at Workstation to Analyze
                        </div>
                      )}
                      <div className="w-72 h-72 border-2 border-white/20 rounded-[3rem] relative flex items-center justify-center">
                         <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/60 rounded-tl-3xl"></div>
                         <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/60 rounded-tr-3xl"></div>
                         <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/60 rounded-bl-3xl"></div>
                         <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/60 rounded-br-3xl"></div>
                         <Eye className="w-12 h-12 text-white/10" />
                      </div>
                   </div>
                   <div className="h-10" />
                </div>
              )}

              {/* HAZARD EDIT CARD */}
              {scanResult && selectedHazardIndex !== null && (
                <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 z-50 animate-slide-up border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> AI Inspection Result
                            </span>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-3">Confirm Red Tag</h4>
                        </div>
                        <button onClick={() => { setSelectedHazardIndex(null); if (!capturedImage) setIsLiveScanning(true); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><XCircle className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Object</p>
                               <p className="font-bold text-slate-900 dark:text-white truncate">{scanResult.detectedHazards[selectedHazardIndex].name}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pillar</p>
                               <p className="font-bold text-slate-900 dark:text-white">{scanResult.detectedHazards[selectedHazardIndex].action}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-red-500">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Countermeasure</p>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{scanResult.detectedHazards[selectedHazardIndex].suggestion}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => syncTag(selectedHazardIndex)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                            <ShieldCheck className="w-5 h-5" /> Issue Red Tag
                        </button>
                    </div>
                </div>
              )}
            </div>

            {/* CONTROL PANEL */}
            <div className="h-32 bg-slate-950 border-t border-white/10 flex items-center justify-between px-10">
              <button onClick={() => { setCapturedImage(null); setIsLiveScanning(true); setScanResult(null); }} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white">Live Feed</button>
              
              {!capturedImage ? (
                <button 
                  onClick={captureAndFreeze} 
                  className="w-20 h-20 bg-white rounded-full border-8 border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                   <Camera className="w-8 h-8 text-slate-900" />
                </button>
              ) : (
                <div className="flex items-center gap-4">
                    <button onClick={() => { setCapturedImage(null); setIsLiveScanning(true); }} className="p-4 bg-white/10 rounded-2xl border border-white/10 text-white"><Trash2 className="w-6 h-6" /></button>
                    <button onClick={onExit} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Exit AR</button>
                </div>
              )}

              <button onClick={onExit} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white">Close</button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
          }
          @keyframes scan-glow {
            0% { top: -20%; }
            100% { top: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // --- SIMULATION MODE ---
  if (selectedScene) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedScene(null)} className="flex items-center text-slate-500 font-bold hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Simulation List
          </button>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedScene.title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Virtual Environment</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {selectedScene.items.map((item) => (
              <div 
                key={item.id}
                onClick={() => setLocalChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={cn(
                  "p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  localChecklist[item.id] && "bg-blue-50/30 dark:bg-blue-900/10"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all",
                    localChecklist[item.id] ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "border-slate-200 dark:border-slate-700"
                  )}>
                    {localChecklist[item.id] && <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={cn("font-black uppercase tracking-tight text-lg", localChecklist[item.id] ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Status: {item.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                const checked = Object.values(localChecklist).filter(Boolean).length;
                if (checked === 0) return alert("Select at least one issue.");
                onComplete(selectedScene.xpReward, 100, selectedScene.title);
              }}
              className="bg-red-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all flex items-center group active:scale-95"
            >
              Submit Findings <ChevronRight className="w-5 h-5 ml-3" />
            </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default AuditGame;
