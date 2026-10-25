import React, { useEffect } from 'react';
import { ActiveModalLayer } from './components/Modals';
import {
  FinishedScreen,
  LobbyScreen,
  PlayingScreen,
  TitleScreen,
} from './components/Screens';
import { useGameStore } from './store/gameStore';

export function App(): React.ReactElement {
  const screen = useGameStore((s) => s.screen);
  const activeModal = useGameStore((s) => s.activeModal);
  const highContrast = useGameStore((s) => s.highContrast);
  const largeText = useGameStore((s) => s.largeText);
  const nightMode = useGameStore((s) => s.nightMode);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const pollRoom = useGameStore((s) => s.pollRoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  // Sync body dataset state for E2E & Ultra Mode inspection
  useEffect(() => {
    const mapped =
      screen === 'playing'
        ? 'playing'
        : screen === 'finished'
          ? 'gameover'
          : 'title';
    document.body.dataset.state = mapped;
  }, [screen]);

  // Handle ?autostart=1 and ?room=CODE query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const autostart = params.get('autostart');
    if (roomParam) {
      void joinRoom(roomParam);
    } else if (autostart === '1') {
      void quickStartWithBots(1, 'medium');
    }
  }, [joinRoom, quickStartWithBots]);

  // Poll authoritative room state while in lobby or playing
  useEffect(() => {
    if (screen !== 'lobby' && screen !== 'playing') return;
    const interval = setInterval(() => {
      void pollRoom();
    }, 1500);
    return () => clearInterval(interval);
  }, [screen, pollRoom]);

  // Global keyboard shortcuts (Enter/Space on Title when not focused in input, Escape to close modal)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
        return;
      }

      if (screen === 'title' && !activeModal && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        void quickStartWithBots(1, 'medium');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, activeModal, quickStartWithBots, setActiveModal]);

  return (
    <main
      className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden transition-colors ${
        nightMode
          ? 'bg-[#181C26] text-[#FFF9F0]'
          : highContrast
            ? 'bg-[#FFF9F0] text-[#1A110E]'
            : 'bg-[#F7EEDF] text-[#3E2F2A]'
      } ${largeText ? 'text-lg' : 'text-base'}`}
    >
      {screen === 'title' && <TitleScreen />}
      {screen === 'lobby' && <LobbyScreen />}
      {screen === 'playing' && <PlayingScreen />}
      {screen === 'finished' && <FinishedScreen />}
      <ActiveModalLayer />
    </main>
  );
}

export default App;
