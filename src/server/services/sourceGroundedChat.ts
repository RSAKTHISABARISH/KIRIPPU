import type { ChatResponse, DocumentRecord } from '../../shared/types';

function findRelevant(document: DocumentRecord, question: string): { text: string; page: number } | null {
  const terms = question.toLowerCase().replace(/[^a-z0-9\u0b80-\u0bff ]/gi, ' ').split(/\s+/).filter((term) => term.length > 2 && !['what', 'when', 'which', 'does', 'this', 'need', 'enna', 'eppo', 'next', 'naan', 'indha', 'document', 'la', 'the', 'are', 'for'].includes(term));
  const candidates = document.pages.map((page) => ({ page: page.page, text: page.text, score: terms.reduce((score, term) => score + (page.text.toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  return candidates[0]?.score ? { text: candidates[0].text, page: candidates[0].page } : null;
}

export function answerFromDocument(document: DocumentRecord, question: string): ChatResponse {
  const lower = question.toLowerCase();
  const relevant = findRelevant(document, question);
  const openActions = document.actions.filter((action) => action.status !== 'completed');
  const nextAction = openActions.find((action) => action.status !== 'blocked') ?? openActions[0];
  if (/deadline|when|eppo|date|due/.test(lower)) {
    const dated = document.actions.filter((action) => action.deadline).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
    if (!dated.length) return { answer: "I couldn't find that information in this document.", grounded: false };
    const action = dated[0];
    return { answer: `${action.title} is due ${action.deadlineLabel}. ${action.deadlineUncertain ? 'The date requires confirmation.' : ''}`, sourcePage: action.sourcePage, sourceExcerpt: action.sourceText, grounded: true };
  }
  if (/next|do|pannanum|should|action|step/.test(lower)) {
    if (!nextAction) return { answer: 'All extracted actions are complete. You are clear for now.', grounded: true };
    return { answer: nextAction.status === 'blocked' ? `${nextAction.title} is waiting on a prerequisite. Start with ${document.actions.find((action) => action.id === nextAction.dependsOn[0])?.title ?? 'the first incomplete prerequisite'}.` : `Next, ${nextAction.title.toLowerCase()}. ${nextAction.description}`, sourcePage: nextAction.sourcePage, sourceExcerpt: nextAction.sourceText, grounded: true };
  }
  if (/document|documents|proof|required|venum|vechikanum|submit|submit panna/.test(lower)) {
    const docs = [...new Set(document.actions.flatMap((action) => action.requiredDocuments))];
    if (!docs.length && !relevant) return { answer: "I couldn't find that information in this document.", grounded: false };
    return { answer: docs.length ? `Prepare: ${docs.join(', ')}.` : `The document says: ${relevant?.text.slice(0, 240) ?? ''}`, sourcePage: relevant?.page ?? document.actions[0]?.sourcePage, sourceExcerpt: relevant?.text.slice(0, 260) ?? document.actions[0]?.sourceText, grounded: true };
  }
  if (/miss|consequence|aagum|late|risk/.test(lower)) {
    const consequence = document.consequences[0] ?? document.actions.find((action) => action.status !== 'completed')?.consequence;
    if (!consequence) return { answer: "I couldn't find that information in this document.", grounded: false };
    return { answer: consequence, sourcePage: document.actions[0]?.sourcePage, sourceExcerpt: document.actions[0]?.sourceText, grounded: true };
  }
  if (!relevant) return { answer: "I couldn't find that information in this document.", grounded: false };
  return { answer: `I found this in the document: ${relevant.text.slice(0, 260)}`, sourcePage: relevant.page, sourceExcerpt: relevant.text.slice(0, 260), grounded: true };
}
