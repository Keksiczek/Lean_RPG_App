import { prisma } from '../config/database';
import { CreateChecklistSchema } from '../validators/checklist';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors';

type CreateChecklistInput = z.infer<typeof CreateChecklistSchema>;

export const checklistService = {
  create: async (data: CreateChecklistInput, tenantId: string, userId: number) => {
    return prisma.checklistTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        tenantId: tenantId,
        createdBy: userId,
        items: {
          createMany: {
            data: data.items.map((item, idx) => ({
              ...item,
              order: idx
            }))
          }
        }
      },
      include: { items: true }
    });
  },

  getAll: async (tenantId: string, filters: any) => {
    return prisma.checklistTemplate.findMany({
      where: {
        tenantId,
        isActive: true,
        ...filters
      },
      include: {
        items: true,
        creator: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getById: async (id: number, tenantId: string) => {
    const checklist = await prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } }
    });

    if (!checklist || checklist.tenantId !== tenantId) {
      throw new NotFoundError('Checklist template not found');
    }
    return checklist;
  },

  delete: async (id: number, tenantId: string) => {
    // Soft delete
    const checklist = await prisma.checklistTemplate.findUnique({ where: { id } });
    if (!checklist || checklist.tenantId !== tenantId) throw new NotFoundError();

    return prisma.checklistTemplate.update({
      where: { id },
      data: { isActive: false }
    });
  },

  clone: async (id: number, tenantId: string, userId: number, newName?: string) => {
    const original = await checklistService.getById(id, tenantId);
    
    return prisma.checklistTemplate.create({
      data: {
        name: newName || `${original.name} (Copy)`,
        category: original.category,
        description: original.description,
        tenantId,
        createdBy: userId,
        version: 1,
        items: {
          createMany: {
            data: original.items.map(item => ({
              question: item.question,
              expected_answer: item.expected_answer,
              scoring_weight: item.scoring_weight,
              guidance: item.guidance,
              photo_required: item.photo_required,
              order: item.order
            }))
          }
        }
      },
      include: { items: true }
    });
  }
};