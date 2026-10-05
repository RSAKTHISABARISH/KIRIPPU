import type { ForgettingItem } from '../../shared/types';

const icons = { overdue: '!', blocked: '↳', upcoming: '◷', missing_document: '▧', high_risk: '◆' };
const labels = { overdue: 'Overdue', blocked: 'Blocked', upcoming: 'Coming up', missing_document: 'Missing document', high_risk: 'High risk' };

export function ForgettingPanel({ items, onAction }: { items: ForgettingItem[]; onAction?: (id?: string) => void }) {
  return <section className="forgetting-panel panel"><div className="forgetting-panel__header"><div><span className="eyebrow eyebrow--light">Risk check</span><h2>What am I forgetting?</h2><p>One calm scan across your current commitments.</p></div><span className="risk-count">{items.length} signals</span></div>{items.length ? <div className="forgetting-list">{items.slice(0, 4).map((item, index) => <button className="forgetting-item" key={`${item.kind}-${item.title}-${index}`} onClick={() => onAction?.(item.actionId)}><span className={`forgetting-icon forgetting-icon--${item.kind}`}>{icons[item.kind]}</span><span className="forgetting-copy"><strong>{item.title}</strong><span>{item.detail}</span></span><span className="forgetting-kind">{labels[item.kind]}</span><span className="forgetting-arrow">↗</span></button>)}</div> : <div className="empty-risk"><span>✓</span><div><strong>No loose ends detected.</strong><p>Your current plan is clear.</p></div></div>}<button className="light-button" onClick={() => onAction?.()}>Review all signals ↗</button></section>;
}
