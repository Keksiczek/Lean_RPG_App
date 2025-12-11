import React, { useState, useRef, useEffect } from 'react';
import { AuditScene, AuditItem, LensScanResult, RedTagData } from '../types';
import { AUDIT_SCENES, WORKPLACES } from '../constants';
import { analyze5SImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { CheckCircle2, AlertTriangle, ArrowLeft, Camera, EyeOff, Scan, Zap, Loader2, Tag, Upload, Edit2, ClipboardList, ChevronDown, ChevronUp, MapPin, XCircle, Grid, Factory, Briefcase, ArrowRight } from 'lucide-react';

interface AuditGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
  checklist?: string[]; // Added Checklist Prop
  initialContext?: string; // New: Factory Context
}

const GENERIC_CONTEXTS = [
  { name: "General Production Area", checklist: ["Walkways marked & clear", "Tools in designated areas", "No safety hazards", "Workstations clean"] },
  { name: "Office Environment", checklist: ["Desks organized", "Confidential info secured", "Cables managed", "Common areas tidy"] },
  { name: "Warehouse / Storage", checklist: ["Aisles unobstructed", "Inventory labeled", "Stacking height compliant", "Pallets in good condition"] },
  { name: "Maintenance Shop", checklist: ["Tools shadow-boarded", "No oil leaks", "Spare parts labeled", "Lockout/Tagout stations clear"] }
];

