import React, { useEffect, useState } from 'react';
import { AuditSession } from '../types';
import { auditService } from '../services/auditService';
import { Clock, CheckCircle2, AlertCircle, Filter, ArrowRight } from 'lucide-react';
import AuditReview from './AuditReview';

const AuditApprovalQueue: React.FC = () => {
  const [audits, setAudits] = useState<AuditSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<AuditSession | null>(null);

  const loadAudits = async () => {
    setLoading(true);
    const data = await auditService.getPendingAudits();
    setAudits(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleProcess = () => {
    setSelectedAudit(null);
    loadAudits();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading pending audits...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-500" />
          Pending Approvals ({audits.length})
        </h3>
        <button className="text-sm text-blue-600 font-bold hover:underline">View History</button>
      </div>

      {audits.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
          <p>All caught up! No pending audits.</p>
        </div>
      ) : (
        <div className="grid gap-4">
           {audits.map(audit => (
             <div key={audit.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                   <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                         audit.score >= 85 ? 'bg-green-100 text-green-700' :
                         audit.score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {audit.score}% Compliance
                      </span>
                      <span className="text-xs text-gray-400">{new Date(audit.createdAt).toLocaleDateString()}</span>
                   </div>
                   <h4 className="font-bold text-gray-900">{audit.checklistName}</h4>
                   <p className="text-sm text-gray-500">{audit.workplaceName} • by {audit.auditorName}</p>
                </div>

                <div className="flex items-center space-x-4">
                   {audit.findings.length > 0 && (
                     <div className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                       <AlertCircle className="w-3 h-3 mr-1" /> {audit.findings.length} Issues
                     </div>
                   )}
                   <button 
                     onClick={() => setSelectedAudit(audit)}
                     className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-800"
                   >
                     Review <ArrowRight className="w-4 h-4 ml-1" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {selectedAudit && (
        <AuditReview 
          audit={selectedAudit} 
          onClose={() => setSelectedAudit(null)}
          onProcessed={handleProcess}
        />
      )}
    </div>
  );
};

export default AuditApprovalQueue;
