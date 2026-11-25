import React from 'react';
import { useGameStore } from '../store/gameStore';
import { getPlayerFlair, hasFounderDuo } from '../utils/playerFlair';

const HEARTS = [
  { left: '2%', delay: '0s', duration: '3.1s', size: '9px' },
  { left: '18%', delay: '0.8s', duration: '3.5s', size: '7px' },
  { left: '36%', delay: '1.6s', duration: '3s', size: '8px' },
  { left: '54%', delay: '0.4s', duration: '3.3s', size: '9px' },
  { left: '72%', delay: '2.1s', duration: '2.9s', size: '7px' },
  { left: '90%', delay: '1.2s', duration: '3.4s', size: '8px' },
] as const;

export function PlayerName({
  nickname,
  className = '',
  showAura = true,
}: {
  nickname: string;
  className?: string;
  showAura?: boolean;
}): React.ReactElement {
  const duoActive = useGameStore((state) =>
    showAura ? hasFounderDuo(state.snapshot?.members ?? []) : false,
  );
  const flair = getPlayerFlair(nickname);

  if (!flair.founder) {
    return <span className={className}>{nickname}</span>;
  }

  return (
    <span
      className={`cafe-player-name cafe-player-name--founder ${
        duoActive ? 'cafe-player-name--duo' : ''
      } ${className}`.trim()}
      data-founder={flair.groups.join(' ')}
      data-duo={duoActive ? 'true' : undefined}
    >
      <span className="cafe-player-name__text">{nickname}</span>
      {duoActive && (
        <span className="cafe-player-name__hearts" aria-hidden="true">
          {HEARTS.map((heart) => (
            <span
              key={`${heart.left}-${heart.delay}`}
              className="cafe-player-name__heart"
              style={{
                left: heart.left,
                animationDelay: heart.delay,
                animationDuration: heart.duration,
                fontSize: heart.size,
              }}
            >
              ♥
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
