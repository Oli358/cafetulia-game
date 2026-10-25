import React, { useEffect, useState } from 'react';
import { decomposeCoins } from '@cafetulia/ui';

export function CoinChip({
  denomination,
  size = 18,
  isNegative = false,
}: {
  denomination: 10 | 5 | 1;
  size?: number;
  isNegative?: boolean;
}): React.ReactElement {
  const fill = isNegative
    ? '#A94438'
    : denomination === 10
      ? '#C9A227'
      : denomination === 5
        ? '#C96F4A'
        : '#B9855A';

  const innerRing = isNegative
    ? '#FDECEB'
    : denomination === 10
      ? '#FEF6E0'
      : denomination === 5
        ? '#FFF9F0'
        : '#F7EEDF';

  const textCol =
    isNegative || denomination === 5 || denomination === 1 ? '#FFF9F0' : '#3E2F2A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-hidden="true"
      className="inline-block shrink-0 select-none drop-shadow-[0_1px_2px_rgba(62,47,42,0.28)]"
    >
      <circle cx="14" cy="14" r="12.5" fill={fill} stroke="#3E2F2A" strokeWidth="2" />
      <circle
        cx="14"
        cy="14"
        r="9.5"
        fill="none"
        stroke={innerRing}
        strokeWidth="1.2"
        strokeDasharray={denomination === 10 ? '2.5 1.5' : undefined}
      />
      <text
        x="14"
        y="18"
        textAnchor="middle"
        fill={textCol}
        fontSize={denomination === 10 ? '10' : '11'}
        fontWeight="800"
        fontFamily="monospace"
      >
        {denomination}
      </text>
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

  useEffect(() => {
    if (value === displayed) return;
    const direction = value > displayed ? 'up' : 'down';
    setPulse(direction);

    if (reducedMotion) {
      setDisplayed(value);
      const t = setTimeout(() => setPulse(null), 250);
      return () => clearTimeout(t);
    }

    const start = displayed;
    const diff = value - start;
    const duration = Math.min(520, Math.max(200, Math.abs(diff) * 35));
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + diff * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayed(value);
      }
    };

    rafId = requestAnimationFrame(step);
    const clearPulse = setTimeout(() => setPulse(null), duration + 180);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(clearPulse);
    };
  }, [value, displayed, reducedMotion]);

  return (
    <span
      className={`inline-block font-mono font-bold tabular-nums transition-transform duration-150 ${
        pulse === 'up'
          ? 'text-[#3F5E4A] scale-110'
          : pulse === 'down'
            ? 'text-[#A94438] scale-110'
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
  const breakdown = decomposeCoins(score);
  const visibleChips = breakdown.chips.slice(0, compact ? 4 : 7);

  return (
    <div
      data-player-tray={playerId}
      data-testid={`coin-tray-${playerId}`}
      className="inline-flex items-center gap-1.5"
      title={`Bandeja de monedas: ${breakdown.tens} de 10, ${breakdown.fives} de 5 y ${breakdown.ones} de 1`}
    >
      <div className="flex items-center -space-x-1.5">
        {visibleChips.map((denom, idx) => (
          <CoinChip
            key={`${denom}-${idx}`}
            denomination={denom}
            size={compact ? 16 : 20}
            isNegative={breakdown.isNegative}
          />
        ))}
      </div>
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

export function FlyingCoinsLayer({
  flights,
  reducedMotion,
}: {
  flights: CoinFlightEvent[];
  reducedMotion: boolean;
}): React.ReactElement | null {
  const [renderedFlights, setRenderedFlights] = useState<
    Array<{
      id: string;
      chips: Array<10 | 5 | 1>;
      isPenalty: boolean;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      active: boolean;
    }>
  >([]);

  useEffect(() => {
    if (flights.length === 0 || reducedMotion) {
      setRenderedFlights([]);
      return;
    }

    const mapped = flights.map((f) => {
      const srcEl = document.querySelector(f.sourceSelector);
      const dstEl = document.querySelector(f.targetSelector);
      const srcRect = srcEl?.getBoundingClientRect();
      const dstRect = dstEl?.getBoundingClientRect();

      const startX = srcRect ? srcRect.left + srcRect.width / 2 : window.innerWidth / 2;
      const startY = srcRect ? srcRect.top + srcRect.height / 2 : window.innerHeight / 2;
      const endX = dstRect ? dstRect.left + dstRect.width / 2 : window.innerWidth / 2;
      const endY = dstRect ? dstRect.top + dstRect.height / 2 : 36;

      const { chips } = decomposeCoins(Math.abs(f.delta));
      return {
        id: f.id,
        chips: chips.slice(0, 6),
        isPenalty: f.delta < 0,
        startX,
        startY,
        endX,
        endY,
        active: false,
      };
    });

    setRenderedFlights(mapped);

    const raf = requestAnimationFrame(() => {
      setRenderedFlights((prev) => prev.map((item) => ({ ...item, active: true })));
    });

    return () => cancelAnimationFrame(raf);
  }, [flights, reducedMotion]);

  if (renderedFlights.length === 0 || reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
      data-testid="flying-coins-layer"
    >
      {renderedFlights.map((flight) =>
        flight.chips.map((denom, idx) => {
          const offsetAngle = (idx - (flight.chips.length - 1) / 2) * 10;
          const x = flight.active ? flight.endX : flight.startX + offsetAngle;
          const y = flight.active ? flight.endY : flight.startY + idx * 3;
          return (
            <div
              key={`${flight.id}-${idx}`}
              style={{
                transform: `translate3d(${x - 12}px, ${y - 12}px, 0) scale(${
                  flight.active ? 0.92 : 1.15
                })`,
                transition: `transform 620ms cubic-bezier(0.2, 0.9, 0.25, 1) ${idx * 55}ms, opacity 620ms ease ${idx * 55}ms`,
                opacity: flight.active ? 0.95 : 1,
              }}
              className="fixed top-0 left-0"
            >
              <CoinChip denomination={denom} size={24} isNegative={flight.isPenalty} />
            </div>
          );
        }),
      )}
    </div>
  );
}
