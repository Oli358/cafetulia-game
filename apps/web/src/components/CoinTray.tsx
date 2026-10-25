import React, { useEffect, useRef, useState } from 'react';
import { COIN_DENOMINATION_STYLES, decomposeCoins } from '@cafetulia/ui';

export function CoinChip({
  denomination,
  size = 20,
  isNegative = false,
}: {
  denomination: 10 | 5 | 1;
  size?: number;
  isNegative?: boolean;
}): React.ReactElement {
  // P0.2: 1 = NEGRA (#1F1F1F), 5 = ROJA (#B3261E), 10 = AZUL (#1E4E8C), always cream text (#FFF9F0).
  // When negative, keep the denomination color and add a red subtraction border/badge.
  const style = COIN_DENOMINATION_STYLES[denomination];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      data-denomination={denomination}
      data-negative={isNegative ? 'true' : 'false'}
      aria-label={`${style.label}${isNegative ? ' (resta)' : ''}`}
      className="inline-block shrink-0 select-none drop-shadow-[0_1px_2px_rgba(31,31,31,0.35)]"
    >
      <circle
        cx="14"
        cy="14"
        r="12.5"
        fill={style.fill}
        stroke={isNegative ? '#E53935' : '#FFF9F0'}
        strokeWidth={isNegative ? '2.4' : '1.6'}
      />
      <circle
        cx="14"
        cy="14"
        r="9.6"
        fill="none"
        stroke={style.ring}
        strokeWidth="1.1"
        strokeDasharray={denomination === 10 ? '2.5 1.5' : undefined}
      />
      <text
        x="14"
        y="18"
        textAnchor="middle"
        fill={style.text}
        fontSize={denomination === 10 ? '10' : '11'}
        fontWeight="800"
        fontFamily="monospace"
      >
        {denomination}
      </text>
      {isNegative && (
        <g transform="translate(21, 6)">
          <circle cx="0" cy="0" r="4.5" fill="#B3261E" stroke="#FFF9F0" strokeWidth="1.1" />
          <line x1="-2.3" y1="0" x2="2.3" y2="0" stroke="#FFF9F0" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

export function AnimatedScore({
  value,
  reducedMotion = false,
  className = '',
}: {
  value: number;
  reducedMotion?: boolean;
  className?: string;
}): React.ReactElement {
  const [displayed, setDisplayed] = useState(value);
  const [pulse, setPulse] = useState<'up' | 'down' | null>(null);
  // P0.4: Use a ref for the previous value and depend only on [value, reducedMotion]
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    if (value === start) {
      setDisplayed(value);
      return;
    }

    const direction = value > start ? 'up' : 'down';
    setPulse(direction);

    if (reducedMotion) {
      prevValueRef.current = value;
      setDisplayed(value);
      const t = setTimeout(() => setPulse(null), 220);
      return () => clearTimeout(t);
    }

    const diff = value - start;
    const duration = Math.min(480, Math.max(180, Math.abs(diff) * 28));
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + diff * eased);
      setDisplayed(current);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = value;
        setDisplayed(value);
      }
    };

    rafId = requestAnimationFrame(step);
    const clearPulse = setTimeout(() => {
      prevValueRef.current = value;
      setPulse(null);
    }, duration + 140);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(clearPulse);
      prevValueRef.current = value;
    };
  }, [value, reducedMotion]);

  return (
    <span
      className={`inline-block font-mono font-bold tabular-nums transition-transform duration-150 ${
        pulse === 'up'
          ? 'text-[#3F5E4A] scale-110'
          : pulse === 'down'
            ? 'text-[#B3261E] scale-110'
            : ''
      } ${className}`}
    >
      {displayed}
    </span>
  );
}

