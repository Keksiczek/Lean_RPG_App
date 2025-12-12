import React, { useState, useRef, useEffect } from 'react';
import { LPAAudit, LPAScanResult } from '../types';
import { LPA_AUDITS } from '../constants';
import { analyzeLPAImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, AlertTriangle, ArrowLeft, Camera, ShieldCheck, ClipboardList, Loader2, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';

interface LPAGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const LPAGame: React.FC<LPAGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const { user } = useAuth();
  const [selectedAudit, setSelectedAudit] = useState<LPAAudit | null>(null);
  const [answers, setAnswers] = useState<Record<string, 'Yes' | 'No'>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real World
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LPAScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lpaCompleted, setLpaCompleted] = useState(false);

  useEffect(() => {
    if (isRealWorldStart) setIsLensMode(true);
  }, [isRealWorldStart]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLensMode && !capturedImage && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
            console.error("Camera Error", err);
        });
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [isLensMode, capturedImage, isRealWorldStart]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isScanning) return;
    setIsScanning(true);
    setScanResult(null);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));

    try {
      const result = await analyzeLPAImage(base64Image);
      setScanResult(result);
    } catch (e) {
      console.error(e);
      setCapturedImage(null);
      alert("Analysis failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const confirmRealWorldLPA = async () => {
    if (!user || !scanResult) return;
    
    // Save to backend
    try {
      await gameService.saveLPAResult(
        'real-world-lpa',
        scanResult.compliance === 'High' ? 100 : scanResult.compliance === 'Medium' ? 70 : 40,
        300,
        scanResult,
        user.id
      );
      setLpaCompleted(true);
      setTimeout(() => {
        onComplete(300, 100, "Real World LPA: Process Verified");
      }, 2000);
    } catch (e) {
      alert("Failed to save audit.");
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
  };

  const toggleAnswer = (questionId: string, value: 'Yes' | 'No') => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSimulation = async () => {
    if (!selectedAudit || !user) return;
    setIsSubmitting(true);

    const totalQ = selectedAudit.questions.length;
    let correctCount = 0;
    
    selectedAudit.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / totalQ) * 100);
    const xpEarned = Math.round(selectedAudit.xpReward * (score / 100));
    
    try {
      await gameService.saveLPAResult(selectedAudit.id, score, xpEarned, answers, user.id);
      setSubmitted(true);
      setTimeout(() => {
        onComplete(xpEarned, score, `LPA: ${selectedAudit.title}`);
      }, 2000);
    } catch (e) {
      alert("Failed to submit audit.");
      setIsSubmitting(false);
    }
  };

  // ... [Views for Menu, Real World, and Simulation - mostly unchanged logic, just event handlers above] ...

  // VIEW: SELECTION MENU
  if (!selectedAudit && !isLensMode) {
     // ... (Same as before)
     return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
          </button>
          
          <button 
            onClick={() => setIsLensMode(true)}
            className="bg-purple-900 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-purple-800 flex items-center transition-all"
          >
            <Camera className="w-4 h-4 mr-2" />
            Launch Live LPA
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Select Process Audit</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {LPA_AUDITS.map(audit => (
            <div 
              key={audit.id}
              onClick={() => setSelectedAudit(audit)}
              className="bg-white p-6 rounded-xl border border-slate-200 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ClipboardList className="w-12 h-12 text-slate-900" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">{audit.title}</h3>
              <div className="flex space-x-2 mb-3">
                 <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">{audit.frequency}</span>
                 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{audit.questions.length} Questions</span>
              </div>
              <p className="text-slate-500 text-sm">{audit.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VIEW: REAL WORLD
  if (isLensMode) {
    // ... (Same as before, confirm button calls confirmRealWorldLPA)
     return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
          <button onClick={() => isRealWorldStart ? onExit() : setIsLensMode(false)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white text-center">
            <h2 className="font-bold text-sm tracking-wider uppercase">LPA Vision</h2>
            <p className="text-[10px] text-white/70">Verify Process • Ensure Safety</p>
          </div>
          <div className="w-9"></div>
        </div>

        <div className="relative flex-1 bg-slate-900 overflow-hidden">
          {capturedImage ? (
             <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Captured" />
          ) : (
             <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />
          )}
          
          {/* RESULTS CARD */}
          {scanResult && (
            <div className="absolute inset-0 flex items-end md:items-center justify-center p-4 z-30 animate-slide-up bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-black/40 md:backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-xl overflow-hidden shadow-2xl">
                <div className={`p-4 text-white flex justify-between items-center ${
                   scanResult.compliance === 'High' ? 'bg-emerald-600' : scanResult.compliance === 'Medium' ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                   <div>
                      <h3 className="font-bold text-lg">Process Compliance</h3>
                      <p className="text-xs opacity-90 uppercase tracking-widest">{scanResult.compliance} Level</p>
                   </div>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Observations</h4>
                     <ul className="space-y-2">
                        {scanResult.observations.map((obs, i) => (
                           <li key={i} className="flex items-start text-sm text-slate-700">
                              <Eye className="w-4 h-4 mr-2 text-purple-500 mt-0.5 shrink-0" />
                              {obs}
                           </li>
                        ))}
                     </ul>
                   </div>

                   <div className="pt-2 flex gap-3">
                      {!lpaCompleted ? (
                         <>
                           <button onClick={resetScan} className="flex-1 py-3 bg-slate-100 rounded-lg text-slate-600 font-bold text-sm">Retake</button>
                           <button onClick={confirmRealWorldLPA} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-purple-700">
                             Log Audit
                           </button>
                         </>
                      ) : (
                         <div className="w-full bg-green-100 text-green-700 py-3 rounded-lg flex items-center justify-center font-bold">
                           <CheckCircle2 className="w-5 h-5 mr-2" /> Audit Saved
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Shutter */}
        <div className="h-24 bg-black/40 backdrop-blur-md absolute bottom-0 w-full flex justify-center items-center z-20">
          {!scanResult && !isScanning && (
            <button
              onClick={captureAndAnalyze}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-full"></div>
            </button>
          )}
        </div>
      </div>
     );
  }

  // VIEW: SIMULATION
  if (selectedAudit) {
    const isCompleted = Object.keys(answers).length === selectedAudit.questions.length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* ... Header ... */}
        <div className="flex items-center justify-between">
            <button onClick={() => setSelectedAudit(null)} className="flex items-center text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Audit List
            </button>
            <div className="text-right">
              <h2 className="font-bold text-slate-800">{selectedAudit.title}</h2>
              <p className="text-xs text-slate-500">{selectedAudit.frequency} Audit</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           {/* ... Questions List ... */}
           <div className="divide-y divide-slate-100">
              {selectedAudit.questions.map((q) => (
                 <div key={q.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-slate-800 text-sm md:text-base pr-4">{q.question}</h3>
                    </div>
                    <div className="flex space-x-3">
                       <button 
                          onClick={() => toggleAnswer(q.id, 'Yes')}
                          disabled={submitted}
                          className={`flex-1 py-2 rounded-lg border-2 flex items-center justify-center transition-all ${
                             answers[q.id] === 'Yes' 
                             ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                             : 'border-slate-200 text-slate-400 hover:border-green-300'
                          }`}
                       >
                          <ThumbsUp className="w-4 h-4 mr-2" /> Yes
                       </button>
                       <button 
                          onClick={() => toggleAnswer(q.id, 'No')}
                          disabled={submitted}
                          className={`flex-1 py-2 rounded-lg border-2 flex items-center justify-center transition-all ${
                             answers[q.id] === 'No' 
                             ? 'border-red-500 bg-red-50 text-red-700 font-bold' 
                             : 'border-slate-200 text-slate-400 hover:border-red-300'
                          }`}
                       >
                          <ThumbsDown className="w-4 h-4 mr-2" /> No
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="flex justify-end">
          {submitted ? (
             <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg flex items-center animate-pulse">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Audit Submitted!
             </div>
          ) : (
            <button 
              onClick={handleSubmitSimulation}
              disabled={isSubmitting || !isCompleted}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Audit
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LPAGame;