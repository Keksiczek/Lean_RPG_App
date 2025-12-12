import React, { useState, useRef, useEffect } from 'react';
import { ChecklistTemplate, AuditResponse, AuditSession, Workplace } from '../types';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Save, ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { auditService } from '../services/auditService';
import { gameService } from '../services/gameService'; // For task creation
import { useAuth } from '../contexts/AuthContext';
import { WORKPLACES } from '../constants'; // Fallback
import { checklistService } from '../services/checklistService';

interface AuditSessionProps {
  templateId?: string;
  workplaceId?: string;
  onExit: () => void;
  onComplete: () => void;
}

const AuditSessionComponent: React.FC<AuditSessionProps> = ({ templateId, workplaceId, onExit, onComplete }) => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, AuditResponse>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compliance, setCompliance] = useState(100);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Setup State
  const [setupMode, setSetupMode] = useState(!templateId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId || '');
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(workplaceId || '');
  const [availableTemplates, setAvailableTemplates] = useState<ChecklistTemplate[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const temps = await checklistService.getTemplates();
      setAvailableTemplates(temps);
      if (templateId) {
        const t = temps.find(x => x.id === templateId);
        if (t) setTemplate(t);
      }
    };
    loadData();
  }, [templateId]);

  // Real-time compliance calc
  useEffect(() => {
    if (!template) return;
    let totalScore = 0;
    let maxScore = 0;
    
    template.items.forEach(item => {
      const resp = responses[item.id];
      maxScore += item.scoring_weight;
      if (resp && resp.answer === item.expected_answer) {
        totalScore += item.scoring_weight;
      }
    });

    setCompliance(maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100);
  }, [responses, template]);

  const handleStart = async () => {
    if (selectedTemplateId && selectedWorkplaceId) {
       const t = availableTemplates.find(x => x.id === selectedTemplateId);
       if (t) setTemplate(t);
       setSetupMode(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!template) return;
    const item = template.items[currentIndex];
    setResponses(prev => ({
      ...prev,
      [item.id]: {
        itemId: item.id,
        answer,
        timestamp: new Date().toISOString(),
        photoIds: prev[item.id]?.photoIds || [],
        notes: prev[item.id]?.notes || ''
      }
    }));
  };

  const capturePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        // In real app, upload to storage and get ID. Here we use base64 as mock ID.
        const item = template!.items[currentIndex];
        setResponses(prev => ({
            ...prev,
            [item.id]: {
                ...prev[item.id],
                photoIds: [...(prev[item.id]?.photoIds || []), dataUrl]
            }
        }));
        setCameraOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!template || !user) return;
    
    // Calculate final status/risk
    const riskLevel = compliance >= 85 ? 'Green' : compliance >= 70 ? 'Yellow' : 'Red';
    const status = compliance < 100 ? 'pending_approval' : 'completed';

    const sessionData: Partial<AuditSession> = {
      checklistId: template.id,
      workplaceId: selectedWorkplaceId,
      auditorId: user.id.toString(),
      responses: Object.values(responses),
      overallCompliance: compliance,
      riskLevel,
      score: compliance,
      xpEarned: compliance * 2, // Simple logic
      status: 'completed' // For MVP immediate complete
    };

    await auditService.submitAudit(sessionData);
    
    // Auto-create Red Tags for Critical Failures
    const findings = template.items.filter(item => {
        const r = responses[item.id];
        return r && r.answer !== item.expected_answer;
    });

    for (const f of findings) {
        if (f.scoring_weight >= 8) { // Assuming high weight = critical
             await gameService.createTask({
                 title: `Audit Finding: ${f.question}`,
                 description: `Failed during audit ${template.name}. Guidance: ${f.guidance}`,
                 priority: 'high',
                 status: 'open',
                 source: '5S Red Tag',
                 workplaceId: selectedWorkplaceId
             });
        }
    }

    onComplete();
  };

  // --- UI SECTIONS ---

  if (setupMode) {
     return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
           <h2 className="text-2xl font-bold mb-6">Start New Audit</h2>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Select Workplace</label>
                 <select 
                    value={selectedWorkplaceId} onChange={e => setSelectedWorkplaceId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                 >
                    <option value="">-- Choose Area --</option>
                    {WORKPLACES.map(wp => <option key={wp.id} value={wp.id}>{wp.name}</option>)}
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Select Checklist</label>
                 <select 
                    value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
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
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex justify-between items-center">
          <div>
             <h2 className="font-bold text-gray-800">{template.name}</h2>
             <p className="text-xs text-gray-500">Item {currentIndex + 1} of {template.items.length}</p>
          </div>
          <div className={`px-3 py-1 rounded-lg font-bold text-lg ${
             compliance > 85 ? 'bg-green-100 text-green-700' : 
             compliance > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
             {compliance}%
          </div>
       </div>

       {/* CAMERA MODAL */}
       {cameraOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
             <video ref={videoRef} autoPlay className="flex-1 object-cover" />
             <div className="p-6 bg-black flex justify-center gap-6">
                <button onClick={() => setCameraOpen(false)} className="text-white font-bold">Cancel</button>
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300"></button>
             </div>
          </div>
       )}

       {/* QUESTION CARD */}
       <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-6 border-b border-gray-100">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{currentItem.category}</span>
             <h3 className="text-xl font-bold text-gray-900 mt-1">{currentItem.question}</h3>
          </div>

          <div className="p-6 space-y-6 flex-1">
             <div className="flex gap-4">
                <button 
                   onClick={() => handleAnswer('Yes')}
                   className={`flex-1 py-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                      currentResponse?.answer === 'Yes' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                   }`}
                >
                   <CheckCircle2 className="w-8 h-8" /> Yes
                </button>
                <button 
                   onClick={() => handleAnswer('No')}
                   className={`flex-1 py-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                      currentResponse?.answer === 'No' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'
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
                      <p className="font-bold text-amber-800 text-sm">Guidance</p>
                      <p className="text-amber-700 text-sm">{currentItem.guidance}</p>
                   </div>
                </div>
             )}

             {/* Photo Evidence */}
             <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-sm font-bold text-gray-700">Photo Evidence {currentItem.photo_required && '*'}</label>
                   <button 
                      onClick={() => {
                          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                            .then(s => {
                                setCameraOpen(true);
                                if (videoRef.current) videoRef.current.srcObject = s;
                            });
                      }}
                      className="text-blue-600 text-xs font-bold flex items-center"
                   >
                      <Camera className="w-3 h-3 mr-1" /> Add Photo
                   </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                   {currentResponse?.photoIds.map((src, i) => (
                      <img key={i} src={src} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* FOOTER NAV */}
       <div className="mt-4 flex justify-between gap-3">
          <button 
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-600 font-bold disabled:opacity-50"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          
          {currentIndex < template.items.length - 1 ? (
             <button 
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex-1 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center hover:bg-gray-800"
             >
                Next Item <ArrowRight className="w-5 h-5 ml-2" />
             </button>
          ) : (
             <button 
                onClick={handleSubmit}
                className="flex-1 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-green-700"
             >
                Submit Audit <Save className="w-5 h-5 ml-2" />
             </button>
          )}
       </div>
    </div>
  );
};

export default AuditSessionComponent;
