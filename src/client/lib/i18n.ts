export const copy = {
  en: { dashboard: 'Dashboard', documents: 'My documents', upload: 'Analyze a document', graph: 'Commitment graph', assistant: 'Document assistant', forgetting: 'What am I forgetting?', next: 'Next best action' },
  ta: { dashboard: 'முகப்பு', documents: 'என் ஆவணங்கள்', upload: 'ஆவணத்தை பகுப்பாய்வு செய்', graph: 'உறுதி வரைபடம்', assistant: 'ஆவண உதவியாளர்', forgetting: 'நான் எதை மறக்கிறேன்?', next: 'அடுத்த செயல்' },
  tanglish: { dashboard: 'Dashboard', documents: 'En documents', upload: 'Document analyze pannunga', graph: 'Commitment graph', assistant: 'Document assistant', forgetting: 'Naan enna marakkiren?', next: 'Next action' },
} as const;
export type LanguageId = keyof typeof copy;
