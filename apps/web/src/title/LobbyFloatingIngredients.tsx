import React from 'react';

type Shape = 'bean' | 'flower' | 'chocolate' | 'cinnamon' | 'orange';
type Layer = 'far' | 'mid' | 'near';

type Piece = {
  shape: Shape;
  layer: Layer;
  left: string;
  top: string;
  size: number;
  opacity: number;
  blur: number;
  delay: number;
  duration: number;
  rotate: number;
};

const pieces: Piece[] = [
  // Far layer: big, soft silhouettes behind everything
  {
    shape: 'bean',
    layer: 'far',
    left: '6%',
    top: '12%',
    size: 120,
    opacity: 0.2,
    blur: 9,
    delay: -3,
    duration: 24,
    rotate: -20,
  },
  {
    shape: 'flower',
    layer: 'far',
    left: '78%',
    top: '8%',
    size: 140,
    opacity: 0.22,
    blur: 10,
    delay: -11,
    duration: 28,
    rotate: 14,
  },
  {
    shape: 'chocolate',
    layer: 'far',
    left: '84%',
    top: '72%',
    size: 150,
    opacity: 0.18,
    blur: 11,
    delay: -7,
    duration: 26,
    rotate: -28,
  },
  {
    shape: 'orange',
    layer: 'far',
    left: '8%',
    top: '78%',
    size: 160,
    opacity: 0.16,
    blur: 12,
    delay: -15,
    duration: 30,
    rotate: 9,
  },
  {
    shape: 'cinnamon',
    layer: 'far',
    left: '38%',
    top: '4%',
    size: 130,
    opacity: 0.14,
    blur: 10,
    delay: -5,
    duration: 27,
    rotate: 24,
  },
  {
    shape: 'bean',
    layer: 'far',
    left: '58%',
    top: '88%',
    size: 110,
    opacity: 0.17,
    blur: 9,
    delay: -19,
    duration: 25,
    rotate: 38,
  },

  // Mid layer: readable shapes in the margins and behind the translucent panel
  {
    shape: 'cinnamon',
    layer: 'mid',
    left: '2%',
    top: '36%',
    size: 70,
    opacity: 0.34,
    blur: 4,
    delay: -4,
    duration: 17,
    rotate: 21,
  },
  {
    shape: 'flower',
    layer: 'mid',
    left: '17%',
    top: '64%',
    size: 58,
    opacity: 0.35,
    blur: 4,
    delay: -9,
    duration: 19,
    rotate: -12,
  },
  {
    shape: 'bean',
    layer: 'mid',
    left: '3%',
    top: '86%',
    size: 44,
    opacity: 0.38,
    blur: 3,
    delay: -2,
    duration: 14,
    rotate: 17,
  },
  {
    shape: 'chocolate',
    layer: 'mid',
    left: '86%',
    top: '28%',
    size: 62,
    opacity: 0.32,
    blur: 5,
    delay: -13,
    duration: 21,
    rotate: -21,
  },
  {
    shape: 'orange',
    layer: 'mid',
    left: '92%',
    top: '52%',
    size: 76,
    opacity: 0.3,
    blur: 4,
    delay: -6,
    duration: 18,
    rotate: 11,
  },
  {
    shape: 'flower',
    layer: 'mid',
    left: '73%',
    top: '84%',
    size: 66,
    opacity: 0.33,
    blur: 4,
    delay: -16,
    duration: 20,
    rotate: 27,
  },
  {
    shape: 'bean',
    layer: 'mid',
    left: '29%',
    top: '93%',
    size: 52,
    opacity: 0.3,
    blur: 3,
    delay: -8,
    duration: 16,
    rotate: -34,
  },
  {
    shape: 'cinnamon',
    layer: 'mid',
    left: '63%',
    top: '6%',
    size: 54,
    opacity: 0.26,
    blur: 4,
    delay: -12,
    duration: 22,
    rotate: -9,
  },
  {
    shape: 'chocolate',
    layer: 'mid',
    left: '34%',
    top: '34%',
    size: 84,
    opacity: 0.13,
    blur: 6,
    delay: -18,
    duration: 23,
    rotate: 16,
  },
  {
    shape: 'flower',
    layer: 'mid',
    left: '56%',
    top: '52%',
    size: 70,
    opacity: 0.12,
    blur: 6,
    delay: -1,
    duration: 24,
    rotate: -18,
  },

  // Near layer: small, sharper accents that feel close to the camera
  {
    shape: 'bean',
    layer: 'near',
    left: '5%',
    top: '22%',
    size: 34,
    opacity: 0.58,
    blur: 1,
    delay: -2,
    duration: 11,
    rotate: -14,
  },
  {
    shape: 'flower',
    layer: 'near',
    left: '90%',
    top: '38%',
    size: 40,
    opacity: 0.52,
    blur: 1.5,
    delay: -7,
    duration: 13,
    rotate: 8,
  },
  {
    shape: 'chocolate',
    layer: 'near',
    left: '15%',
    top: '90%',
    size: 36,
    opacity: 0.46,
    blur: 1,
    delay: -5,
    duration: 12,
    rotate: 24,
  },
  {
    shape: 'cinnamon',
    layer: 'near',
    left: '78%',
    top: '16%',
    size: 42,
    opacity: 0.42,
    blur: 1.5,
    delay: -10,
    duration: 15,
    rotate: -22,
  },
  {
    shape: 'orange',
    layer: 'near',
    left: '95%',
    top: '82%',
    size: 46,
    opacity: 0.4,
    blur: 1.5,
    delay: -4,
    duration: 14,
    rotate: 12,
  },
  {
    shape: 'bean',
    layer: 'near',
    left: '42%',
    top: '7%',
    size: 28,
    opacity: 0.36,
    blur: 1,
    delay: -12,
    duration: 12,
    rotate: 31,
  },
];

const layerClass: Record<Layer, string> = {
  far: 'hidden sm:block',
  mid: 'block',
  near: 'block',
};

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
          key={`${piece.layer}-${index}`}
          className={`lobby-ingredient absolute ${layerClass[piece.layer]}`}
          style={{
            left: piece.left,
            top: piece.top,
            width: piece.size,
            height: piece.size,
            opacity: piece.opacity,
            filter: `blur(${piece.blur}px) drop-shadow(0 10px 18px rgba(35, 23, 18, 0.18))`,
            ['--lobby-rotate' as string]: `${piece.rotate}deg`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            zIndex: piece.layer === 'far' ? 1 : piece.layer === 'mid' ? 2 : 3,
          }}
        >
          <ShapeSvg shape={piece.shape} />
        </div>
      ))}
    </div>
  );
}
