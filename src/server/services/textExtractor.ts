import { PDFParse } from 'pdf-parse';
import { MAX_UPLOAD_BYTES, SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from '../../shared/constants';

export function safeFilename(name: string): string {
  return name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 120) || 'document';
}

export function validateUpload(file: { originalname: string; mimetype: string; size: number }): string | null {
  const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension) || !SUPPORTED_MIME_TYPES.includes(file.mimetype)) return 'Please upload a PDF, PNG, JPG, or JPEG document.';
  if (file.size > MAX_UPLOAD_BYTES) return 'This file is larger than 4.5 MB. Try a smaller document.';
  if (!file.size) return 'The uploaded file is empty. Try a readable document.';
  return null;
}

export async function extractText(buffer: Buffer, mimetype: string): Promise<{ text: string; pageCount: number; pages: Array<{ page: number; text: string }> }> {
  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = parsed.text.trim();
    if (!text) throw new Error("I couldn't extract readable text from this document. Try uploading a clearer document.");
    const pages = parsed.pages.map((page) => ({ page: page.num, text: page.text.trim() })).filter((page) => page.text);
    return { text, pageCount: Math.max(parsed.total || 1, pages.length), pages: pages.length ? pages : [{ page: 1, text }] };
  }
  throw new Error('Image OCR is not configured in this environment yet. Try a text-based PDF or a clearer document.');
}
