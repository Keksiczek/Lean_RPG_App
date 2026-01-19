
import React, { useState, useRef, useEffect } from 'react';
import { LPAAudit, LPAScanResult, LPAQuestion } from '../types';
import { LPA_AUDITS } from '../constants';
import { analyzeLPAImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Camera, 
  ShieldCheck, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  ShieldAlert,
  Zap,
  Trash2,
  XCircle,
  Settings,
  Package,
  Users
} from 'lucide-react';
import { cn } from '../utils/themeColors';

interface LPAGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const PREDEFINED_CATEGORIES = [
  { id: 'prod', name: 'Production Cell', icon: Settings, color: 'text-blue-500' },
  { id: 'wh', name: 'Warehouse / Dock', icon: Package, color: 'text-amber-500' },
  { id: 'lab', name: 'QA / Maintenance', icon: ShieldCheck, color: 'text-emerald-500' }
];

const LPAGame: React.FC<LPAGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const { user } = useAuth();
  const [selectedAudit, setSelectedAudit] = useState<LPAAudit | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { val: 'Yes' | 'No', aiVerified?: boolean, obs?: string[], imageUrl?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const [isContextConfirmed, setIsContextConfirmed] = useState(false);
  const [auditArea, setAuditArea] = useState('');

  // Camera & AI State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCameraOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera Error", err));
    }
  }, [isCameraOpen]);

  const handleCapture = async () => {
    if (!videoRef.current || isAnalyzing || !selectedAudit) return;
    setIsAnalyzing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];
    
    const q = selectedAudit.questions[currentStep];
    const userVal = answers[q.id]?.val || 'Yes';

    try {
      const result = await analyzeLPAImage(base64, q.question, q.correctAnswer);
      
      setAnswers(prev => ({
        ...prev,
        [q.id]: { 
          ...prev[q.id], 
          aiVerified: result.verified, 
          obs: result.observations,
          imageUrl: dataUrl
        }
      }));
      setIsCameraOpen(false);
    } catch (e) {
      alert("AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswer = (val: 'Yes' | 'No') => {
    if (!selectedAudit) return;
    const qId = selectedAudit.questions[currentStep].id;
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], val } }));
  };

  const finishAudit = async () => {
    if (!selectedAudit || !user) return;
    setIsSubmitting(true);

    let correctCount = 0;
    selectedAudit.questions.forEach(q => {
      if (answers[q.id]?.val === q.correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / selectedAudit.questions.length) * 100);
    const xp = Math.round(selectedAudit.xpReward * (score / 100)) + (isLensMode ? 100 : 0);

    try {
      await gameService.saveLPAResult(selectedAudit.id, score, xp, answers, user.id);
      onComplete(xp, score, `LPA: ${selectedAudit.title}`);
    } catch (e) {
      alert("Failed to save audit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VIEWS ---

  if (isLensMode && !isContextConfirmed) {
      return (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] flex flex-col p-8 md:p-12 font-sans overflow-hidden">
             <header className="mb-10 flex justify-between items-start">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">LPA Vision Setup</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Verify standard work in the real world.</p>
               </div>
               <button onClick={onExit} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full"><XCircle className="w-6 h-6 text-slate-400" /></button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               {PREDEFINED_CATEGORIES.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => {
                     setAuditArea(cat.name);
                     setIsContextConfirmed(true);
                   }}
                   className="flex flex-col items-start p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left bg-white dark:bg-slate-900 group shadow-sm"
                 >
                    <div className={cn("p-4 rounded-2xl mb-6 bg-slate-50 dark:bg-slate-800 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20", cat.color)}>
                       <cat.icon className="w-10 h-10" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">{cat.name}</h3>
                 </button>
               ))}
            </div>
            
            <div className="mt-auto pt-8 border-t dark:border-slate-800 flex items-center gap-2 text-slate-400 italic text-sm">
               <Sparkles className="w-4 h-4" />
               <p>AI will verify visual evidence for each checklist item to ensure zero-defect process compliance.</p>
            </div>
        </div>
      );
  }

  if (!selectedAudit) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
          <div className="px-4 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Quality Assurance</div>
        </div>
        
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Layered Process Audits</h2>
          <p className="text-slate-500">Select a standard work verification plan {isLensMode ? `for ${auditArea}` : ''}.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {LPA_AUDITS.map(audit => (
            <div 
              key={audit.id} 
              onClick={() => setSelectedAudit(audit)}
              className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 cursor-pointer hover:border-red-500 transition-all group flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">{audit.title}</h3>
                  <ShieldCheck className="w-6 h-6 text-slate-200 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs mt-2 font-medium">{audit.description}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">{audit.frequency}</span>
                <span className="text-amber-500 text-xs font-black flex items-center gap-1"><Zap className="w-3 h-3" /> {audit.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = selectedAudit.questions[currentStep];
  const progress = ((currentStep + 1) / selectedAudit.questions.length) * 100;
  const currentAns = answers[q.id];

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-fade-in pb-10">
      {/* Progress Header */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-end">
          <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-900 transition-colors"><RotateCcw className="w-5 h-5" /></button>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentStep + 1} of {selectedAudit.questions.length}</p>
             <p className="text-sm font-bold text-slate-900">{selectedAudit.title} {isLensMode ? `• ${auditArea}` : ''}</p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden flex flex-col relative">
        <div className="p-10 flex-1 flex flex-col justify-center text-center">
           <span className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] mb-4 bg-red-50 px-3 py-1 rounded-full mx-auto">{q.category} Check</span>
           <h3 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-10">{q.question}</h3>
           
           <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full mb-8">
              <button 
                onClick={() => handleAnswer('Yes')}
                className={cn(
                  "py-6 rounded-2xl font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all",
                  currentAns?.val === 'Yes' ? "bg-emerald-600 text-white shadow-lg scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                <ThumbsUp className="w-8 h-8" /> Yes
              </button>
              <button 
                onClick={() => handleAnswer('No')}
                className={cn(
                  "py-6 rounded-2xl font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all",
                  currentAns?.val === 'No' ? "bg-red-600 text-white shadow-lg scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                <ThumbsDown className="w-8 h-8" /> No
              </button>
           </div>

           {isLensMode && !currentAns?.imageUrl && (
               <div className="animate-pulse flex flex-col items-center">
                   <p className="text-xs font-bold text-red-600 uppercase mb-4">Evidence Required for Vision Audit</p>
                   <button 
                     onClick={() => setIsCameraOpen(true)}
                     disabled={!currentAns?.val}
                     className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3 disabled:opacity-30"
                   >
                     <Camera className="w-6 h-6" /> Take Verification Photo
                   </button>
               </div>
           )}

           {currentAns?.imageUrl && (
               <div className="relative w-48 h-32 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                   <img src={currentAns.imageUrl} className="w-full h-full object-cover" />
                   <button onClick={() => setAnswers(prev => ({...prev, [q.id]: {...prev[q.id], imageUrl: undefined, aiVerified: undefined}}))} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"><Trash2 className="w-4 h-4" /></button>
                   {currentAns.aiVerified !== undefined && (
                        <div className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm",
                            currentAns.aiVerified ? "bg-emerald-500/20" : "bg-red-500/20"
                        )}>
                            {currentAns.aiVerified ? <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" /> : <AlertTriangle className="w-8 h-8 text-white drop-shadow-md" />}
                            <span className="text-[10px] font-black text-white uppercase mt-1">{currentAns.aiVerified ? 'AI Verified' : 'AI Warning'}</span>
                        </div>
                   )}
               </div>
           )}
        </div>

        {/* AI Analysis Result List */}
        {currentAns?.obs && (
            <div className="px-10 pb-10">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-red-600" /> Sensei Insights
                    </p>
                    <ul className="space-y-1">
                        {currentAns.obs.map((o, idx) => (
                            <li key={idx} className="text-xs text-slate-600 italic flex items-start gap-2">
                                <span className="text-red-500">•</span> {o}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* Navigation Buttons */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <button 
             onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
             disabled={currentStep === 0}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 disabled:opacity-30"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           
           <div className="flex gap-3">
               {currentStep === selectedAudit.questions.length - 1 ? (
                 <button 
                   onClick={finishAudit}
                   disabled={!currentAns || isSubmitting || (isLensMode && !currentAns.imageUrl)}
                   className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-red-700 disabled:opacity-50"
                 >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Finalize LPA
                 </button>
               ) : (
                 <button 
                   onClick={() => setCurrentStep(prev => prev + 1)}
                   disabled={!currentAns || (isLensMode && !currentAns.imageUrl)}
                   className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 shadow-lg"
                 >
                    Next <ChevronRight className="w-5 h-5" />
                 </button>
               )}
           </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
           <div className="relative flex-1">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white text-xs font-bold mb-8">
                     Capturing evidence for: {q.question}
                 </div>
                 <div className="w-64 h-64 border-2 border-white/20 rounded-[3rem] relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                 </div>
              </div>

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-md">
                   <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
                   <p className="text-white font-black text-2xl uppercase tracking-tighter animate-pulse">AI Verification...</p>
                </div>
              )}

              <button onClick={() => setIsCameraOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
                <ArrowLeft className="w-6 h-6" />
              </button>
           </div>

           <div className="h-32 bg-slate-950 flex items-center justify-center">
              <button 
                onClick={handleCapture}
                disabled={isAnalyzing}
                className="w-20 h-20 bg-white rounded-full border-8 border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                 <div className="w-12 h-12 border-4 border-slate-900 rounded-full" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default LPAGame;
