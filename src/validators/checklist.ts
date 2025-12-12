import { z } from 'zod';
import { ChecklistCategory, ChecklistAnswerType } from '@prisma/client';

export const CreateChecklistSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.nativeEnum(ChecklistCategory),
  description: z.string().optional(),
  items: z.array(z.object({
    question: z.string().min(5),
    expected_answer: z.nativeEnum(ChecklistAnswerType),
    scoring_weight: z.number().min(0.5).max(10).default(1.0),
    guidance: z.string().optional(),
    photo_required: z.boolean().default(false)
  })).min(1)
});

export const UpdateChecklistSchema = CreateChecklistSchema.partial();

export const CloneChecklistSchema = z.object({
  newName: z.string().min(3).max(100).optional()
});