import React, { useEffect, useMemo, useState } from 'react';
import type { GameState, Placement, Seat, Table, Tile } from '@cafetulia/engine';
import { getCharacterProfile, NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import { CharacterPortrait, FlagBadge } from '../art/CharacterPortrait';
import { getNationName, type SeatInspectResult } from '../utils/moveHelper';

export type ChairToastInfo = {
  id: number;
  row: number;
  col: number;
  text: string;
};

type IllustratedBoardProps = {
  gameState: GameState;
  selectedTile: Tile | null;
  draftPlacements: Placement[];
  seatInspections: Record<string, SeatInspectResult>;
  focusedTableId: string | null;
  nightMode: boolean;
  reducedMotion: boolean;
  chairToast: ChairToastInfo | null;
  onDismissToast: () => void;
  onSeatClick: (seat: Seat) => void;
  onTableClick: (table: Table) => void;
  onBarClick: () => void;
};

const GRID_SIZE = 13;

function cellPercent(index: number): number {
  return ((index + 0.5) / GRID_SIZE) * 100;
}

export function IllustratedBoard({
  gameState,
  selectedTile,
  draftPlacements,
  seatInspections,
  focusedTableId,
  nightMode,
  reducedMotion,
  chairToast,
  onDismissToast,
  onSeatClick,
  onTableClick,
  onBarClick,
}: IllustratedBoardProps): React.ReactElement {
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [pointerPct, setPointerPct] = useState<{ x: number; y: number }>({ x: 50, y: 36 });
  const [celebratingTables, setCelebratingTables] = useState<Record<string, boolean>>({});
  const [boardZoomed, setBoardZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const completed: Record<string, boolean> = {};
    for (const t of gameState.tables) {
      const full = t.seatIds.every((sid) => {
        const s = gameState.seats.find((item) => item.id === sid);
        return s?.occupant !== null;
      });
      if (full) completed[t.id] = true;
    }
    setCelebratingTables(completed);
  }, [gameState.tables, gameState.seats]);

  // Auto-release table focus mode after 6.5 seconds so the board stays fluid
  useEffect(() => {
    if (!focusedTableId) return;
    const fTable = gameState.tables.find((t) => t.id === focusedTableId);
    if (!fTable) return;
    const timer = setTimeout(() => {
      onTableClick(fTable);
    }, 6500);
    return () => clearTimeout(timer);
  }, [focusedTableId, gameState.tables, onTableClick]);

  const nextBarIndex = useMemo(
    () => gameState.bar.findIndex((t) => t === null),
    [gameState.bar],
  );
  const nextBarValue =
    nextBarIndex >= 0 ? (gameState.barValues[nextBarIndex] ?? -14) : null;

  const hasAnyLegalTableSeatForSelected = useMemo(() => {
    return Object.values(seatInspections).some(
      (i) => i.status === 'legal_complete' || i.status === 'legal_needs_pair',
    );
  }, [seatInspections]);

  const tableById = useMemo(() => {
    const map = new Map<string, Table>();
    for (const t of gameState.tables) map.set(t.id, t);
    return map;
  }, [gameState.tables]);

  const focusedTable = focusedTableId ? (tableById.get(focusedTableId) ?? null) : null;
  const focusedSeatSet = useMemo(() => {
    if (!focusedTable) return null;
    return new Set(focusedTable.seatIds);
  }, [focusedTable]);

  // Compute detailed occupancy & gender breakdown for focusedTable
  const focusedTableStats = useMemo(() => {
    if (!focusedTable) return null;
    let males = 0;
    let females = 0;
    let sameNation = 0;
    let occupied = 0;
    for (const sid of focusedTable.seatIds) {
      const s = gameState.seats.find((item) => item.id === sid);
      const draft = draftPlacements.find((d) => d.seatId === sid);
      let occ: Tile | null = s?.occupant ?? null;
      if (!occ && draft) {
        const hand = gameState.hands[gameState.turn] ?? [];
        const found = hand.find((t) => t.id === draft.tileId);
        if (found) {
          occ = found.nation === 'joker' ? { ...found, jokerNation: draft.jokerNation } : found;
        }
      }
      if (occ) {
        occupied++;
        if (occ.gender === 'M') males++;
        else females++;
        const effNat = occ.nation === 'joker' ? occ.jokerNation : occ.nation;
        if (effNat === focusedTable.nation) sameNation++;
      }
    }
    const isMono = occupied > 0 && sameNation === occupied;
    const nextPts = occupied < 1 ? 2 : Math.min(4, occupied + 1) * (isMono ? 2 : 1);
    return { occupied, males, females, isMono, nextPts };
  }, [focusedTable, gameState.seats, gameState.hands, gameState.turn, draftPlacements]);

  return (
    <div
      className="relative w-full h-full min-h-0 flex items-center justify-center p-0 sm:p-0.5 select-none"
      data-testid="papercraft-board"
    >
      {/* Strictly 1:1 Square Illustrated Board Container with Wood Frame Bevel */}
      <div
        role="region"
        aria-label="Tablero ilustrado de Cafetulia con 24 mesas, 68 sillas y barra central"
        onPointerMove={(e) => {
          if (reducedMotion) return;
          const rect = e.currentTarget.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
          setPointerPct({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
        }}
        className={`relative aspect-square w-[min(96vw,calc(100dvh-218px))] h-[min(96vw,calc(100dvh-218px))] sm:w-[min(93vw,calc(100dvh-204px))] sm:h-[min(93vw,calc(100dvh-204px))] rounded-[20px] sm:rounded-[26px] border-3 overflow-hidden shrink-0 transition-colors ${
          nightMode
            ? 'bg-[#282D3A] border-[#C9A227]/65 text-[#FFF9F0] shadow-[0_6px_0_#141720,0_16px_32px_rgba(0,0,0,0.45)]'
            : 'bg-[#EFE3CE] border-[#231712] text-[#3E2F2A] shadow-[0_5px_0_#1E130E,0_14px_28px_rgba(35,23,18,0.22),inset_0_2px_0_rgba(255,253,248,0.85)]'
        }`}
      >
        {/* Mobile Zoom / Pan Quick Toggle (Top-Right Corner of Board) */}
        <div className="sm:hidden absolute top-1.5 right-1.5 z-40 flex items-center gap-1 bg-[#FFF9F0]/92 backdrop-blur-xs px-1.5 py-0.5 rounded-xl border border-[#231712]/30 shadow-xs">
          <button
            type="button"
            data-testid="mobile-board-zoom-btn"
            onClick={() => {
              setBoardZoomed((z) => {
                if (z) setPanOffset({ x: 0, y: 0 });
                return !z;
              });
            }}
            className="min-h-[28px] px-2 text-[10px] font-bold text-[#3E2F2A]"
          >
            {boardZoomed ? 'Alejar 1×' : 'Lupa 1.35×'}
          </button>
          {boardZoomed && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Mover tablero a la izquierda"
                onClick={() => setPanOffset((p) => ({ ...p, x: Math.min(16, p.x + 10) }))}
                className="px-1 text-[10px] font-bold"
              >
                ◀
              </button>
              <button
                type="button"
                aria-label="Mover tablero arriba"
                onClick={() => setPanOffset((p) => ({ ...p, y: Math.min(16, p.y + 10) }))}
                className="px-1 text-[10px] font-bold"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Mover tablero abajo"
                onClick={() => setPanOffset((p) => ({ ...p, y: Math.max(-16, p.y - 10) }))}
                className="px-1 text-[10px] font-bold"
              >
                ▼
              </button>
              <button
                type="button"
                aria-label="Mover tablero a la derecha"
                onClick={() => setPanOffset((p) => ({ ...p, x: Math.max(-16, p.x - 10) }))}
                className="px-1 text-[10px] font-bold"
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {/* Zoomable Inner Board Canvas */}
        <div
          style={{
            transform: boardZoomed
              ? `scale(1.34) translate(${panOffset.x}%, ${panOffset.y}%)`
              : undefined,
          }}
          className="relative w-full h-full transition-transform duration-200 origin-center"
        >
          {/* Quiet, Low-Noise SVG Floor + Warm Afternoon Spotlight + Subtle Table-to-Chair Connection Lines */}
          <svg
            viewBox="0 0 1300 1300"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="parquet-pattern" width="130" height="130" patternUnits="userSpaceOnUse">
                <rect
                  width="130"
                  height="130"
                  fill={nightMode ? '#282D3A' : '#EFE3CE'}
                />
                <path
                  d="M0 65 H130 M65 0 V65 M32.5 65 V130 M97.5 65 V130"
                  stroke={nightMode ? '#323846' : '#E5D5BC'}
                  strokeWidth="1.2"
                  opacity="0.5"
                />
              </pattern>
              <radialGradient
                id="floor-vignette"
                cx={`${pointerPct.x}%`}
                cy={`${pointerPct.y}%`}
                r="62%"
              >
                <stop offset="0%" stopColor="#FFFDF8" stopOpacity={nightMode ? '0.06' : '0.44'} />
                <stop offset="55%" stopColor="#FFF9F0" stopOpacity={nightMode ? '0.02' : '0.18'} />
                <stop offset="100%" stopColor="#3E2F2A" stopOpacity={nightMode ? '0.32' : '0.12'} />
              </radialGradient>
            </defs>

            <rect x="0" y="0" width="1300" height="1300" fill="url(#parquet-pattern)" />
            <rect x="0" y="0" width="1300" height="1300" fill="url(#floor-vignette)" />

            {/* Double-ink & brass perimeter inlay */}
            <rect
              x="12"
              y="12"
              width="1276"
              height="1276"
              rx="32"
              fill="none"
              stroke="#8B5E3C"
              strokeWidth="3"
              opacity="0.32"
            />
            <rect
              x="20"
              y="20"
              width="1260"
              height="1260"
              rx="28"
              fill="none"
              stroke="#C9A227"
              strokeWidth="1.8"
              strokeDasharray="10 8"
              opacity="0.45"
            />

            {/* Soft spotlight halo under hovered or focused table */}
            {gameState.tables.map((table) => {
              const isHighlighted =
                focusedTableId === table.id || hoveredTableId === table.id;
              if (!isHighlighted) return null;
              const tx = (table.col + 0.5) * 100;
              const ty = (table.row + 0.5) * 100;
              return (
                <circle
                  key={`halo-${table.id}`}
                  cx={tx}
                  cy={ty}
                  r="105"
                  fill="#FFF8E8"
                  opacity={nightMode ? '0.12' : '0.45'}
                />
              );
            })}

            {/* Subtle connection spokes from each table to its 4 chairs */}
            {gameState.tables.map((table) => {
              const tx = (table.col + 0.5) * 100;
              const ty = (table.row + 0.5) * 100;
              const meta = NATION_VISUALS[table.nation as NationKey] ?? NATION_VISUALS.fr;
              const isTableFocused =
                focusedTableId === table.id || hoveredTableId === table.id;
              const isDimmed = Boolean(focusedTableId && focusedTableId !== table.id);
              return table.seatIds.map((sid) => {
                const seat = gameState.seats.find((s) => s.id === sid);
                if (!seat) return null;
                const sx = (seat.col + 0.5) * 100;
                const sy = (seat.row + 0.5) * 100;
                return (
                  <line
                    key={`${table.id}-${sid}`}
                    x1={tx}
                    y1={ty}
                    x2={sx}
                    y2={sy}
                    stroke={isTableFocused ? '#C96F4A' : meta.primaryColor}
                    strokeWidth={isTableFocused ? '7' : '4.2'}
                    strokeLinecap="round"
                    opacity={
                      isDimmed
                        ? '0.05'
                        : isTableFocused
                          ? '0.72'
                          : nightMode
                            ? '0.26'
                            : '0.2'
                    }
                  />
                );
              });
            })}
          </svg>

          {/* INTEGRATED CENTRAL BAR (20 Coasters inside the clear central zone 35.2%..64.8%) */}
          <div
            style={{
              left: '35.2%',
              top: '35.2%',
              width: '29.6%',
              height: '29.6%',
            }}
            onDragOver={(e) => {
              if (selectedTile && selectedTile.nation !== 'joker') {
                e.preventDefault();
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              onBarClick();
            }}
            className={`absolute z-10 rounded-[16px] sm:rounded-[20px] border-2 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_0_#1E130E,0_10px_20px_rgba(35,23,18,0.28)] transition-opacity duration-200 ${
              focusedTableId ? 'opacity-25' : 'opacity-100'
            } ${
              nightMode
                ? 'bg-[#35261D] border-[#C9A227] text-[#FFF9F0]'
                : 'bg-[#6E472B] border-[#C9A227] text-[#FFF9F0]'
            }`}
            data-testid="bar-strip"
          >
            {/* Bar Counter Top Header + Sleeping Cat + Action Button + O & A Plaque */}
            <div className="flex items-center justify-between gap-0.5 border-b border-[#C9A227]/30 pb-0.5">
              <button
                type="button"
                data-testid="bar-center-button"
                onClick={onBarClick}
                aria-label={`Barra central: siguiente posavasos ${
                  nextBarValue !== null
                    ? nextBarValue > 0
                      ? `+${nextBarValue}`
                      : `${nextBarValue}`
                    : 'llena'
                } monedas`}
                className={`flex items-center gap-1 text-left rounded-md px-1 py-0.5 transition-transform cursor-pointer ${
                  selectedTile && selectedTile.nation !== 'joker' && !hasAnyLegalTableSeatForSelected
                    ? 'bg-[#F2C14E] text-[#3E2F2A] ring-1 ring-[#FFF9F0] scale-105'
                    : 'hover:bg-[#8B5E3C]'
                }`}
              >
                <svg width="13" height="11" viewBox="0 0 24 20" aria-hidden="true" className="shrink-0">
                  <ellipse cx="12" cy="13" rx="9" ry="5.5" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.5" />
                  <circle cx="17" cy="11" r="4" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.5" />
                  <polygon points="15,7 16,4 18,7" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.2" />
                  <polygon points="18,7 20,4 21,8" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.2" />
                </svg>
                <span className="font-serif font-bold text-[8px] sm:text-[11px] leading-none tracking-tight">
                  Barra
                </span>
                <span className="text-[7px] sm:text-[9px] opacity-85 font-mono tabular-nums">
                  {gameState.bar.filter((b) => b !== null).length}/20
                </span>
              </button>

              <div className="flex items-center gap-1">
                {selectedTile && selectedTile.nation !== 'joker' && (
                  <button
                    type="button"
                    data-testid="send-to-bar-btn"
                    onClick={onBarClick}
                    className="px-1 py-0.5 rounded bg-[#C96F4A] text-[#FFF9F0] text-[7px] sm:text-[9px] font-bold shadow-xs hover:opacity-95 cursor-pointer whitespace-nowrap"
                  >
                    Servir ({nextBarValue !== null ? (nextBarValue > 0 ? `+${nextBarValue}` : nextBarValue) : 'llena'})
                  </button>
                )}
                <span
                  data-testid="bar-plaque-oa"
                  className="text-[7px] sm:text-[8px] font-serif text-[#F2C14E] bg-[#3E2F2A]/55 px-1 py-0.2 rounded border border-[#C9A227]/45 whitespace-nowrap"
                  title="Placa conmemorativa del café: O & A"
                >
                  O &amp; A
                </span>
              </div>
            </div>

            {/* 20 Coasters Grid (5 cols x 4 rows) inside the central bar */}
            <div className="grid grid-cols-5 grid-rows-4 gap-0.5 flex-1 mt-0.5">
              {gameState.barValues.map((val, idx) => {
                const occ = gameState.bar[idx];
                const isNext = idx === nextBarIndex;
                const charProfile = occ
                  ? getCharacterProfile(occ.nation, occ.gender, occ.jokerNation, occ.id)
                  : null;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isNext || !selectedTile}
                    onClick={onBarClick}
                    aria-label={
                      occ && charProfile
                        ? `Posavasos ${idx + 1}: ${charProfile.name}, ${charProfile.countryName}, ${
                            occ.gender === 'F' ? 'Mujer' : 'Hombre'
                          }`
                        : `Posavasos ${idx + 1}: ${val > 0 ? `+${val}` : val} monedas`
                    }
                    title={
                      occ && charProfile
                        ? `Posavasos ${idx + 1}: ${charProfile.name} (${charProfile.countryName})`
                        : `Posavasos ${idx + 1}: ${val > 0 ? `+${val}` : val} monedas`
                    }
                    className={`relative flex items-center justify-center rounded-md border transition-transform select-none overflow-hidden ${
                      occ
                        ? 'bg-[#FFF9F0] border-[#231712] shadow-2xs p-0'
                        : isNext
                          ? 'bg-[#F2C14E] text-[#3E2F2A] border-[#FFF9F0] border font-extrabold scale-105 cursor-pointer rounded-full'
                          : val > 0
                            ? 'bg-[#3F5E4A]/90 text-[#FFF9F0] border-[#8A9A7B]/40 rounded-full'
                            : 'bg-[#4E2F21] text-[#FDECEB]/90 border-[#A94438]/40 rounded-full'
                    }`}
                  >
                    {occ ? (
                      <CharacterPortrait
                        nation={occ.nation}
                        gender={occ.gender}
                        tileId={occ.id}
                        size={18}
                      />
                    ) : (
                      <span className="font-mono font-bold text-[7px] sm:text-[9px] tabular-nums leading-none">
                        {val > 0 ? `+${val}` : val}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 24 ILLUSTRATED ROUND TABLES (Hierarchy #1: Cream tablecloth + wood bevel + discreet 14px centered flag badge) */}
          {gameState.tables.map((table) => {
            const meta = NATION_VISUALS[table.nation as NationKey] ?? NATION_VISUALS.fr;
            const occCount = table.seatIds.filter((sid) => {
              const s = gameState.seats.find((item) => item.id === sid);
              return s?.occupant !== null || draftPlacements.some((d) => d.seatId === sid);
            }).length;
            const isFocused = focusedTableId === table.id;
            const isDimmedByFocus = Boolean(focusedTableId && focusedTableId !== table.id);
            const isComplete = celebratingTables[table.id] ?? false;

            return (
              <button
                key={table.id}
                type="button"
                data-table-id={table.id}
                onClick={() => onTableClick(table)}
                onMouseEnter={() => setHoveredTableId(table.id)}
                onMouseLeave={() => setHoveredTableId((prev) => (prev === table.id ? null : prev))}
                aria-label={`Mesa de ${meta.name}, ${occCount} de 4 sillas ocupadas`}
                title={`Mesa de ${meta.name} (${occCount}/4 ocupadas) · Toca para enfocar`}
                style={{
                  left: `${cellPercent(table.col)}%`,
                  top: `${cellPercent(table.row)}%`,
                  width: '8.7%',
                  height: '8.7%',
                  borderColor: isFocused
                    ? '#C96F4A'
                    : isComplete
                      ? '#C9A227'
                      : meta.primaryColor,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF9F0] border-[3px] shadow-[0_3px_0_#1E130E,0_7px_14px_rgba(35,23,18,0.26)] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 z-20 after:content-[''] after:absolute after:-inset-1.5 ${
                  isFocused
                    ? 'ring-4 ring-[#C96F4A]/80 scale-115 z-35'
                    : isDimmedByFocus
                      ? 'opacity-20 saturate-50 scale-95'
                      : isComplete && !reducedMotion
                        ? 'ring-2 ring-[#F2C14E] scale-105'
                        : 'hover:scale-106'
                }`}
              >
                {/* Warm wood/cloth inner rim matching the country table */}
                <span
                  className="pointer-events-none absolute inset-[2.5px] rounded-full border-[1.8px] opacity-80"
                  style={{ borderColor: meta.primaryColor }}
                />

                {/* Subtle inner tablecloth stitch ring */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[6px] rounded-full border border-dashed border-[#8B5E3C]/25"
                />

                {/* Discreet 14px National Flag medallion in the center of the cream tablecloth (P1.1) */}
                <div className="relative z-10 flex items-center justify-center">
                  <FlagBadge nation={table.nation} size={14} />
                </div>

                {/* 4 tiny occupancy dots */}
                <div className="absolute -bottom-1 flex items-center gap-0.5 bg-[#231712] px-1 py-0.2 rounded-full">
                  {[0, 1, 2, 3].map((pipIdx) => (
                    <span
                      key={pipIdx}
                      className={`w-1 h-1 rounded-full ${
                        pipIdx < occCount ? 'bg-[#F2C14E]' : 'bg-[#FFF9F0]/35'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}

          {/* 68 PHYSICAL CHAIRS & SEATED MINI-TILES (Hierarchy: Seated Tile 6.5% > Shared Chair 4.7% > Empty Chair 4.2%) */}
          {gameState.seats.map((seat) => {
            const inspect = seatInspections[seat.id];
            const draftItem = draftPlacements.find((d) => d.seatId === seat.id);
            let occupant: Tile | null = seat.occupant;
            if (!occupant && draftItem) {
              const hand = gameState.hands[gameState.turn] ?? [];
              const found = hand.find((t) => t.id === draftItem.tileId);
              if (found) {
                occupant =
                  found.nation === 'joker'
                    ? { ...found, jokerNation: draftItem.jokerNation }
                    : found;
              }
            }

            const natA = seat.allowedNations[0] ?? 'fr';
            const natB = seat.allowedNations[1];
            const metaA = NATION_VISUALS[natA as NationKey] ?? NATION_VISUALS.fr;
            const metaB = natB ? NATION_VISUALS[natB as NationKey] : null;
            const isShared = Boolean(metaB);
            const isFocusedSeat = Boolean(focusedSeatSet && focusedSeatSet.has(seat.id));
            const isDimmedByFocus = Boolean(focusedSeatSet && !focusedSeatSet.has(seat.id));

            const isLegalComplete = inspect?.status === 'legal_complete';
            const isLegalPair = inspect?.status === 'legal_needs_pair';
            const isSelectedDraft = inspect?.status === 'selected';
            const isHovered = hoveredSeatId === seat.id;

            const occupantProfile = occupant
              ? getCharacterProfile(
                  occupant.nation,
                  occupant.gender,
                  occupant.jokerNation,
                  occupant.id,
                )
              : null;

            const genderFull =
              occupant?.gender === 'F' ? 'Mujer' : occupant?.gender === 'M' ? 'Hombre' : '';

            const seatLabel =
              occupant && occupantProfile
                ? `Silla ocupada por ${occupantProfile.name}, ${occupantProfile.countryName}, ${genderFull}`
                : `Silla ${isShared ? 'compartida' : 'vacía'} de ${seat.allowedNations
                    .map((n) => getNationName(n))
                    .join(' y ')}`;

            // P1.1 Hierarchy: Seated tile is 6.5% with bold square card frame & shadow
            const chairSizePct = occupant
              ? '6.5%'
              : isLegalComplete || isLegalPair
                ? '5.3%'
                : isShared
                  ? '4.7%'
                  : '4.2%';

            return (
              <button
                key={seat.id}
                type="button"
                data-seat-id={seat.id}
                data-seat-shared={isShared ? 'true' : 'false'}
                data-seat-occupied={occupant ? 'true' : 'false'}
                onClick={() => onSeatClick(seat)}
                onMouseEnter={() => setHoveredSeatId(seat.id)}
                onMouseLeave={() => setHoveredSeatId((prev) => (prev === seat.id ? null : prev))}
                onDragOver={(e) => {
                  if (selectedTile && (isLegalComplete || isLegalPair)) {
                    e.preventDefault();
                    setHoveredSeatId(seat.id);
                  }
                }}
                onDragLeave={() => {
                  setHoveredSeatId((prev) => (prev === seat.id ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredSeatId(null);
                  onSeatClick(seat);
                }}
                aria-label={seatLabel}
                title={
                  inspect?.status === 'illegal' && selectedTile
                    ? inspect.whyCannotText
                    : inspect?.previewText || seatLabel
                }
                style={{
                  left: `${cellPercent(seat.col)}%`,
                  top: `${cellPercent(seat.row)}%`,
                  width: chairSizePct,
                  height: chairSizePct,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-[8px] sm:rounded-[10px] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none after:content-[''] after:absolute after:-inset-2 ${
                  isDimmedByFocus
                    ? 'z-10 opacity-18 saturate-50 scale-90'
                    : isFocusedSeat
                      ? 'z-30 ring-2 ring-[#C96F4A] scale-110 shadow-md'
                      : occupant
                        ? isSelectedDraft
                          ? 'z-30 ring-3 ring-[#C9A227] scale-112 shadow-[0_5px_12px_rgba(35,23,18,0.45)]'
                          : 'z-25 shadow-[0_4px_10px_rgba(35,23,18,0.38)] hover:scale-108'
                        : isLegalComplete
                          ? 'z-30 ring-3 ring-[#3F8F6B] bg-[#E6F4EA] scale-115 shadow-[0_0_12px_rgba(63,143,107,0.65)]'
                          : isLegalPair
                            ? 'z-30 ring-3 ring-[#C9A227] bg-[#FEF6E0] scale-112 shadow-[0_0_12px_rgba(201,162,39,0.65)]'
                            : selectedTile
                              ? 'z-10 opacity-60 hover:opacity-100'
                              : 'z-15 hover:scale-106'
                }`}
              >
                {/* Wooden backrest bar on empty/shared chairs */}
                {!occupant && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-[2.5px] left-[16%] right-[16%] h-[3px] rounded-t-full bg-[#6E472B] border border-[#231712]"
                  />
                )}

                {occupant ? (
                  /* SEATED GUEST: Prominent Square Cardboard Tile with Flag Background + Caricature Face (ZERO text labels!) */
                  <div
                    className="w-full h-full flex items-center justify-center rounded-[8px] bg-[#FFF9F0] p-[1px] border border-[#1E130E] shadow-[0_2px_0_#1E130E] overflow-hidden"
                    data-testid="seated-mini-tile"
                  >
                    <CharacterPortrait
                      nation={occupant.nation === 'joker' ? 'joker' : occupant.nation}
                      gender={occupant.gender}
                      tileId={occupant.id}
                      size={48}
                    />
                  </div>
                ) : (
                  /* EMPTY CHAIR: Either Shared (Bicolor + 2 mini flags) or Regular (Neutral wood/cream, 0 flags) */
                  <div
                    className="relative w-full h-full rounded-[7px] sm:rounded-[9px] border-[1.8px] border-[#5C3A21] shadow-inner overflow-hidden flex items-center justify-center"
                    style={{
                      background: metaB
                        ? `linear-gradient(135deg, ${metaA.primaryColor} 0%, ${metaA.primaryColor} 50%, ${metaB.primaryColor} 50%, ${metaB.primaryColor} 100%)`
                        : '#8B5E3C',
                    }}
                  >
                    <div
                      className={`w-[78%] h-[78%] rounded-[4px] sm:rounded-[6px] flex items-center justify-center overflow-hidden ${
                        isLegalComplete
                          ? 'bg-[#E6F4EA]'
                          : isLegalPair
                            ? 'bg-[#FEF6E0]'
                            : isShared
                              ? 'bg-[#FFF9F0]/95'
                              : 'bg-[#F7EEDF]'
                      }`}
                    >
                      {selectedTile && (isLegalComplete || isLegalPair) && isHovered ? (
                        /* Ghost preview of selected guest when hovering a valid chair */
                        <div className="opacity-75 scale-95 flex items-center justify-center">
                          <CharacterPortrait
                            nation={selectedTile.nation}
                            gender={selectedTile.gender}
                            tileId={selectedTile.id}
                            size={30}
                          />
                        </div>
                      ) : isShared && natB ? (
                        /* Shared chairs show two tiny flags */
                        <div className="flex items-center justify-center gap-0.5">
                          <FlagBadge nation={natA} size={7} />
                          <FlagBadge nation={natB} size={7} />
                        </div>
                      ) : (
                        /* Regular empty chair: neutral cream cushion with tiny wood/brass upholstery dot, NO SVG */
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/60 border border-[#5C3A21]/40"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Predicted Points Floating Pill on Legal Chairs */}
                {!occupant && selectedTile && (isLegalComplete || isLegalPair) && (
                  <span
                    className={`pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-35 px-1 py-0 rounded-full text-[7px] sm:text-[9px] font-mono font-extrabold tabular-nums shadow-xs whitespace-nowrap ${
                      isLegalComplete
                        ? 'bg-[#3F5E4A] text-[#FFF9F0] border border-[#FFF9F0]'
                        : 'bg-[#C9A227] text-[#3E2F2A] border border-[#231712]'
                    }`}
                  >
                    {isLegalComplete ? `+${inspect.pointsDelta}` : 'Pareja'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* COMPACT CONTEXTUAL TOAST NEXT TO CLICKED CHAIR ("¿Por qué no puedo?") */}
        {chairToast && (
          <div
            role="status"
            data-testid="chair-toast"
            style={{
              left: `${Math.min(76, Math.max(24, cellPercent(chairToast.col)))}%`,
              top: `${cellPercent(chairToast.row)}%`,
            }}
            className={`absolute -translate-x-1/2 ${
              chairToast.row <= 2 ? 'translate-y-4' : '-translate-y-full -mt-3'
            } z-50 w-52 sm:w-60 bg-[#3E2F2A] text-[#FFF9F0] rounded-2xl p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-[#C9A227] text-[11px] leading-snug`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-[#F2C14E] block text-[10px]">
                  ¿Por qué no puedo?
                </span>
                <p className="mt-0.5 text-[#FFF9F0]/95">{chairToast.text}</p>
              </div>
              <button
                type="button"
                onClick={onDismissToast}
                aria-label="Cerrar aviso"
                className="text-[#FFF9F0]/70 hover:text-[#FFF9F0] font-bold px-1 py-0.5 cursor-pointer inline-flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* FOCUSED TABLE FLOATING PANEL ("Modo enfoque": ocupación, sexo y puntos) */}
        {focusedTable && focusedTableStats && (
          <div
            data-testid="table-detail-panel"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-[#FFF9F0]/95 backdrop-blur-xs text-[#3E2F2A] rounded-2xl px-3 py-2 border-2 border-[#C96F4A] shadow-lg flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FlagBadge nation={focusedTable.nation} size={22} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm leading-none truncate">
                    Mesa de {getNationName(focusedTable.nation)}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FEF6E0] border border-[#C9A227] text-[10px] font-mono font-bold">
                    {focusedTableStats.occupied}/4 sillas
                  </span>
                </div>
                <span className="block text-[10px] sm:text-[11px] text-[#6F5A4E] truncate mt-0.5">
                  Sexo: {focusedTableStats.males}/2 H · {focusedTableStats.females}/2 M · Próximo:{' '}
                  <strong className="text-[#3F5E4A]">+{focusedTableStats.nextPts} pts</strong> (×2 si
                  mononacional)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onTableClick(focusedTable)}
              className="px-2.5 py-1 rounded-lg bg-[#F7EEDF] border border-[#3E2F2A]/20 font-bold text-[11px] shrink-0 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
