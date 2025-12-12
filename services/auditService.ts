import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { AuditSession } from '../types';

export const auditService = {
  getAudits: async (): Promise<AuditSession[]> => {
    try {
      return await apiClient.get<AuditSession[]>(ENDPOINTS.AUDITS.BASE);
    } catch (e) {
      console.warn("Using mock audits");
      return mockAudits;
    }
  },

  getAuditById: async (id: string): Promise<AuditSession | null> => {
    try {
      return await apiClient.get<AuditSession>(`${ENDPOINTS.AUDITS.BASE}/${id}`);
    } catch (e) {
      return mockAudits.find(a => a.id === id) || null;
    }
  },

  submitAudit: async (auditData: Partial<AuditSession>): Promise<AuditSession> => {
    return await apiClient.post<AuditSession>(ENDPOINTS.AUDITS.BASE, auditData);
  },

  approveAudit: async (id: string, reviewerId: string, comments: string): Promise<AuditSession> => {
    return await apiClient.put<AuditSession>(`${ENDPOINTS.AUDITS.BASE}/${id}${ENDPOINTS.AUDITS.APPROVE}`, {
      reviewerId,
      comments,
      status: 'approved'
    });
  }
};

const mockAudits: AuditSession[] = [
  {
    id: 'a1',
    checklistId: 't1',
    checklistName: 'Daily 5S Audit',
    workplaceId: 'wp-1',
    workplaceName: 'Assembly Line A',
    auditorId: 'u2',
    auditorName: 'John Operator',
    status: 'completed',
    responses: [],
    photoEvidence: [],
    findings: [],
    overallCompliance: 92,
    riskLevel: 'Green',
    score: 92,
    xpEarned: 150,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'a2',
    checklistId: 't1',
    checklistName: 'Daily 5S Audit',
    workplaceId: 'wp-3',
    workplaceName: 'Warehouse Dispatch',
    auditorId: 'u2',
    auditorName: 'John Operator',
    status: 'approved',
    responses: [],
    photoEvidence: [],
    findings: [
       { itemId: 'i3', severity: 'Major', description: 'Oil leak near forklift area', approved: true }
    ],
    overallCompliance: 65,
    riskLevel: 'Red',
    score: 65,
    xpEarned: 100,
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 172000000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];
