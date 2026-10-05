import type { ReactNode } from 'react';
import type { AppRoute } from '../App';
import { copy, type LanguageId } from '../lib/i18n';
import { BrandMark } from './BrandMark';

export function AppShell({ children, route, language, onLanguageChange, onNavigate }: { children: ReactNode; route: AppRoute; language: LanguageId; onLanguageChange: (language: LanguageId) => void; onNavigate: (path: string) => void }) {
  const t = copy[language];
  return <div className="app-shell">
    <aside className="app-rail">
      <button className="rail-brand" onClick={() => onNavigate('/')}><BrandMark compact /></button>
      <nav className="rail-nav" aria-label="Main navigation">
        <button className={route.name === 'dashboard' ? 'rail-link is-active' : 'rail-link'} onClick={() => onNavigate('/app')}><span className="rail-icon">⌂</span><span>{t.dashboard}</span></button>
        <button className={route.name === 'library' || route.name === 'document' ? 'rail-link is-active' : 'rail-link'} onClick={() => onNavigate('/documents')}><span className="rail-icon">▤</span><span>{t.documents}</span></button>
        <button className={route.name === 'upload' ? 'rail-link is-active' : 'rail-link'} onClick={() => onNavigate('/upload')}><span className="rail-icon">＋</span><span>{t.upload}</span></button>
      </nav>
      <div className="rail-footer"><div className="live-dot" /><span>Analysis engine online</span></div>
    </aside>
    <main className="app-main">
      <header className="topbar"><div className="mobile-brand"><BrandMark /></div><div className="topbar-search"><span>⌕</span><input placeholder="Search documents, deadlines, actions…" aria-label="Search" onKeyDown={(event) => { if (event.key === 'Enter') onNavigate(`/documents?search=${encodeURIComponent(event.currentTarget.value)}`); }} /></div><div className="topbar-actions"><div className="language-switcher" role="group" aria-label="Language"><button className={language === 'en' ? 'is-selected' : ''} onClick={() => onLanguageChange('en')}>EN</button><button className={language === 'ta' ? 'is-selected' : ''} onClick={() => onLanguageChange('ta')}>தமிழ்</button><button className={language === 'tanglish' ? 'is-selected' : ''} onClick={() => onLanguageChange('tanglish')}>Tanglish</button></div><button className="avatar" aria-label="Profile">AR</button></div></header>
      <div className="app-content">{children}</div>
    </main>
  </div>;
}
