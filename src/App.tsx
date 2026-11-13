import React, { useState, useEffect } from 'react';
import { PixelScene } from './components/PixelScene';
import { GroupView } from './views/GroupView';
import { MuralView } from './views/MuralView';
import { AppState } from './types';
import { realtimeClient, initialAppState } from './api';

export default function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [currentView, setCurrentView] = useState<'home' | 'group' | 'mural'>('home');
  const [preselectedGroupId, setPreselectedGroupId] = useState<string | null>(null);

  // Subscribe to realtime state updates
  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe((state) => {
      setAppState(state);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL route inspection (e.g. /mural or #mural, ?group=3)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);

      if (path === '/mural' || hash === '#mural' || search.get('view') === 'mural') {
        setCurrentView('mural');
      } else if (search.has('group') || hash.startsWith('#group-')) {
        const gId = search.get('group') || hash.replace('#group-', '');
        setPreselectedGroupId(gId);
        setCurrentView('group');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateTo = (view: 'home' | 'group' | 'mural') => {
    setCurrentView(view);
    if (view === 'mural') {
      window.history.pushState(null, '', '#mural');
    } else if (view === 'group') {
      window.history.pushState(null, '', '#group');
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 font-pixel-body">
      {currentView === 'home' && (
        <PixelScene
          onEnterGroup={() => navigateTo('group')}
          onOpenMural={() => navigateTo('mural')}
          totalStudentsConnected={appState.round.totalStudentsConnected}
        />
      )}

      {currentView === 'group' && (
        <GroupView
          initialGroupId={preselectedGroupId}
          groups={appState.groups}
          timerSecondsLeft={appState.round.timerSecondsLeft}
          isLocked={appState.round.isLocked}
          onBackToHome={() => navigateTo('home')}
          onOpenMural={() => navigateTo('mural')}
        />
      )}

      {currentView === 'mural' && (
        <MuralView
          groups={appState.groups}
          timerSecondsLeft={appState.round.timerSecondsLeft}
          isRunning={appState.round.isRunning}
          isLocked={appState.round.isLocked}
          totalStudentsConnected={appState.round.totalStudentsConnected}
          onBackToHome={() => navigateTo('home')}
        />
      )}
    </div>
  );
}
