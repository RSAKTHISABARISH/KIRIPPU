import { z } from 'zod';

export const prioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const statusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked', 'overdue']);

export const importantDateSchema = z.object({
  label: z.string().min(1),
  raw: z.string().min(1),
  normalized: z.string().nullable().default(null),
  uncertain: z.boolean().default(false),
  sourcePage: z.number().int().positive().optional(),
});

export const analysisActionSchema = z.object({
  title: z.string().min(2),
  description: z.string().default(''),
  deadline: z.string().nullable().default(null),
  deadlineLabel: z.string().default('No deadline found'),
  deadlineUncertain: z.boolean().default(false),
  priority: prioritySchema.default('medium'),
  dependsOnTitles: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
  consequence: z.string().default('No consequence stated in the document.'),
  sourceText: z.string().default(''),
  sourcePage: z.number().int().positive().default(1),
  confidence: z.number().min(0).max(1).default(0.7),
});

export const analysisSchema = z.object({
  document_title: z.string().min(2),
  document_type: z.string().min(2),
  summary: z.string().min(10),
  issue_date: z.string().nullable().default(null),
  important_dates: z.array(importantDateSchema).default([]),
  actions: z.array(analysisActionSchema).min(1),
  requirements: z.array(z.string()).default([]),
  responsible_parties: z.array(z.string()).default([]),
  consequences: z.array(z.string()).default([]),
  analysis_confidence: z.number().min(0).max(1).default(0.7),
});

export type ValidatedAnalysis = z.infer<typeof analysisSchema>;
