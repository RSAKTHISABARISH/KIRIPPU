export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'overdue';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type DocumentStatus = 'ready' | 'processing' | 'error';
export type SourceType = 'uploaded' | 'demo';

export interface ImportantDate {
  label: string;
  raw: string;
  normalized: string | null;
  uncertain: boolean;
  sourcePage?: number;
}

export interface ActionItem {
  id: string;
  documentId: string;
  title: string;
  description: string;
  deadline: string | null;
  deadlineLabel: string;
  deadlineUncertain: boolean;
  priority: Priority;
  status: ActionStatus;
  dependsOn: string[];
  requiredDocuments: string[];
  consequence: string;
  sourceText: string;
  sourcePage: number;
  confidence: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPage {
  page: number;
  text: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  safeFilename: string;
  type: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  status: DocumentStatus;
  sourceType: SourceType;
  title: string;
  documentType: string;
  summary: string;
  confidence: number;
  issueDate: string | null;
  pageCount: number;
  pages: DocumentPage[];
  importantDates: ImportantDate[];
  requirements: string[];
  responsibleParties: string[];
  consequences: string[];
  actions: ActionItem[];
  rawText: string;
  analysisMode: 'gemini' | 'local-fallback' | 'demo';
  error?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  shortLabel: string;
  status: ActionStatus;
  priority: Priority;
  deadline: string | null;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ForgettingItem {
  kind: 'overdue' | 'blocked' | 'upcoming' | 'missing_document' | 'high_risk';
  title: string;
  detail: string;
  actionId?: string;
  priority: Priority;
}

export interface DashboardData {
  metrics: {
    critical: number;
    upcoming: number;
    completed: number;
    overdue: number;
    inProgress: number;
    total: number;
    completion: number;
  };
  urgentActions: ActionItem[];
  forgetting: ForgettingItem[];
  recentDocuments: DocumentRecord[];
  nextAction: ActionItem | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourcePage?: number;
  sourceExcerpt?: string;
  createdAt: string;
}

export interface ChatResponse {
  answer: string;
  sourcePage?: number;
  sourceExcerpt?: string;
  grounded: boolean;
}