export function CoinTray({
  score,
  playerId,
  compact = false,
  reducedMotion = false,
}: {
  score: number;
  playerId: string;
  compact?: boolean;
  reducedMotion?: boolean;
}): React.ReactElement {
  // P0.3: Exact coin representation (stacks with ×count; 0 coins when score === 0)
  const breakdown = decomposeCoins(score);

  return (
    <div
      data-player-tray={playerId}
      data-testid={`coin-tray-${playerId}`}
      className="inline-flex items-center gap-1"
      title={
        score === 0
          ? 'Saldo: 0 puntos (sin monedas)'
          : `Bandeja de monedas (${score < 0 ? 'resta ' : ''}${Math.abs(score)} pts): ${breakdown.tens}×10, ${breakdown.fives}×5, ${breakdown.ones}×1`
      }
    >
      {breakdown.stacks.length > 0 && (
        <div
          className="inline-flex items-center gap-1"
          data-testid={`coin-stacks-${playerId}`}
        >
          {breakdown.stacks.map((stack) => (
            <span
              key={stack.denomination}
              className="inline-flex items-center gap-0.5 bg-[#FFF9F0]/90 px-1 py-0.2 rounded-full border border-[#3E2F2A]/15"
            >
              <CoinChip
                denomination={stack.denomination}
                size={compact ? 15 : 18}
                isNegative={breakdown.isNegative}
              />
              {stack.count > 1 && (
                <span className="font-mono font-extrabold text-[9px] sm:text-[10px] text-[#3E2F2A] tabular-nums leading-none">
                  ×{stack.count}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
      <span className="inline-flex items-baseline gap-0.5">
        <AnimatedScore
          value={score}
          reducedMotion={reducedMotion}
          className={compact ? 'text-xs sm:text-sm' : 'text-base'}
        />
        <span className="text-[10px] text-[#6F5A4E] font-semibold">pts</span>
      </span>
    </div>
  );
}

export type CoinFlightEvent = {
  id: string;
  playerId: string;
  delta: number;
  sourceSelector: string;
  targetSelector: string;
};

type FlyingCoinItem = {
  key: string;
  denomination: 10 | 5 | 1;
  isPenalty: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delayMs: number;
};

function CoinFlipParticle({ item }: { item: FlyingCoinItem }): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const spinRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const spinner = spinRef.current;
    const shadow = shadowRef.current;
    if (!wrapper || !spinner) return;

    const midX = (item.startX + item.endX) / 2;
    const arcLift = Math.min(110, Math.max(55, Math.hypot(item.endX - item.startX, item.endY - item.startY) * 0.28));
    const midY = Math.min(item.startY, item.endY) - arcLift;

    const moveAnim = wrapper.animate(
      [
        {
          transform: `translate3d(${item.startX - 14}px, ${item.startY - 14}px, 0) scale(0.95)`,
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate3d(${midX - 14}px, ${midY - 14}px, 0) scale(1.24)`,
          opacity: 1,
          offset: 0.46,
        },
        {
          transform: `translate3d(${item.endX - 14}px, ${item.endY - 14}px, 0) scale(0.86)`,
          opacity: 1,
          offset: 0.84,
        },
        {
          transform: `translate3d(${item.endX - 14}px, ${item.endY - 18}px, 0) scale(1.06)`,
          opacity: 0.98,
          offset: 0.93,
        },
        {
          transform: `translate3d(${item.endX - 14}px, ${item.endY - 14}px, 0) scale(0.92)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration: 720,
        delay: item.delayMs,
        easing: 'cubic-bezier(0.22, 0.88, 0.32, 1)',
        fill: 'forwards',
      },
    );

    const flipAnim = spinner.animate(
      [
        { transform: 'perspective(400px) rotateY(0deg) rotateX(18deg)' },
        { transform: 'perspective(400px) rotateY(540deg) rotateX(-14deg)', offset: 0.5 },
        { transform: 'perspective(400px) rotateY(900deg) rotateX(8deg)', offset: 0.85 },
        { transform: 'perspective(400px) rotateY(1080deg) rotateX(0deg)' },
      ],
      {
        duration: 720,
        delay: item.delayMs,
        easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        fill: 'forwards',
      },
    );

    const shadowAnim = shadow?.animate(
      [
        { transform: 'translateY(4px) scale(0.9)', opacity: 0.35 },
        { transform: 'translateY(28px) scale(0.55)', opacity: 0.16, offset: 0.46 },
        { transform: 'translateY(3px) scale(1.05)', opacity: 0.45, offset: 0.85 },
        { transform: 'translateY(4px) scale(0.8)', opacity: 0 },
      ],
      {
        duration: 720,
        delay: item.delayMs,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    return () => {
      moveAnim.cancel();
      flipAnim.cancel();
      shadowAnim?.cancel();
    };
  }, [item]);

  return (
    <div
      ref={wrapperRef}
      style={{
        transform: `translate3d(${item.startX - 14}px, ${item.startY - 14}px, 0)`,
      }}
      className="fixed top-0 left-0 w-7 h-7 pointer-events-none"
    >
      <div
        ref={shadowRef}
        className="absolute inset-x-1 bottom-0 h-2 rounded-full bg-black/35 blur-[1px]"
      />
      <div ref={spinRef} className="relative w-7 h-7 flex items-center justify-center">
        <CoinChip denomination={item.denomination} size={26} isNegative={item.isPenalty} />
      </div>
    </div>
  );
}

export function FlyingCoinsLayer({
  flights,
  reducedMotion,
}: {
  flights: CoinFlightEvent[];
  reducedMotion: boolean;
}): React.ReactElement | null {
  const [items, setItems] = useState<FlyingCoinItem[]>([]);

  useEffect(() => {
    if (flights.length === 0 || reducedMotion) {
      setItems([]);
      return;
    }

    const built: FlyingCoinItem[] = [];
    for (const f of flights) {
      const srcEl = document.querySelector(f.sourceSelector);
      const dstEl = document.querySelector(f.targetSelector);
      const srcRect = srcEl?.getBoundingClientRect();
      const dstRect = dstEl?.getBoundingClientRect();

      const startX = srcRect ? srcRect.left + srcRect.width / 2 : window.innerWidth / 2;
      const startY = srcRect ? srcRect.top + srcRect.height / 2 : window.innerHeight / 2;
      const endX = dstRect ? dstRect.left + dstRect.width / 2 : window.innerWidth / 2;
      const endY = dstRect ? dstRect.top + dstRect.height / 2 : 36;

      const { chips } = decomposeCoins(Math.abs(f.delta));
      const visualChips = chips.slice(0, 8);
      visualChips.forEach((denom, idx) => {
        const spread = (idx - (visualChips.length - 1) / 2) * 9;
        built.push({
          key: `${f.id}-${idx}`,
          denomination: denom,
          isPenalty: f.delta < 0,
          startX: startX + spread,
          startY: startY + (idx % 2) * 4,
          endX: endX + spread * 0.35,
          endY,
          delayMs: idx * 55,
        });
      });
    }

    setItems(built);
  }, [flights, reducedMotion]);

  if (items.length === 0 || reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
      data-testid="flying-coins-layer"
    >
      {items.map((item) => (
        <CoinFlipParticle key={item.key} item={item} />
      ))}
    </div>
  );
}
