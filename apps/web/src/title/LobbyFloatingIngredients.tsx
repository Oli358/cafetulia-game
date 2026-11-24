import React from 'react';

type Shape = 'bean' | 'flower' | 'chocolate' | 'cinnamon' | 'orange';

const pieces: Array<{
  shape: Shape;
  side: 'left' | 'right';
  top: string;
  offset: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotate: number;
}> = [
  {
    shape: 'bean',
    side: 'left',
    top: '12%',
    offset: '3%',
    size: 30,
    delay: -1.2,
    duration: 10,
    opacity: 0.6,
    rotate: -18,
  },
  {
    shape: 'cinnamon',
    side: 'left',
    top: '38%',
    offset: '1%',
    size: 52,
    delay: -4.5,
    duration: 13,
    opacity: 0.5,
    rotate: 22,
  },
  {
    shape: 'flower',
    side: 'left',
    top: '72%',
    offset: '4%',
    size: 38,
    delay: -2.8,
    duration: 11,
    opacity: 0.7,
    rotate: 8,
  },
  {
    shape: 'orange',
    side: 'left',
    top: '88%',
    offset: '2%',
    size: 46,
    delay: -6.1,
    duration: 14,
    opacity: 0.45,
    rotate: -12,
  },
  {
    shape: 'chocolate',
    side: 'right',
    top: '10%',
    offset: '3%',
    size: 36,
    delay: -3.4,
    duration: 12,
    opacity: 0.55,
    rotate: 15,
  },
  {
    shape: 'flower',
    side: 'right',
    top: '30%',
    offset: '1%',
    size: 42,
    delay: -5.2,
    duration: 15,
    opacity: 0.6,
    rotate: -8,
  },
  {
    shape: 'bean',
    side: 'right',
    top: '58%',
    offset: '4%',
    size: 26,
    delay: -0.8,
    duration: 9,
    opacity: 0.55,
    rotate: 28,
  },
  {
    shape: 'cinnamon',
    side: 'right',
    top: '80%',
    offset: '2%',
    size: 54,
    delay: -7.4,
    duration: 16,
    opacity: 0.45,
    rotate: -24,
  },
  {
    shape: 'bean',
    side: 'left',
    top: '55%',
    offset: '7%',
    size: 20,
    delay: -4.1,
    duration: 12,
    opacity: 0.35,
    rotate: 14,
  },
  {
    shape: 'chocolate',
    side: 'right',
    top: '45%',
    offset: '7%',
    size: 26,
    delay: -2.1,
    duration: 10,
    opacity: 0.35,
    rotate: -18,
  },
];

function ShapeSvg({ shape }: { shape: Shape }): React.ReactElement {
  switch (shape) {
    case 'bean':
      return (
        <svg viewBox="0 0 40 56" className="h-full w-full" aria-hidden="true">
          <ellipse cx="20" cy="28" rx="13" ry="24" fill="#4B2A17" />
          <path
            d="M20 6c-5 11 5 22 0 44"
            stroke="#2A140B"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="15" cy="17" rx="4" ry="7" fill="#7A4B2C" opacity="0.45" />
        </svg>
      );
    case 'flower':
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => {
            const angle = (index / 5) * Math.PI * 2;
            return (
              <ellipse
                key={index}
                cx={32 + Math.cos(angle) * 13}
                cy={32 + Math.sin(angle) * 13}
                rx="9"
                ry="14"
                fill="#FFF8EC"
                stroke="#E8D9C4"
                strokeWidth="0.6"
                transform={`rotate(${(angle * 180) / Math.PI + 90} ${32 + Math.cos(angle) * 13} ${32 + Math.sin(angle) * 13})`}
              />
            );
          })}
          <circle cx="32" cy="32" r="7" fill="#E5B93C" />
        </svg>
      );
    case 'chocolate':
      return (
        <svg viewBox="0 0 56 48" className="h-full w-full" aria-hidden="true">
          <path d="M9 12 27 4l20 9-4 24-19 7-16-9z" fill="#3B2118" />
          <path
            d="M9 12l20 8 18-7M29 20l-1 24"
            stroke="#6A3A2A"
            strokeWidth="1.4"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M14 16l12 5"
            stroke="#8A5138"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
      );
    case 'cinnamon':
      return (
        <svg viewBox="0 0 34 80" className="h-full w-full" aria-hidden="true">
          <rect x="10" y="3" width="14" height="74" rx="6" fill="#8C4A2A" />
          <rect x="13" y="5" width="6" height="70" rx="3" fill="#A65A32" opacity="0.8" />
          <path d="M14 8v62" stroke="#5E2E1B" strokeWidth="1.3" opacity="0.6" />
        </svg>
      );
    case 'orange':
    default:
      return (
        <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden="true">
          <path
            d="M12 56c2-26 15-42 44-46"
            stroke="#D9772E"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 55c3-24 15-39 41-44"
            stroke="#F2A24D"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M17 59c12 4 27-2 32-10"
            stroke="#B8512F"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
      );
  }
}

export function LobbyFloatingIngredients(): React.ReactElement {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {pieces.map((piece, index) => (
        <div
          key={index}
          className="lobby-ingredient absolute"
          style={{
            [piece.side]: piece.offset,
            top: piece.top,
            width: piece.size,
            height: piece.size,
            opacity: piece.opacity,
            ['--lobby-rotate' as string]: `${piece.rotate}deg`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <ShapeSvg shape={piece.shape} />
        </div>
      ))}
    </div>
  );
}
