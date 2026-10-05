export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
export const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const SUPPORTED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
export const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ta', label: 'தமிழ்' },
  { id: 'tanglish', label: 'Tanglish' },
] as const;
