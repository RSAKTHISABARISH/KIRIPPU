import type { ActionItem, DocumentRecord } from '../../shared/types';

const documents = new Map<string, DocumentRecord>();

export const db = {
  listDocuments(): DocumentRecord[] {
    return [...documents.values()].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
  },
  getDocument(id: string): DocumentRecord | undefined {
    return documents.get(id);
  },
  saveDocument(document: DocumentRecord): DocumentRecord {
    documents.set(document.id, document);
    return document;
  },
  updateAction(actionId: string, patch: Partial<Pick<ActionItem, 'status' | 'notes'>>): ActionItem | undefined {
    for (const document of documents.values()) {
      const action = document.actions.find((item) => item.id === actionId);
      if (action) {
        Object.assign(action, patch, { updatedAt: new Date().toISOString() });
        return action;
      }
    }
    return undefined;
  },
  findAction(actionId: string): { document: DocumentRecord; action: ActionItem } | undefined {
    for (const document of documents.values()) {
      const action = document.actions.find((item) => item.id === actionId);
      if (action) return { document, action };
    }
    return undefined;
  },
  reset() {
    documents.clear();
  },
};
