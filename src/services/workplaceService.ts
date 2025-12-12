import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Workplace } from '../../types';
import { WORKPLACES } from '../constants';

export const workplaceService = {
  getAll: async (): Promise<Workplace[]> => {
    try {
      return await apiClient.get<Workplace[]>(ENDPOINTS.WORKPLACES.BASE);
    } catch (e) {
      console.warn("Using mock workplaces");
      return WORKPLACES;
    }
  },

  update: async (id: string, updates: Partial<Workplace>): Promise<Workplace> => {
    try {
      return await apiClient.put<Workplace>(`${ENDPOINTS.WORKPLACES.BASE}/${id}`, updates);
    } catch (e) {
      console.warn("Mock update workplace");
      const wp = WORKPLACES.find(w => w.id === id);
      if (!wp) throw new Error("Workplace not found");
      return { ...wp, ...updates };
    }
  },

  create: async (data: Omit<Workplace, 'id' | 'redTags' | 'activeTrainingModules'>): Promise<Workplace> => {
    // In real app: POST /api/workplaces
    const newWp: Workplace = {
      ...data,
      id: `wp-${Date.now()}`,
      redTags: 0,
      activeTrainingModules: 0,
      checklist: []
    };
    WORKPLACES.push(newWp); // Update mock
    return newWp;
  }
};
