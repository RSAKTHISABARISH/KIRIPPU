export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`} aria-label="KURIPPU">
    <span className="brand-mark" aria-hidden="true"><span className="brand-mark__stem" /><span className="brand-mark__top" /><span className="brand-mark__bottom" /></span>
    {!compact && <span className="brand-wordmark">KURIPPU</span>}
  </div>;
}
