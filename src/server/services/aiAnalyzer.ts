import { analysisSchema, type ValidatedAnalysis } from '../validation/documentSchema';

function cleanJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? raw).trim();
}

function normalizeDate(raw: string): string | null {
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  const match = raw.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (!match) return null;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const date = new Date(Date.UTC(year, Number(match[2]) - 1, Number(match[1])));
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function extractDates(text: string) {
  const dateMatches = text.match(/(?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?)/gi) ?? [];
  return [...new Set(dateMatches)].slice(0, 8).map((raw) => ({ label: 'Important date', raw, normalized: normalizeDate(raw), uncertain: !normalizeDate(raw) }));
}

function sentenceCandidates(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter((line) => line.length > 22);
}

export function localAnalyze(text: string): ValidatedAnalysis {
  const sentences = sentenceCandidates(text);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const actionLines = lines.filter((line) => /\b(submit|upload|sign|complete|send|register|attach|accept|provide|apply|pay|email|fill|prepare|return|confirm)\b/i.test(line));
  const dates = extractDates(text);
  const actions = (actionLines.length ? actionLines : sentences.slice(0, 4)).slice(0, 6).map((line, index) => ({
    title: line.replace(/^[-•*\d.)]+\s*/, '').slice(0, 72),
    description: line,
    deadline: dates[index]?.normalized ?? null,
    deadlineLabel: dates[index]?.raw ?? 'No explicit deadline found',
    deadlineUncertain: dates[index]?.uncertain ?? false,
    priority: index === 0 ? 'critical' as const : index === 1 ? 'high' as const : 'medium' as const,
    dependsOnTitles: index > 0 ? [actionLines[0]?.replace(/^[-•*\d.)]+\s*/, '').slice(0, 72)].filter(Boolean) : [],
    requiredDocuments: /id|proof|certificate|document|resume|photo/i.test(line) ? ['Required document mentioned in source'] : [],
    consequence: /deadline|miss|late|cannot|not submit/i.test(line) ? 'Missing this step may prevent the application from being completed.' : 'Review the source document for the full consequence.',
    sourceText: line,
    sourcePage: 1,
    confidence: 0.62,
  }));
  return analysisSchema.parse({
    document_title: lines[0]?.slice(0, 90) || 'Uploaded document',
    document_type: /offer|internship|employment/i.test(text) ? 'offer_letter' : /scholarship|grant/i.test(text) ? 'scholarship_notice' : 'official_notice',
    summary: sentences.slice(0, 2).join(' ') || 'Text was extracted, but the document did not contain enough context for a richer summary.',
    issue_date: dates[0]?.normalized ?? null,
    important_dates: dates,
    actions: actions.length ? actions : [{
      title: 'Review extracted document', description: 'Read the extracted text and confirm the required next steps.', deadline: null, deadlineLabel: 'Date requires confirmation', deadlineUncertain: true, priority: 'medium', dependsOnTitles: [], requiredDocuments: [], consequence: 'Important obligations may be missed without review.', sourceText: text.slice(0, 500), sourcePage: 1, confidence: 0.48,
    }],
    requirements: lines.filter((line) => /required|must|need|attach|provide/i.test(line)).slice(0, 6),
    responsible_parties: ['Document recipient'],
    consequences: ['Incomplete or late actions may affect the application or offer.'],
    analysis_confidence: 0.62,
  });
}

export async function analyzeDocument(text: string): Promise<{ analysis: ValidatedAnalysis; mode: 'gemini' | 'local-fallback' }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { analysis: localAnalyze(text), mode: 'local-fallback' };
  const prompt = `You are KURIPPU, a source-grounded document-to-action engine. Return only valid JSON matching this shape: {"document_title":"string","document_type":"string","summary":"string","issue_date":"YYYY-MM-DD or null","important_dates":[{"label":"string","raw":"string","normalized":"YYYY-MM-DD or null","uncertain":false,"sourcePage":1}],"actions":[{"title":"string","description":"string","deadline":"YYYY-MM-DD or null","deadlineLabel":"string","deadlineUncertain":false,"priority":"critical|high|medium|low","dependsOnTitles":["string"],"requiredDocuments":["string"],"consequence":"string","sourceText":"verbatim excerpt","sourcePage":1,"confidence":0.0}],"requirements":["string"],"responsible_parties":["string"],"consequences":["string"],"analysis_confidence":0.0}. Never invent dates: mark unknown or relative dates as uncertain. Extract actions, prerequisites, consequences and source excerpts from this document only.\n\nDOCUMENT TEXT:\n${text.slice(0, 30000)}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } }),
    });
    if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Gemini returned no text');
    return { analysis: analysisSchema.parse(JSON.parse(cleanJson(raw))), mode: 'gemini' };
  } catch (error) {
    console.error('AI analysis failed; using validated local fallback.', error);
    return { analysis: localAnalyze(text), mode: 'local-fallback' };
  }
}
