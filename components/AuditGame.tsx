import React, { useState, useRef, useEffect } from 'react';
import { AuditScene, AuditItem, LensScanResult, RedTagData } from '../types';
import { AUDIT_SCENES } from '../constants';
import { analyze5SImage } from '../services/geminiService';
import { CheckCircle2, AlertTriangle, ArrowLeft, Camera, EyeOff, Scan, Zap, Loader2, Tag, Upload } from 'lucide-react';

interface AuditGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const AuditGame: React.FC<AuditGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const [selectedScene, setSelectedScene] = useState<AuditScene | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Lens/Real World State
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LensScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // To show the freeze frame
  const [redTagCreated, setRedTagCreated] = useState(false);

  // Initialize Real World Start
  useEffect(() => {
    if (isRealWorldStart) {
      setIsLensMode(true);
    }
  }, [isRealWorldStart]);

  // Handle Camera for Lens Mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLensMode && !capturedImage && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing camera:", err);
        // If real world was requested but camera fails, maybe fallback or alert
        if (isRealWorldStart) {
            alert("Camera needed for Real World mode. Using mock data for demo.");
        }
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLensMode, capturedImage, isRealWorldStart]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isScanning) return;

    setIsScanning(true);
    setScanResult(null);

    // 1. Capture Frame
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.8)); // Freeze the view

    // 2. Send to AI
    try {
      const result = await analyze5SImage(base64Image);
      setScanResult(result);
    } catch (e) {
      console.error(e);
      alert("Scan failed. Try again.");
      setCapturedImage(null); // Reset to live view
    } finally {
      setIsScanning(false);
    }
  };

  const createRedTag = async () => {
    if (!scanResult) return;
    
    // In a real app, this would POST to /api/audit
    const redTag: RedTagData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        itemDetected: scanResult.itemDetected,
        actionNeeded: scanResult.practicalAction,
        location: "Workplace Scan",
        status: 'Open'
    };

    console.log("Saving to Backend:", redTag);
    
    setRedTagCreated(true);
    
    setTimeout(() => {
        onComplete(200, 100, `Real World 5S Scan: ${scanResult.itemDetected}`);
    }, 2000);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setRedTagCreated(false);
  };

  // --- VIEW: SCENE SELECTION (Training Mode only) ---
  if (!selectedScene && !isLensMode) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
          </button>
          
          <button 
            onClick={() => setIsLensMode(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-slate-800 flex items-center transition-all"
          >
            <Camera className="w-4 h-4 mr-2" />
            Launch 5S Scanner
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Select Training Simulation</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {AUDIT_SCENES.map(scene => (
            <div 
              key={scene.id}
              onClick={() => setSelectedScene(scene)}
              className="bg-white p-6 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800">{scene.title}</h3>
                <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${
                  scene.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {scene.difficulty}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-4">{scene.description}</p>
              <div className="flex items-center text-sm text-slate-400">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 mr-2">Reward: {scene.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: REAL WORLD 5S SCANNER ---
  if (isLensMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
        {/* AR Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
          <button onClick={() => isRealWorldStart ? onExit() : setIsLensMode(false)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white text-center">
            <h2 className="font-bold text-sm tracking-wider uppercase">Real World 5S</h2>
            <p className="text-[10px] text-white/70">Detect • Tag • Solve</p>
          </div>
          <div className="w-9"></div> {/* Spacer */}
        </div>

        {/* Camera Viewport */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden">
          {capturedImage ? (
             <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Captured" />
          ) : (
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="absolute inset-0 w-full h-full object-cover opacity-90"
             />
          )}
          
          {/* Scanning Overlay UI */}
          {!scanResult && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64 border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
                
                {isScanning && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2s_infinite_linear]"></div>
                )}
              </div>
              <p className="absolute mt-80 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                {isScanning ? "Analyzing Waste..." : "Capture Unorganized Area"}
              </p>
            </div>
          )}

          {/* RED TAG GENERATOR CARD */}
          {scanResult && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-30 animate-scale-in bg-black/40 backdrop-blur-sm">
               {/* THE RED TAG */}
              <div className="bg-red-50 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative">
                {/* Top Hole for String */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-slate-800 rounded-full border-4 border-red-100 z-40"></div>
                
                <div className="bg-red-600 p-4 pt-6 text-center text-white relative">
                   <h3 className="font-black text-2xl uppercase tracking-widest border-2 border-white inline-block px-2 py-1 transform -rotate-2">5S Red Tag</h3>
                   <p className="text-red-100 text-xs mt-2 uppercase font-bold">Sort & Remove</p>
                </div>

                <div className="p-6 space-y-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Item Detected</label>
                      <p className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-1">{scanResult.itemDetected}</p>
                   </div>
                   
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Reason for Tagging</label>
                      <p className="text-slate-700 text-sm leading-snug">{scanResult.observation}</p>
                   </div>

                   <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action</label>
                        <p className="font-bold text-red-600">{scanResult.suggested5SAction}</p>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                        <p className="font-mono text-slate-600 text-sm">{new Date().toLocaleDateString()}</p>
                      </div>
                   </div>

                   <div className="pt-4 flex space-x-3">
                     {!redTagCreated ? (
                        <>
                            <button 
                                onClick={resetScan}
                                className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-100 rounded-lg"
                            >
                                Retake
                            </button>
                            <button 
                                onClick={createRedTag}
                                className="flex-1 bg-red-600 text-white rounded-lg py-3 font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 flex items-center justify-center"
                            >
                                <Tag className="w-4 h-4 mr-2" /> Create Tag
                            </button>
                        </>
                     ) : (
                        <div className="w-full bg-green-100 text-green-700 py-3 rounded-lg flex items-center justify-center font-bold">
                             <CheckCircle2 className="w-5 h-5 mr-2" /> Saved to Backend
                        </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shutter Button Footer */}
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

  // --- STANDARD TRAINING MODE (Checklist) ---
  const toggleItem = (itemId: string) => {
    if (submitted) return;
    setChecklist(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSubmit = () => {
    if (!selectedScene) return;
    const totalItems = selectedScene.items.length;
    const checkedCount = Object.values(checklist).filter(Boolean).length;
    if (checkedCount === 0) return;
    const score = Math.round((checkedCount / totalItems) * 100);
    const xpEarned = Math.round(selectedScene.xpReward * (score / 100));
    setSubmitted(true);
    setTimeout(() => {
      onComplete(xpEarned, score, `5S Sim: ${selectedScene.title}`);
    }, 2500);
  };

  if (selectedScene) {
    // ... (Existing Checklist UI Render code)
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedScene(null)} className="flex items-center text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Simulation List
            </button>
            <div className="text-right">
              <h2 className="font-bold text-slate-800">{selectedScene.title}</h2>
              <p className="text-xs text-slate-500">Virtual Audit</p>
            </div>
          </div>
    
          {/* List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <p className="text-slate-600 text-sm">
                Identify the correct actions for the items below.
              </p>
            </div>
    
            <div className="divide-y divide-slate-100">
              {selectedScene.items.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                    checklist[item.id] ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      checklist[item.id] ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'
                    }`}>
                      {checklist[item.id] && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium ${checklist[item.id] ? 'text-slate-800' : 'text-slate-600'}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">Status: <span className="uppercase">{item.status}</span></p>
                    </div>
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
                onClick={handleSubmit}
                disabled={Object.values(checklist).filter(Boolean).length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default AuditGame;