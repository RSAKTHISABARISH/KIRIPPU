import { z } from 'zod';
import { statusSchema } from './documentSchema';

export const actionPatchSchema = z.object({
  status: statusSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const chatRequestSchema = z.object({
  documentId: z.string().min(1),
  question: z.string().min(2).max(1000),
});
