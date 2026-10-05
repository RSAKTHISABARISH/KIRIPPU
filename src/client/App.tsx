import { useCallback, useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { DocumentPage } from './pages/DocumentPage';
import { AppShell } from './components/AppShell';
import type { LanguageId } from './lib/i18n';

export type AppRoute = { name: 'landing' | 'dashboard' | 'library' | 'upload' | 'document'; id?: string };

function parseRoute(): AppRoute {
  const path = window.location.pathname;
  if (path === '/' || path === '') return { name: 'landing' };
  if (path.startsWith('/documents/')) return { name: 'document', id: path.split('/')[2] };
  if (path === '/documents') return { name: 'library' };
  if (path === '/upload') return { name: 'upload' };
  return { name: 'dashboard' };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(parseRoute);
  const [language, setLanguage] = useState<LanguageId>('en');
  const navigate = useCallback((path: string) => { window.history.pushState({}, '', path); setRoute(parseRoute()); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  useEffect(() => { const listener = () => setRoute(parseRoute()); window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener); }, []);
  if (route.name === 'landing') return <LandingPage onNavigate={navigate} />;
  return <AppShell route={route} language={language} onLanguageChange={setLanguage} onNavigate={navigate}>
    {route.name === 'dashboard' && <DashboardPage onNavigate={navigate} />}
    {route.name === 'library' && <LibraryPage onNavigate={navigate} />}
    {route.name === 'upload' && <UploadPage onNavigate={navigate} />}
    {route.name === 'document' && route.id && <DocumentPage documentId={route.id} onNavigate={navigate} />}
  </AppShell>;
}
