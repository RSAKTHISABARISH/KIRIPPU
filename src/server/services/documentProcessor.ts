import { randomUUID } from 'node:crypto';
import type { DocumentRecord, ActionItem } from '../../shared/types';
import type { ValidatedAnalysis } from '../validation/documentSchema';
import { analyzeDocument } from './aiAnalyzer';
import { refreshDerivedStatuses } from './dependencyEngine';

export async function processDocument(input: { name: string; safeFilename: string; mimeType: string; size: number; text: string; pageCount: number; pages: Array<{ page: number; text: string }> }): Promise<DocumentRecord> {
  const { analysis, mode } = await analyzeDocument(input.text);
  const id = `doc-${randomUUID().slice(0, 8)}`;
  const actionIds = new Map<string, string>();
  analysis.actions.forEach((item) => actionIds.set(item.title.toLowerCase(), `act-${randomUUID().slice(0, 8)}`));
  const actions: ActionItem[] = analysis.actions.map((item) => {
    const id = actionIds.get(item.title.toLowerCase())!;
    const dependsOn = item.dependsOnTitles.map((title) => actionIds.get(title.toLowerCase())).filter((value): value is string => Boolean(value));
    return { id, documentId: 'pending-document-id', title: item.title, description: item.description, deadline: item.deadline, deadlineLabel: item.deadlineLabel, deadlineUncertain: item.deadlineUncertain, priority: item.priority, status: 'pending', dependsOn, requiredDocuments: item.requiredDocuments, consequence: item.consequence, sourceText: item.sourceText || input.pages.find((page) => page.page === item.sourcePage)?.text || input.text.slice(0, 400), sourcePage: item.sourcePage, confidence: item.confidence, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  });
  // Normalize documentId after action creation, keeping the input mapping readable above.
  actions.forEach((item) => { item.documentId = id; });
  const document: DocumentRecord = { id, name: input.name, safeFilename: input.safeFilename, type: analysis.document_type, mimeType: input.mimeType, size: input.size, uploadDate: new Date().toISOString(), status: 'ready', sourceType: 'uploaded', title: analysis.document_title, documentType: analysis.document_type, summary: analysis.summary, confidence: analysis.analysis_confidence, issueDate: analysis.issue_date, pageCount: input.pageCount, pages: input.pages, importantDates: analysis.important_dates, requirements: analysis.requirements, responsibleParties: analysis.responsible_parties, consequences: analysis.consequences, actions, rawText: input.text, analysisMode: mode };
  refreshDerivedStatuses(document);
  return document;
}
