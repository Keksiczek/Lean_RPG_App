import React, { useState, useRef, useEffect } from 'react';
import { LPAAudit, LPAScanResult } from '../types';
import { LPA_AUDITS } from '../constants';
import { analyzeLPAImage } from '../services/geminiService';
import { CheckCircle2, AlertTriangle, ArrowLeft, Camera, ShieldCheck, ClipboardList, Loader2, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';

interface LPAGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const LPAGame: React.FC<LPAGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const [selectedAudit, setSelectedAudit] = useState<LPAAudit | null>(null);
  const [answers, setAnswers] = useState<Record<string, 'Yes' | 'No'>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Real World / Camera State
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LPAScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lpaCompleted, setLpaCompleted] = useState(false);

  useEffect(() => {
    if (isRealWorldStart) setIsLensMode(true);
  }, [isRealWorldStart]);

  // Camera Initialization
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
            if (isRealWorldStart) alert("Camera required for Real World LPA.");
        });
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [isLensMode, capturedImage, isRealWorldStart]);

  // --- ACTIONS ---

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

  const confirmRealWorldLPA = () => {
    setLpaCompleted(true);
    setTimeout(() => {
      onComplete(300, 100, "Real World LPA: Process Verified");
    }, 2000);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
  };

  const toggleAnswer = (questionId: string, value: 'Yes' | 'No') => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSimulation = () => {
    if (!selectedAudit) return;
    const totalQ = selectedAudit.questions.length;
    let correctCount = 0;
    
    selectedAudit.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / totalQ) * 100);
    const xpEarned = Math.round(selectedAudit.xpReward * (score / 100));
    
    setSubmitted(true);
    setTimeout(() => {
      onComplete(xpEarned, score, `LPA: ${selectedAudit.title}`);
    }, 2500);
  };

  // --- VIEW: SELECTION MENU ---
  if (!selectedAudit && !isLensMode) {
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

  // --- VIEW: REAL WORLD LPA ---
  if (isLensMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
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
          
          {/* Scanning Overlay */}
          {!scanResult && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-64 h-48 border-2 border-purple-400/50 rounded-lg relative">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-purple-400"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-purple-400"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-purple-400"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-purple-400"></div>
                 {isScanning && <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>}
               </div>
               <p className="absolute mt-64 text-white/90 bg-black/60 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                 {isScanning ? "Analyzing Compliance..." : "Align Process Area in Frame"}
               </p>
            </div>
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
                   {scanResult.safetyRisk && (
                      <div className="bg-white/20 p-2 rounded-lg flex flex-col items-center">
                         <AlertTriangle className="w-5 h-5 text-white" />
                         <span className="text-[10px] font-bold">RISK</span>
                      </div>
                   )}
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

                   {scanResult.identifiedIssues.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                         <h4 className="text-xs font-bold text-red-800 uppercase mb-1">Non-Conformances</h4>
                         <ul className="list-disc list-inside text-xs text-red-700">
                           {scanResult.identifiedIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                         </ul>
                      </div>
                   )}

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

  // --- VIEW: SIMULATION CHECKLIST ---
  if (selectedAudit) {
    const isCompleted = Object.keys(answers).length === selectedAudit.questions.length;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
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
           <div className="bg-slate-50 p-4 border-b border-slate-200">
              <p className="text-sm text-slate-600">Review the process and answer all questions.</p>
           </div>
           
           <div className="divide-y divide-slate-100">
              {selectedAudit.questions.map((q) => (
                 <div key={q.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-slate-800 text-sm md:text-base pr-4">{q.question}</h3>
                       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                          q.category === 'Safety' ? 'bg-red-100 text-red-700' :
                          q.category === 'Quality' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                       }`}>{q.category}</span>
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
              disabled={!isCompleted}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
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