const AuditGame: React.FC<AuditGameProps> = ({ onComplete, onExit, isRealWorldStart = false, checklist = [], initialContext = '' }) => {
  const [selectedScene, setSelectedScene] = useState<AuditScene | null>(null);
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Lens/Real World State
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LensScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // To show the freeze frame
  const [redTagCreated, setRedTagCreated] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(true); // Overlay state

  // AR UI State
  const [showARGrid, setShowARGrid] = useState(true);

  // Context / Context Input
  const [auditContext, setAuditContext] = useState(initialContext);
  const [isContextConfirmed, setIsContextConfirmed] = useState(!!initialContext);
  const [activeChecklistItems, setActiveChecklistItems] = useState<string[]>(checklist);

  // Manual Correction State (Red Tag)
  const [editedItemName, setEditedItemName] = useState('');
  const [editedAction, setEditedAction] = useState<string>('');
  const [selectedHazardIndex, setSelectedHazardIndex] = useState<number>(0);

  // Initialize Real World Start
  useEffect(() => {
    if (isRealWorldStart) {
      setIsLensMode(true);
    }
  }, [isRealWorldStart]);

  // Update context if prop changes
  useEffect(() => {
      if (initialContext) {
          setAuditContext(initialContext);
          setIsContextConfirmed(true);
      }
      if (checklist.length > 0) {
          setActiveChecklistItems(checklist);
      }
  }, [initialContext, checklist]);

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
            // Only alert if we are past the context screen to avoid popping up while typing
            if (isContextConfirmed) {
               alert("Camera needed for Real World mode. Using mock data for demo.");
            }
        }
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLensMode, capturedImage, isRealWorldStart, isContextConfirmed]);

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

    // 2. Send to AI (with context and checklist)
    try {
      const result = await analyze5SImage(base64Image, auditContext, activeChecklistItems);
      setScanResult(result);
      
      // Default to first hazard for Red Tag form if available
      if (result.detectedHazards && result.detectedHazards.length > 0) {
        setEditedItemName(result.detectedHazards[0].name);
        setEditedAction(result.detectedHazards[0].action);
      } else {
        // Fallback
        setEditedItemName(result.itemDetected || "Issue");
        setEditedAction(result.suggested5SAction || "Sort");
      }

      setIsChecklistOpen(true); // Keep open to show AR status
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
        itemDetected: editedItemName, // Use edited value
        actionNeeded: scanResult.detectedHazards?.[selectedHazardIndex]?.action || editedAction,
        location: auditContext || "Workplace Scan",
        status: 'Open'
    };

    console.log("Saving to Backend:", redTag);
    
    // INTEGRATION: Automatically create a Task in the Action Plan
    // This is the key "Connected System" logic
    try {
        await gameService.createTask({
            title: `Red Tag: ${editedItemName}`,
            description: `Auto-generated from 5S Scan. Observation: ${scanResult.detectedHazards?.[selectedHazardIndex]?.name || scanResult.observation}.`,
            status: 'open',
            priority: 'medium',
            source: '5S Red Tag',
            location: auditContext || 'Unknown Area', // Linked Location
            imageUrl: capturedImage || undefined,
            dueDate: new Date(Date.now() + 604800000).toISOString() // +7 days
        });
    } catch (e) {
        console.error("Failed to create task", e);
    }
    
    setRedTagCreated(true);
    
    setTimeout(() => {
        onComplete(200, 100, `Real World 5S Scan: ${editedItemName}`);
    }, 2000);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setRedTagCreated(false);
    setEditedItemName('');
    setEditedAction('');
    setShowARGrid(true);
  };

  const selectContext = (name: string, newChecklist?: string[]) => {
      setAuditContext(name);
      if (newChecklist) setActiveChecklistItems(newChecklist);
      setIsContextConfirmed(true);
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
      <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in font-sans">
        
        {/* CONTEXT INPUT SCREEN (Before Camera) */}
        {!isContextConfirmed && (
            <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in overflow-y-auto">
                <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl my-auto">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
                        <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Define Audit Scope</h3>
                    <p className="text-sm text-center text-slate-500 mb-6">Select a known factory zone, a generic environment, or enter a custom location.</p>
                    
                    <div className="space-y-6">
                        {/* Known Zones */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center">
                                <Factory className="w-3 h-3 mr-1" /> Factory Zones
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {WORKPLACES.map(wp => (
                                    <button 
                                        key={wp.id}
                                        onClick={() => selectContext(wp.name, wp.checklist)}
                                        className="text-xs bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-600 py-2.5 px-3 rounded-lg transition-colors truncate text-left flex flex-col"
                                    >
                                        <span className="font-bold truncate w-full">{wp.name}</span>
                                        <span className="text-[10px] text-slate-400 capitalize">{wp.type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generic Types */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center">
                                <Briefcase className="w-3 h-3 mr-1" /> Quick Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {GENERIC_CONTEXTS.map(gc => (
                                    <button
                                        key={gc.name}
                                        onClick={() => selectContext(gc.name, gc.checklist)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full border border-transparent transition-colors"
                                    >
                                        {gc.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Manual Input */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-bold">Or Custom</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={auditContext}
                                onChange={(e) => setAuditContext(e.target.value)}
                                placeholder="e.g. Loading Dock 3"
                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                            />
                            <button 
                                onClick={() => setIsContextConfirmed(true)}
                                disabled={!auditContext}
                                className="bg-red-600 text-white px-4 rounded-lg font-bold shadow-md hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <button onClick={onExit} className="mt-6 text-white/50 hover:text-white flex items-center text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Return
                </button>
            </div>
        )}

        {/* AR Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center pointer-events-none">
          <button onClick={() => isRealWorldStart ? onExit() : setIsLensMode(false)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm pointer-events-auto">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white text-center">
            <h2 className="font-bold text-sm tracking-wider uppercase text-red-500 flex items-center justify-center">
               <Scan className="w-4 h-4 mr-1 animate-pulse" /> {auditContext || "Real World 5S"}
            </h2>
            <p className="text-[10px] text-white/70">AR Scanner Active</p>
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

          {/* AR HUD ELEMENTS (Grid, Lines) */}
          {showARGrid && isContextConfirmed && !capturedImage && (
             <div className="absolute inset-0 pointer-events-none opacity-30">
                 <div className="absolute inset-0 border-[20px] border-transparent border-t-red-500/20 border-b-red-500/20"></div>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                    {/* Crosshair */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-white transform -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 h-4 w-[1px] bg-white transform -translate-y-1/2"></div>
                 </div>
                 {/* Moving Scan Line */}
                 {isScanning && (
                     <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_infinite_linear]"></div>
                 )}
             </div>
          )}
          
          {/* AR CHECKLIST OVERLAY (Floating Cards) */}
          {isContextConfirmed && (
            <div className={`absolute left-0 right-0 z-30 transition-all duration-300 ease-in-out px-4 flex flex-col justify-end ${isChecklistOpen ? 'top-20 bottom-32' : 'bottom-24 h-0'}`}>
                {/* Header Toggle */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer bg-black/60 backdrop-blur-md border border-white/20 rounded-t-xl"
                  onClick={() => setIsChecklistOpen(!isChecklistOpen)}
                >
                    <div className="flex items-center text-white font-bold text-sm">
                        <ClipboardList className="w-4 h-4 mr-2 text-blue-400" />
                        Audit Standards ({activeChecklistItems.length})
                    </div>
                    <div className="flex items-center space-x-2">
                        {scanResult && (
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                               scanResult.overallCompliance > 80 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                           }`}>
                               {scanResult.overallCompliance}% Score
                           </span>
                        )}
                        {isChecklistOpen ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronUp className="w-4 h-4 text-white" />}
                    </div>
                </div>
                
                {/* Scrollable Checklist Items */}
                {isChecklistOpen && (
                    <div className="bg-black/40 backdrop-blur-sm border-x border-b border-white/10 rounded-b-xl overflow-y-auto p-3 space-y-2 max-h-full">
                        {scanResult && scanResult.checklistResults ? (
                            // SCAN RESULTS MODE
                            scanResult.checklistResults.map((res, i) => (
                                <div key={i} className={`p-3 rounded-lg border flex items-start space-x-3 ${
                                    res.compliant ? 'bg-green-900/40 border-green-500/30' : 'bg-red-900/40 border-red-500/30'
                                }`}>
                                    <div className={`mt-0.5 rounded-full p-1 ${res.compliant ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {res.compliant ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-bold">{res.item}</p>
                                        <p className="text-white/70 text-[10px] mt-1">{res.observation}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // PRE-SCAN MODE
                            activeChecklistItems.length > 0 ? (
                                activeChecklistItems.map((item, i) => (
                                    <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <p className="text-white/80 text-xs">{item}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-white/50 text-xs italic">
                                    No specific checklist for this area. Standard 5S rules apply.
                                </div>
                            )
                        )}

                        {/* Hazards Found Section */}
                        {scanResult && scanResult.detectedHazards && scanResult.detectedHazards.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-2 ml-1">Detected Hazards</h4>
                                {scanResult.detectedHazards.map((hazard, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => {
                                            setEditedItemName(hazard.name);
                                            setEditedAction(hazard.action);
                                            setSelectedHazardIndex(i);
                                        }}
                                        className={`w-full text-left p-3 mb-2 rounded-lg border flex items-center justify-between ${
                                            selectedHazardIndex === i ? 'bg-red-600 border-red-500' : 'bg-red-900/30 border-red-500/30 hover:bg-red-900/50'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-white text-xs font-bold">{hazard.name}</p>
                                            <p className="text-white/70 text-[10px] uppercase">{hazard.action} • {hazard.severity}</p>
                                        </div>
                                        {selectedHazardIndex === i && <Tag className="w-4 h-4 text-white" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}

          {/* RED TAG GENERATOR MODAL (Overlays everything if creating tag) */}
          {scanResult && selectedHazardIndex !== null && isChecklistOpen === false && (
             <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                <div className="bg-red-50 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative animate-scale-in">
                    <button onClick={() => setIsChecklistOpen(true)} className="absolute top-2 right-2 text-red-900/50 hover:text-red-900">
                        <XCircle className="w-6 h-6" />
                    </button>
                    {/* Top Hole for String */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-slate-800 rounded-full border-4 border-red-100 z-40"></div>
                    
                    <div className="bg-red-600 p-4 pt-6 text-center text-white relative">
                    <h3 className="font-black text-2xl uppercase tracking-widest border-2 border-white inline-block px-2 py-1 transform -rotate-2">5S Red Tag</h3>
                    <p className="text-red-100 text-xs mt-2 uppercase font-bold">Sort & Remove</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Item Detected</label>
                            <input 
                                type="text"
                                value={editedItemName}
                                onChange={(e) => setEditedItemName(e.target.value)}
                                className="w-full bg-red-50 border-b border-red-200 focus:border-red-600 focus:outline-none py-1 font-bold text-slate-800 text-lg"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Action Needed</label>
                            <select 
                                value={editedAction}
                                onChange={(e) => setEditedAction(e.target.value)}
                                className="w-full bg-red-50 border-b border-red-200 focus:border-red-600 focus:outline-none py-1 font-bold text-red-600 text-sm"
                            >
                                <option value="Sort">Sort</option>
                                <option value="Set in Order">Set in Order</option>
                                <option value="Shine">Shine</option>
                                <option value="Standardize">Standardize</option>
                                <option value="Sustain">Sustain</option>
                            </select>
                        </div>

                        <div className="pt-4 flex space-x-3">
                            <button 
                                onClick={createRedTag}
                                className="w-full bg-red-600 text-white rounded-lg py-3 font-bold text-sm shadow-lg hover:bg-red-700 flex items-center justify-center"
                            >
                                <Tag className="w-4 h-4 mr-2" /> Confirm & Print Tag
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* Prompt Overlay during Scanning */}
          {!scanResult && !capturedImage && isContextConfirmed && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <p className="text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                     {isScanning ? "Analyzing Standards..." : "Align objects within grid"}
                 </p>
             </div>
          )}

        </div>

        {/* Shutter Button Footer */}
        <div className="h-24 bg-black/80 backdrop-blur-md absolute bottom-0 w-full flex justify-center items-center z-20 border-t border-white/10">
          {!scanResult && !isScanning && isContextConfirmed && (
            <button
              onClick={captureAndAnalyze}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <div className="w-14 h-14 bg-white rounded-full"></div>
            </button>
          )}
          
          {scanResult && !redTagCreated && (
             <div className="flex space-x-4">
                 <button onClick={resetScan} className="bg-slate-700 text-white px-6 py-3 rounded-full font-bold text-sm">
                     Discard
                 </button>
                 <button 
                    onClick={() => {
                        setIsChecklistOpen(false); // Close checklist to show Red Tag modal
                    }} 
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-red-500/30"
                 >
                     Create Tag
                 </button>
             </div>
          )}

          {redTagCreated && (
               <div className="flex flex-col items-center animate-fade-in">
                   <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center mb-2">
                       <CheckCircle2 className="w-4 h-4 mr-2" /> Tag Logged
                   </div>
                   <button onClick={resetScan} className="text-white/60 text-xs hover:text-white underline">
                       Scan Next Area
                   </button>
               </div>
          )}
        </div>
      </div>
    );
  }

  // --- STANDARD TRAINING MODE (Checklist) ---
  const toggleItem = (itemId: string) => {
    if (submitted) return;
    setLocalChecklist(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSubmit = () => {
    if (!selectedScene) return;
    const totalItems = selectedScene.items.length;
    const checkedCount = Object.values(localChecklist).filter(Boolean).length;
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
                    localChecklist[item.id] ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      localChecklist[item.id] ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'
                    }`}>
                      {localChecklist[item.id] && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium ${localChecklist[item.id] ? 'text-slate-800' : 'text-slate-600'}`}>
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
                disabled={Object.values(localChecklist).filter(Boolean).length === 0}
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