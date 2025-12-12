import { Response } from 'express';
import { AuthRequest } from '../types';
import { checklistService } from '../services/checklistService';
import { CreateChecklistSchema, CloneChecklistSchema } from '../validators/checklist';
import { sendSuccess } from '../utils/responses';

export const createChecklist = async (req: AuthRequest, res: Response) => {
  const validated = CreateChecklistSchema.parse(req.body);
  const checklist = await checklistService.create(
    validated, 
    req.user!.tenantId, 
    req.user!.id
  );
  sendSuccess(res, checklist, 'Checklist created', 201);
};

export const getChecklists = async (req: AuthRequest, res: Response) => {
  const checklists = await checklistService.getAll(req.user!.tenantId, req.query);
  sendSuccess(res, checklists);
};

export const getChecklist = async (req: AuthRequest, res: Response) => {
  const checklist = await checklistService.getById(
    parseInt(req.params.id), 
    req.user!.tenantId
  );
  sendSuccess(res, checklist);
};

export const deleteChecklist = async (req: AuthRequest, res: Response) => {
  await checklistService.delete(parseInt(req.params.id), req.user!.tenantId);
  sendSuccess(res, { success: true }, 'Checklist deleted');
};

export const cloneChecklist = async (req: AuthRequest, res: Response) => {
  const { newName } = CloneChecklistSchema.parse(req.body);
  const checklist = await checklistService.clone(
    parseInt(req.params.id),
    req.user!.tenantId,
    req.user!.id,
    newName
  );
  sendSuccess(res, checklist, 'Checklist cloned', 201);
};