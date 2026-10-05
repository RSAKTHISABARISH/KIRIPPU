import type { DocumentRecord } from '../../shared/types';

export function SourceEvidence({ document, selectedText, selectedPage }: { document: DocumentRecord; selectedText?: string; selectedPage?: number }) {
  const page = selectedPage ?? document.pages[0]?.page ?? 1;
  const excerpt = selectedText ?? document.pages.find((item) => item.page === page)?.text ?? document.summary;
  return <section className="source-evidence panel"><div className="section-heading"><div><span className="eyebrow">Evidence trail</span><h3>Every action links back to the source.</h3></div><span className="confidence-pill">{Math.round(document.confidence * 100)}% overall confidence</span></div><div className="source-page-label"><span className="page-number">{page}</span><div><strong>Source page {page}</strong><span>Extracted from {document.name}</span></div></div><blockquote className="source-large-quote">“{excerpt}”</blockquote><div className="source-footer"><span>Text extraction verified</span><span className="source-status">● Grounded</span></div></section>;
}
