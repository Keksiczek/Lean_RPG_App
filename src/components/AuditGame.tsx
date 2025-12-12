import React, { useState, useRef, useEffect } from 'react';
import { AuditScene, LensScanResult, RedTagData } from '../types';
import { AUDIT_SCENES, WORKPLACES } from '../constants';
import { analyze5SImage } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext'; // Import Auth
import { CheckCircle2, ArrowLeft, Camera, Scan, Loader2, Tag, ClipboardList, ChevronDown, ChevronUp, MapPin, XCircle, Factory, Briefcase, ArrowRight, Settings, Package, Users, Lightbulb } from 'lucide-react';

interface AuditGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
  checklist?: string[]; 
  initialContext?: string;
}

const GENERIC_CONTEXTS = [
  { name: "General Production Area", checklist: ["Walkways marked & clear", "Tools in designated areas", "No safety hazards", "Workstations clean"] },
  { name: "Office Environment", checklist: ["Desks organized", "Confidential info secured", "Cables managed", "Common areas tidy"] },
  { name: "Warehouse / Storage", checklist: ["Aisles unobstructed", "Inventory labeled", "Stacking height compliant", "Pallets in good condition"] },
  { name: "Maintenance Shop", checklist: ["Tools shadow-boarded", "No oil leaks", "Spare parts labeled", "Lockout/Tagout stations clear"] }
];

const SCANNING_HINTS = [
  "Ensure good lighting for best AI analysis.",
  "Capture the full workstation context.",
  "Look for items out of place or safety hazards.",
  "Focus on tool boards and shadow outlines.",
  "Stand 1-2 meters away for optimal framing."
];

const CONTEXT_SUGGESTIONS = [
  "Assembly Line", 
  "Warehouse Rack", 
  "Welding Bay", 
  "Office Desk", 
  "Break Room", 
  "Shipping Dock", 
  "Quality Lab"
];

