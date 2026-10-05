import pdfParse from 'pdf-parse';
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
    const pages: Array<{ page: number; text: string }> = [];

    // pdf-parse v1.x — pure JavaScript, no native binaries required
    const data = await pdfParse(buffer, {
      // Capture per-page text via the pagerender hook
      pagerender: async (pageData: any): Promise<string> => {
        const textContent = await pageData.getTextContent();
        const pageText: string = textContent.items
          .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
          .join(' ')
          .trim();
        pages.push({ page: pageData.pageNumber as number, text: pageText });
        return pageText;
      },
    } as any);

    const text = data.text?.trim() ?? '';
    if (!text && pages.every((p) => !p.text)) {
      throw new Error("I couldn't extract readable text from this document. Try uploading a clearer document.");
    }

    const filteredPages = pages.filter((p) => p.text);
    return {
      text: text || filteredPages.map((p) => p.text).join('\n'),
      pageCount: data.numpages || Math.max(1, filteredPages.length),
      pages: filteredPages.length ? filteredPages : [{ page: 1, text: text }],
    };
  }
  throw new Error('Image OCR is not configured in this environment yet. Try a text-based PDF or a clearer document.');
}
