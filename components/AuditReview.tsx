import React, { useState } from 'react';
import { AuditSession, AuditFinding } from '../types';
import { auditService } from '../services/auditService';
import { gameService } from '../services/gameService';
import { CheckCircle, XCircle, AlertTriangle, Camera, User, Calendar, Save } from 'lucide-react';

interface AuditReviewProps {
  audit: AuditSession;
  onClose: () => void;
  onProcessed: () => void;
}

const AuditReview: React.FC<AuditReviewProps> = ({ audit, onClose, onProcessed }) => {
  const [comments, setComments] = useState('');
  const [autoCreateTags, setAutoCreateTags] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await auditService.approveAudit(audit.id, 'manager-id', comments);
    
    if (autoCreateTags && audit.findings.length > 0) {
      // Auto-create Red Tags for Critical/Major findings
      for (const finding of audit.findings) {
        if (finding.severity === 'Critical' || finding.severity === 'Major') {
          await gameService.createTask({
            title: `Audit Finding: ${finding.description}`,
            description: `Auto-generated from Audit ${audit.id}. Severity: ${finding.severity}`,
            priority: finding.severity === 'Critical' ? 'high' : 'medium',
            status: 'open',
            source: '5S Red Tag',
            workplaceId: audit.workplaceId
          });
        }
      }
    }
    
    setIsProcessing(false);
    onProcessed();
  };

  const handleReject = async () => {
    if (!comments) return alert("Please provide rejection reason in comments.");
    setIsProcessing(true);
    await auditService.rejectAudit(audit.id, 'manager-id', comments);
    setIsProcessing(false);
    onProcessed();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Review</h2>
            <p className="text-gray-500 text-sm">ID: {audit.id} • {audit.checklistName}</p>
          </div>
          <div className="text-right">
             <span className={`px-3 py-1 rounded-full text-sm font-bold ${
               audit.score >= 85 ? 'bg-green-100 text-green-800' :
               audit.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
             }`}>
               Score: {audit.overallCompliance}%
             </span>
             <p className="text-xs text-gray-400 mt-1">{new Date(audit.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata */}
          <div className="md:col-span-1 space-y-4">
             <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Audit Details</h3>
                <div className="space-y-3 text-sm">
                   <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{audit.auditorName || 'Unknown Auditor'}</span>
                   </div>
                   <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(audit.createdAt).toLocaleString()}</span>
                   </div>
                   <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{audit.findings.length} Findings</span>
                   </div>
                </div>
             </div>
             
             {/* Findings Summary */}
             {audit.findings.length > 0 && (
               <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                 <h3 className="text-xs font-bold text-red-800 uppercase mb-2">Critical Issues</h3>
                 <ul className="space-y-2">
                   {audit.findings.map((f, i) => (
                     <li key={i} className="text-sm text-red-700 flex items-start">
                       <span className="mr-2">•</span> {f.description}
                     </li>
                   ))}
                 </ul>
                 <div className="mt-3 pt-3 border-t border-red-200">
                    <label className="flex items-center text-sm font-bold text-red-900">
                      <input 
                        type="checkbox" 
                        checked={autoCreateTags}
                        onChange={e => setAutoCreateTags(e.target.checked)}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      Auto-create Red Tags
                    </label>
                 </div>
               </div>
             )}
          </div>

          {/* Q&A List */}
          <div className="md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
             <h3 className="text-sm font-bold text-gray-700">Detailed Responses</h3>
             {audit.responses.map((resp, idx) => (
               <div key={idx} className="border-b border-gray-100 pb-3">
                 <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-800">Item #{idx+1}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      resp.answer === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {resp.answer}
                    </span>
                 </div>
                 {resp.photoIds && resp.photoIds.length > 0 && (
                   <div className="flex gap-2 mt-2">
                     {resp.photoIds.map((url, pIdx) => (
                       <img key={pIdx} src={url} alt="Evidence" className="w-16 h-16 object-cover rounded border border-gray-200" />
                     ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
           <label className="block text-sm font-bold text-gray-700 mb-2">Manager Comments</label>
           <textarea 
             value={comments}
             onChange={e => setComments(e.target.value)}
             className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm"
             placeholder="Add notes, approval rationale, or rejection feedback..."
             rows={3}
           />
           <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-100 text-red-700 font-bold hover:bg-red-200 rounded-lg"
              >
                Request Changes
              </button>
              <button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 rounded-lg flex items-center shadow-md"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve Audit
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReview;
