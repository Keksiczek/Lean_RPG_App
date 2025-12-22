
import React, { useState, useRef, useEffect } from 'react';
import { ChecklistTemplate, AuditResponse, AuditSession, AuditFinding } from '../types';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Save, ArrowLeft, ArrowRight, PauseCircle, Upload, Trash2, ImageIcon } from 'lucide-react';
import { auditService } from '../services/auditService';
import { useAuth } from '../contexts/AuthContext';
import { WORKPLACES } from '../constants';
import { checklistService } from '../services/checklistService';

interface AuditSessionProps {
  templateId?: string;
  onExit: () => void;
  onComplete: () => void;
}

const AuditSessionComponent: React.FC<AuditSessionProps> = ({ templateId, onExit, onComplete }) => {
  const { user } = useAuth();
  
  // Setup State
  const [setupMode, setSetupMode] = useState(!templateId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId || '');
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState<ChecklistTemplate[]>([]);

  // Active Session State
  const [currentSession, setCurrentSession] = useState<AuditSession | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, AuditResponse>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compliance, setCompliance] = useState(100);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  
  // UI State
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const temps = await checklistService.getTemplates();
      setAvailableTemplates(temps);
    };
    loadData();
  }, []);

  // Initialize Template when ID is selected
  useEffect(() => {
    if (selectedTemplateId && availableTemplates.length > 0) {
      const t = availableTemplates.find(x => x.id === selectedTemplateId);
      if (t) setTemplate(t);
    }
  }, [selectedTemplateId, availableTemplates]);

  // Real-time Calculation
  useEffect(() => {
    if (!template) return;
    let totalScore = 0;
    let maxScore = 0;
    const currentFindings: AuditFinding[] = [];
    
    template.items.forEach(item => {
      const resp = responses[item.id];
      maxScore += item.scoring_weight;
      if (resp) {
        if (resp.answer === item.expected_answer) {
           totalScore += item.scoring_weight;
        } else {
           // Create tentative finding
           currentFindings.push({
             itemId: item.id,
             severity: item.scoring_weight >= 8 ? 'Critical' : item.scoring_weight >= 5 ? 'Major' : 'Minor',
             description: `Failed: ${item.question}`,
             photo: resp.photoIds?.[0],
             approved: false
           });
        }
      }
    });

    setFindings(currentFindings);
    setCompliance(maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100);
  }, [responses, template]);

  const handleStart = async () => {
    if (selectedTemplateId && selectedWorkplaceId && user) {
       const session = await auditService.startAudit(selectedTemplateId, selectedWorkplaceId, user.id.toString());
       setCurrentSession(session);
       setSetupMode(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!template || !currentSession) return;
    const item = template.items[currentIndex];
    
    const newResponse: AuditResponse = {
        itemId: item.id,
        answer,
        timestamp: new Date().toISOString(),
        photoIds: responses[item.id]?.photoIds || [],
        notes: responses[item.id]?.notes || ''
    };

    setResponses(prev => ({ ...prev, [item.id]: newResponse }));
    
    // Auto-save to backend
    await auditService.saveResponse(currentSession.id, newResponse);
    
    // Auto-advance if simple Yes/No and no photo required
    if (!item.photo_required && (answer === 'Yes' || answer === 'No') && currentIndex < template.items.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 250);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && template) {
          const reader = new FileReader();
          reader.onloadend = () => {
              addPhotoToResponse(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const addPhotoToResponse = (dataUrl: string) => {
      if (!template) return;
      const item = template.items[currentIndex];
      const updatedResponse = {
          ...(responses[item.id] || { itemId: item.id, answer: '', timestamp: '', photoIds: [], notes: '' }),
          photoIds: [...(responses[item.id]?.photoIds || []), dataUrl]
      };
      setResponses(prev => ({ ...prev, [item.id]: updatedResponse }));
  };

  const capturePhoto = () => {
    if (videoRef.current && template) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        addPhotoToResponse(dataUrl);
        setCameraOpen(false);
    }
  };

  const removePhoto = (photoIdx: number) => {
      if (!template) return;
      const item = template.items[currentIndex];
      const resp = responses[item.id];
      if (resp) {
          const newPhotos = [...resp.photoIds];
          newPhotos.splice(photoIdx, 1);
          setResponses(prev => ({
              ...prev,
              [item.id]: { ...resp, photoIds: newPhotos }
          }));
      }
  };

  const handleSubmit = async () => {
    if (!currentSession || !user) return;
    setIsSubmitting(true);
    
    const riskLevel = compliance >= 85 ? 'Green' : compliance >= 70 ? 'Yellow' : 'Red';

    await auditService.submitAudit(
        currentSession.id, 
        Object.values(responses),
        findings,
        compliance,
        riskLevel
    );

    onComplete();
  };

  // SETUP VIEW
  if (setupMode) {
     return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
           <h2 className="text-2xl font-bold mb-6 text-gray-900">Start New Audit</h2>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Select Workplace</label>
                 <select 
                    value={selectedWorkplaceId} onChange={e => setSelectedWorkplaceId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                 >
                    <option value="">-- Choose Area --</option>
                    {WORKPLACES.map(wp => <option key={wp.id} value={wp.id}>{wp.name}</option>)}
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Select Checklist</label>
                 <select 
                    value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                 >
                    <option value="">-- Choose Template --</option>
                    {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>)}
                 </select>
              </div>

              <div className="pt-4 flex gap-3">
                 <button onClick={onExit} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                 <button 
                    onClick={handleStart} 
                    disabled={!selectedTemplateId || !selectedWorkplaceId}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                 >
                    Start Audit
                 </button>
              </div>
           </div>
        </div>
     );
  }

  if (!template) return <div>Loading...</div>;

  const currentItem = template.items[currentIndex];
  const currentResponse = responses[currentItem.id];

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-100px)] flex flex-col">
       {/* HEADER */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex justify-between items-center sticky top-0 z-10">
          <div>
             <h2 className="font-bold text-gray-800">{template.name}</h2>
             <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Item {currentIndex + 1} / {template.items.length}</span>
                {findings.length > 0 && <span className="text-red-600 font-bold">• {findings.length} Findings</span>}
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onExit} className="text-gray-400 hover:text-gray-600"><PauseCircle className="w-6 h-6" /></button>
             <div className={`px-3 py-1 rounded-lg font-bold text-lg transition-colors duration-500 ${
                compliance > 85 ? 'bg-green-100 text-green-700' : 
                compliance > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
             }`}>
                {compliance}%
             </div>
          </div>
       </div>

       {/* CAMERA MODAL */}
       {cameraOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
             <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
             <div className="p-6 bg-black flex justify-center gap-6 pb-12">
                <button onClick={() => setCameraOpen(false)} className="text-white font-bold px-4">Cancel</button>
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-xl"></button>
             </div>
          </div>
       )}

       {/* QUESTION CARD */}
       <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-y-auto flex flex-col relative animate-fade-in">
          <div className="p-6 border-b border-gray-100">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">{currentItem.category}</span>
             <h3 className="text-xl font-bold text-gray-900 mt-3 leading-snug">{currentItem.question}</h3>
          </div>

          <div className="p-6 space-y-6 flex-1">
             <div className="flex gap-4">
                <button 
                   onClick={() => handleAnswer('Yes')}
                   className={`flex-1 py-6 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                      currentResponse?.answer === 'Yes' ? 'border-green-500 bg-green-50 text-green-700 shadow-inner' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                   }`}
                >
                   <CheckCircle2 className="w-8 h-8" /> Yes
                </button>
                <button 
                   onClick={() => handleAnswer('No')}
                   className={`flex-1 py-6 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                      currentResponse?.answer === 'No' ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                   }`}
                >
                   <XCircle className="w-8 h-8" /> No
                </button>
             </div>

             {/* Guidance if failed */}
             {currentResponse?.answer === 'No' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 animate-fade-in">
                   <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                   <div>
                      <p className="font-bold text-amber-800 text-sm">Action Required</p>
                      <p className="text-amber-700 text-sm mt-1">{currentItem.guidance || "Please document this finding."}</p>
                   </div>
                </div>
             )}

             {/* Photo Evidence */}
             <div>
                <div className="flex justify-between items-center mb-3">
                   <label className="text-sm font-bold text-gray-700 flex items-center">
                     Photo Evidence 
                     {currentItem.photo_required && <span className="text-red-500 ml-1">*</span>}
                   </label>
                   <div className="flex gap-2">
                       <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center hover:bg-slate-100 border"
                       >
                          <Upload className="w-3 h-3 mr-1" /> Upload
                       </button>
                       <button 
                          onClick={() => {
                              navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                                .then(s => {
                                    setCameraOpen(true);
                                    if (videoRef.current) videoRef.current.srcObject = s;
                                });
                          }}
                          className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center hover:bg-blue-100"
                       >
                          <Camera className="w-3 h-3 mr-1" /> Take Photo
                       </button>
                       <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                        />
                   </div>
                </div>
                
                {currentResponse?.photoIds && currentResponse.photoIds.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {currentResponse.photoIds.map((src, i) => (
                        <div key={i} className="relative w-28 h-28 shrink-0 group">
                            <img src={src} className="w-full h-full rounded-xl object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105" />
                            <button 
                                onClick={() => removePhoto(i)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
                        <ImageIcon className="w-6 h-6 opacity-20" />
                        No photos added for this checkpoint
                    </div>
                )}
             </div>
          </div>
       </div>

       {/* FOOTER NAV */}
       <div className="mt-4 flex justify-between gap-3">
          <button 
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-600 font-bold disabled:opacity-50 hover:bg-gray-50"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          
          {currentIndex < template.items.length - 1 ? (
             <button 
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex-1 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 shadow-md"
             >
                Next Item <ArrowRight className="w-5 h-5 ml-2" />
             </button>
          ) : (
             <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-red-700 shadow-md transition-all"
             >
                {isSubmitting ? 'Submitting...' : 'Complete Audit'} <Save className="w-5 h-5 ml-2" />
             </button>
          )}
       </div>
    </div>
  );
};

export default AuditSessionComponent;