const AuditGame: React.FC<AuditGameProps> = ({ onComplete, onExit, isRealWorldStart = false, checklist = [], initialContext = '' }) => {
  const { user } = useAuth(); // Access user for ID
  const [selectedScene, setSelectedScene] = useState<AuditScene | null>(null);
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  
  // Lens/Real World State
  const [isLensMode, setIsLensMode] = useState(isRealWorldStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LensScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [redTagCreated, setRedTagCreated] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);

  // AR UI State
  const [showARGrid, setShowARGrid] = useState(true);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showInputHints, setShowInputHints] = useState(false);

  // Context
  const [auditContext, setAuditContext] = useState(initialContext);
  const [isContextConfirmed, setIsContextConfirmed] = useState(!!initialContext);
  const [activeChecklistItems, setActiveChecklistItems] = useState<string[]>(checklist);

  // Red Tag
  const [editedItemName, setEditedItemName] = useState('');
  const [editedAction, setEditedAction] = useState<string>('');
  const [selectedHazardIndex, setSelectedHazardIndex] = useState<number>(0);

  useEffect(() => {
    if (isRealWorldStart) {
      setIsLensMode(true);
    }
  }, [isRealWorldStart]);

  useEffect(() => {
      if (initialContext) {
          setAuditContext(initialContext);
          setIsContextConfirmed(true);
      }
      if (checklist.length > 0) {
          setActiveChecklistItems(checklist);
      }
  }, [initialContext, checklist]);

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
      });
    }

    // Hint rotation
    const hintInterval = setInterval(() => {
      setActiveHintIndex(prev => (prev + 1) % SCANNING_HINTS.length);
    }, 5000);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(hintInterval);
    };
  }, [isLensMode, capturedImage, isRealWorldStart, isContextConfirmed]);

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
      const result = await analyze5SImage(base64Image, auditContext, activeChecklistItems);
      setScanResult(result);
      if (result.detectedHazards && result.detectedHazards.length > 0) {
        setEditedItemName(result.detectedHazards[0].name);
        setEditedAction(result.detectedHazards[0].action);
      } else {
        setEditedItemName(result.itemDetected || "Issue");
        setEditedAction(result.suggested5SAction || "Sort");
      }
      setIsChecklistOpen(true);
    } catch (e) {
      console.error(e);
      alert("Scan failed. Try again.");
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  const createRedTag = async () => {
    if (!scanResult || !user) return;
    
    const redTag: RedTagData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        itemDetected: editedItemName,
        actionNeeded: scanResult.detectedHazards?.[selectedHazardIndex]?.action || editedAction,
        location: auditContext || "Workplace Scan",
        status: 'Open'
    };

    try {
        await gameService.createTask({
            title: `Red Tag: ${editedItemName}`,
            description: `Auto-generated from 5S Scan. Observation: ${scanResult.detectedHazards?.[selectedHazardIndex]?.name || scanResult.observation}.`,
            status: 'open',
            priority: 'medium',
            source: '5S Red Tag',
            location: auditContext || 'Unknown Area',
            imageUrl: capturedImage || undefined,
            dueDate: new Date(Date.now() + 604800000).toISOString() 
        });
        
        // Log game completion real backend
        await gameService.saveAuditResult(
          'real-world-5s',
          scanResult.overallCompliance || 0,
          150,
          redTag,
          user.id
        );

    } catch (e) {
        console.error("Failed to sync tag", e);
    }
    
    setRedTagCreated(true);
    setTimeout(() => {
        onComplete(150, scanResult.overallCompliance || 0, `Real World 5S Scan: ${editedItemName}`);
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

  const getIcon = (type: string) => {
    switch (type) {
        case 'production': return <Settings className="w-5 h-5" />;
        case 'logistics': return <Package className="w-5 h-5" />;
        case 'quality': return <CheckCircle2 className="w-5 h-5" />;
        case 'office': return <Users className="w-5 h-5" />;
        default: return <Factory className="w-5 h-5" />;
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async () => {
    if (!selectedScene || !user) return;
    setIsSubmitting(true);

    const totalItems = selectedScene.items.length;
    const checkedCount = Object.values(localChecklist).filter(Boolean).length;
    const score = Math.round((checkedCount / totalItems) * 100);
    const xpEarned = Math.round(selectedScene.xpReward * (score / 100));
    
    try {
      await gameService.saveAuditResult(
        selectedScene.id, 
        score, 
        xpEarned, 
        localChecklist,
        user.id
      );
      setSubmitted(true);
      setTimeout(() => {
        onComplete(xpEarned, score, `5S Sim: ${selectedScene.title}`);
      }, 2000);
    } catch (e) {
      alert("Error submitting results to server. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- RENDERS ---

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

  // Real World Mode
  if (isLensMode) {
      return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in font-sans">
        {/* Context Selection Overlay */}
        {!isContextConfirmed && (
            <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                     <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                         <h3 className="font-bold text-slate-800">Select Audit Context</h3>
                         <button onClick={onExit}><XCircle className="w-6 h-6 text-slate-400" /></button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                         {GENERIC_CONTEXTS.map(ctx => (
                             <button
                                key={ctx.name}
                                onClick={() => selectContext(ctx.name, ctx.checklist)}
                                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all group"
                             >
                                 <div className="font-bold text-slate-800 group-hover:text-red-700">{ctx.name}</div>
                                 <div className="text-xs text-slate-500 mt-1 truncate">{ctx.checklist.join(', ')}</div>
                             </button>
                         ))}
                         {WORKPLACES.map(wp => (
                             <button
                                key={wp.id}
                                onClick={() => selectContext(wp.name, wp.checklist)}
                                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                             >
                                 <div className="flex items-center">
                                     <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                     <div className="font-bold text-slate-800 group-hover:text-blue-700">{wp.name}</div>
                                 </div>
                             </button>
                         ))}
                     </div>
                     <div className="p-4 bg-slate-50 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Or Enter Custom Area</label>
                        <div className="flex gap-2 relative">
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    value={auditContext}
                                    onChange={(e) => setAuditContext(e.target.value)}
                                    onFocus={() => setShowInputHints(true)}
                                    // Delay blur to allow clicking on suggestions
                                    onBlur={() => setTimeout(() => setShowInputHints(false), 200)}
                                    placeholder="e.g. Break Room, Exterior..."
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm shadow-sm"
                                />
                                {showInputHints && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 animate-fade-in-up z-50">
                                        <div className="flex items-center text-xs font-bold text-slate-400 uppercase mb-2">
                                            <Lightbulb className="w-3 h-3 text-yellow-500 mr-1" /> Suggestions
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {CONTEXT_SUGGESTIONS.map(s => (
                                                <button 
                                                    key={s}
                                                    onClick={() => setAuditContext(s)}
                                                    className="text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded transition-colors text-slate-600 border border-slate-200"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setIsContextConfirmed(true)}
                                disabled={!auditContext}
                                className="bg-slate-900 text-white px-5 rounded-xl font-bold shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                Start
                            </button>
                        </div>
                    </div>
                </div>
                 <button onClick={onExit} className="mt-4 text-white/50 hover:text-white flex items-center text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Scan
                </button>
            </div>
        )}
        
        {/* Camera View */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden">
          {capturedImage ? (
             <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-100" alt="Captured" />
          ) : (
             <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-100" />
          )}
          
          {/* AR Overlay Grid (Decorative) */}
          {showARGrid && !capturedImage && isContextConfirmed && (
             <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full border-2 border-white/30 p-8">
                   <div className="w-full h-full border border-white/20 rounded-3xl relative">
                       <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                       <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-1 h-1 bg-white rounded-full"></div>
                       </div>
                   </div>
                </div>
             </div>
          )}
          
          {/* Active Context Label */}
          {isContextConfirmed && !scanResult && (
             <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
                 <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                    <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Active Context</p>
                    <p className="font-bold flex items-center"><MapPin className="w-3 h-3 mr-1 text-red-500" /> {auditContext}</p>
                 </div>
                 <div className="pointer-events-auto">
                    <button onClick={onExit} className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/20">
                        <XCircle className="w-6 h-6" />
                    </button>
                 </div>
             </div>
          )}

          {/* Analysis Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-40 backdrop-blur-sm animate-fade-in">
                <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-white font-bold text-xl animate-pulse">Analyzing Scene...</div>
                <p className="text-white/60 text-sm mt-2">Checking 5S compliance via Gemini Vision</p>
            </div>
          )}

          {/* Result Card */}
          {scanResult && (
              <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 transition-transform duration-300 ease-out transform ${isChecklistOpen ? 'translate-y-0' : 'translate-y-[85%]'}`}>
                  {/* Handle bar */}
                  <div 
                    className="w-full h-8 flex justify-center items-center cursor-pointer"
                    onClick={() => setIsChecklistOpen(!isChecklistOpen)}
                  >
                      <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                  </div>

                  <div className="px-6 pb-6">
                      <div className="flex justify-between items-center mb-4">
                          <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-xl font-bold text-slate-900">{scanResult.itemDetected || "Analysis Complete"}</h3>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                                    scanResult.overallCompliance > 80 ? 'bg-green-100 text-green-700' : 
                                    scanResult.overallCompliance > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {scanResult.overallCompliance}% Score
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">{scanResult.observation}</p>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                          <div className="flex items-start">
                              <Tag className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                              <div>
                                  <h4 className="font-bold text-slate-700 text-sm uppercase">Suggested Action</h4>
                                  <p className="text-slate-900 font-bold text-lg">{scanResult.suggested5SAction}</p>
                                  <p className="text-sm text-slate-600 mt-1">{scanResult.practicalAction}</p>
                              </div>
                          </div>
                      </div>
                      
                      {/* Hazards List */}
                      {scanResult.detectedHazards && scanResult.detectedHazards.length > 0 && (
                          <div className="mb-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Detected Items</h4>
                              <div className="space-y-2">
                                  {scanResult.detectedHazards.map((hazard, idx) => (
                                      <button 
                                        key={idx}
                                        onClick={() => {
                                            setEditedItemName(hazard.name);
                                            setEditedAction(hazard.action);
                                            setSelectedHazardIndex(idx);
                                        }}
                                        className={`w-full text-left flex justify-between items-center p-3 rounded-lg border transition-all ${
                                            selectedHazardIndex === idx 
                                            ? 'bg-red-50 border-red-500 shadow-sm' 
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                      >
                                          <div className="flex items-center">
                                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                                  hazard.severity === 'High' ? 'bg-red-500' : 
                                                  hazard.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                                              }`}></span>
                                              <span className="text-sm font-medium text-slate-700">{hazard.name}</span>
                                          </div>
                                          <span className="text-xs text-slate-400">{hazard.action}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Manual Override */}
                      <div className="mb-6 pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-2 font-medium">Verify or Edit Details</p>
                          <input 
                            value={editedItemName}
                            onChange={(e) => setEditedItemName(e.target.value)}
                            className="w-full mb-2 p-2 border border-slate-300 rounded text-sm font-medium"
                            placeholder="Item Name"
                          />
                          <select 
                             value={editedAction}
                             onChange={(e) => setEditedAction(e.target.value)}
                             className="w-full p-2 border border-slate-300 rounded text-sm"
                          >
                             {['Sort', 'Set in Order', 'Shine', 'Standardize', 'Sustain'].map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                      </div>

                      {/* Checklist Validation (If checklist provided) */}
                      {scanResult.checklistResults && scanResult.checklistResults.length > 0 && (
                          <div className="mb-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Checklist Verification</h4>
                              <div className="space-y-2">
                                  {scanResult.checklistResults.map((res, i) => (
                                      <div key={i} className="flex items-start text-sm p-2 bg-slate-50 rounded">
                                          {res.compliant ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />}
                                          <div>
                                              <p className="font-bold text-slate-700">{res.item}</p>
                                              <p className="text-xs text-slate-500">{res.observation}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
        </div>
        
        {/* Shutter & Hints */}
        <div className="h-24 bg-black/80 backdrop-blur-md absolute bottom-0 w-full flex justify-center items-center z-20 border-t border-white/10">
          
          {/* Scanning Hints Overlay - displayed when camera active but not scanning/result */}
          {!scanResult && !isScanning && isContextConfirmed && (
            <div className="absolute bottom-28 w-full flex justify-center pointer-events-none px-4">
                <div className="bg-black/40 backdrop-blur-md text-white text-xs py-2 px-4 rounded-full flex items-center border border-white/10 shadow-lg animate-pulse-slow">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400 mr-2 shrink-0" />
                    <span className="text-center">{SCANNING_HINTS[activeHintIndex]}</span>
                </div>
            </div>
          )}

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
                    onClick={createRedTag}
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-red-500/30 flex items-center"
                 >
                     Create Tag <ArrowRight className="w-4 h-4 ml-2" />
                 </button>
             </div>
          )}

          {redTagCreated && (
             <div className="bg-green-500 text-white px-8 py-3 rounded-full font-bold text-sm flex items-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Tag Created
             </div>
          )}
        </div>
      </div>
      );
  }

  // Simulation Mode
  if (selectedScene) {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedScene(null)} className="flex items-center text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Simulation List
            </button>
            <div className="text-right">
              <h2 className="font-bold text-slate-800">{selectedScene.title}</h2>
              <p className="text-xs text-slate-500">Virtual Audit</p>
            </div>
          </div>
    
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {selectedScene.items.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => !submitted && setLocalChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
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
                disabled={isSubmitting || Object.values(localChecklist).filter(Boolean).length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
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

export default AuditGame;