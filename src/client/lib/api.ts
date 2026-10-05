import type { ChatResponse, DashboardData, DocumentRecord, GraphData, ActionItem } from '../../shared/types';

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(init?.headers ?? {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Something went wrong.');
  return payload as T;
}

export const api = {
  dashboard: () => request<DashboardData>('/api/dashboard'),
  documents: () => request<{ documents: Array<DocumentRecord & { completion: number }> }>('/api/documents'),
  document: (id: string) => request<{ document: DocumentRecord & { completion: number }; graph: GraphData }>(`/api/documents/${id}`),
  graph: (id: string) => request<GraphData>(`/api/documents/${id}/graph`),
  upload: (file: File) => { const form = new FormData(); form.append('file', file); return request<{ document: DocumentRecord; processing: { mode: string; stages: string[] } }>('/api/documents/upload', { method: 'POST', body: form }); },
  updateAction: (id: string, patch: Partial<Pick<ActionItem, 'status' | 'notes'>>) => request<{ action: ActionItem; documentId: string; completion: number }>(`/api/actions/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  chat: (documentId: string, question: string) => request<ChatResponse>('/api/chat', { method: 'POST', body: JSON.stringify({ documentId, question }) }),
};
