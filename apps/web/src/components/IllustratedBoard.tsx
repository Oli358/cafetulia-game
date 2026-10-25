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
  const [celebratingTables, setCelebratingTables] = useState<Record<string, boolean>>({});

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

  return (
    <div
      className="relative w-full h-full min-h-0 flex items-center justify-center p-0 sm:p-1 select-none"
      data-testid="papercraft-board"
    >
      {/* Strictly 1:1 Square Illustrated Board Container */}
      <div
        role="region"
        aria-label="Tablero ilustrado de Cafetulia con 24 mesas, 68 sillas y barra central"
        className={`relative aspect-square w-[min(97vw,calc(100dvh-212px))] h-[min(97vw,calc(100dvh-212px))] sm:w-[min(94vw,calc(100dvh-198px))] sm:h-[min(94vw,calc(100dvh-198px))] rounded-[20px] sm:rounded-[28px] border-2 shadow-[0_10px_28px_rgba(62,47,42,0.18)] overflow-hidden shrink-0 transition-colors ${
          nightMode
            ? 'bg-[#252A38] border-[#C9A227]/50 text-[#FFF9F0]'
            : 'bg-[#E8D5B7] border-[#8B5E3C] text-[#3E2F2A]'
        }`}
      >
        {/* SVG Parquet Wood Floor + Carpet & Table-to-Chair Connection Lines */}
        <svg
          viewBox="0 0 1300 1300"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="parquet-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect
                width="100"
                height="100"
                fill={nightMode ? '#252A38' : '#E8D5B7'}
              />
              <path
                d="M0 50 H100 M50 0 V50 M25 50 V100 M75 50 V100"
                stroke={nightMode ? '#333A4D' : '#D7BE9B'}
                strokeWidth="2"
              />
            </pattern>
            <radialGradient id="floor-vignette" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FFF9F0" stopOpacity={nightMode ? '0.03' : '0.28'} />
              <stop offset="100%" stopColor="#3E2F2A" stopOpacity={nightMode ? '0.35' : '0.12'} />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="1300" height="1300" fill="url(#parquet-pattern)" />
          <rect x="0" y="0" width="1300" height="1300" fill="url(#floor-vignette)" />

          <rect
            x="16"
            y="16"
            width="1268"
            height="1268"
            rx="34"
            fill="none"
            stroke="#C9A227"
            strokeWidth="3"
            strokeDasharray="12 6"
            opacity="0.55"
          />

          {/* Subtle woven paths linking each table to its 4 chairs */}
          {gameState.tables.map((table) => {
            const tx = (table.col + 0.5) * 100;
            const ty = (table.row + 0.5) * 100;
            const meta = NATION_VISUALS[table.nation as NationKey] ?? NATION_VISUALS.fr;
            const isTableFocused = !focusedTableId || focusedTableId === table.id;
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
                  stroke={meta.primaryColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity={
                    !isTableFocused
                      ? '0.08'
                      : nightMode
                        ? '0.42'
                        : '0.3'
                  }
                />
              );
            });
          })}
        </svg>

        {/* INTEGRATED CENTRAL BAR (20 Coasters inside the clear central zone 34.8%..65.2%) */}
        <div
          style={{
            left: '34.8%',
            top: '34.8%',
            width: '30.4%',
            height: '30.4%',
          }}
          className={`absolute z-10 rounded-[16px] sm:rounded-[22px] border-2 p-1 sm:p-2 flex flex-col justify-between shadow-[0_6px_18px_rgba(62,47,42,0.28)] transition-opacity duration-200 ${
            focusedTableId ? 'opacity-45' : 'opacity-100'
          } ${
            nightMode
              ? 'bg-[#35261D] border-[#C9A227] text-[#FFF9F0]'
              : 'bg-[#6E472B] border-[#C9A227] text-[#FFF9F0]'
          }`}
          data-testid="bar-strip"
        >
          {/* Bar Counter Top Header + Sleeping Cat + Action Button */}
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

            {selectedTile && selectedTile.nation !== 'joker' ? (
              <button
                type="button"
                data-testid="send-to-bar-btn"
                onClick={onBarClick}
                className="px-1 py-0.5 rounded bg-[#C96F4A] text-[#FFF9F0] text-[7px] sm:text-[9px] font-bold shadow-xs hover:opacity-95 cursor-pointer whitespace-nowrap"
              >
                Servir ({nextBarValue !== null ? (nextBarValue > 0 ? `+${nextBarValue}` : nextBarValue) : 'llena'})
              </button>
            ) : (
              <span
                className="text-[7px] sm:text-[8px] font-serif text-[#F2C14E] bg-[#3E2F2A]/45 px-1 py-0.2 rounded border border-[#C9A227]/40"
                title="Placa conmemorativa del café"
              >
                O&amp;C
              </span>
            )}
          </div>

          {/* 20 Coasters Grid (5 cols x 4 rows) inside the central bar */}
          <div className="grid grid-cols-5 grid-rows-4 gap-0.5 flex-1 mt-0.5">
            {gameState.barValues.map((val, idx) => {
              const occ = gameState.bar[idx];
              const isNext = idx === nextBarIndex;
              const charProfile = occ ? getCharacterProfile(occ.nation, occ.gender) : null;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isNext || !selectedTile}
                  onClick={onBarClick}
                  title={
                    occ && charProfile
                      ? `Posavasos ${idx + 1}: ${charProfile.name} (${charProfile.countryName})`
                      : `Posavasos ${idx + 1}: ${val > 0 ? `+${val}` : val} monedas`
                  }
                  className={`relative flex items-center justify-center rounded-full border transition-transform select-none ${
                    occ
                      ? 'bg-[#FFF9F0] border-[#3E2F2A] shadow-2xs'
                      : isNext
                        ? 'bg-[#F2C14E] text-[#3E2F2A] border-[#FFF9F0] border font-extrabold scale-105 cursor-pointer'
                        : val > 0
                          ? 'bg-[#3F5E4A]/90 text-[#FFF9F0] border-[#8A9A7B]/40'
                          : 'bg-[#4E2F21] text-[#FDECEB]/90 border-[#A94438]/40'
                  }`}
                >
                  {occ ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <CharacterPortrait nation={occ.nation} gender={occ.gender} size={14} />
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <FlagBadge nation={occ.nation} size={7} />
                      </span>
                    </div>
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

        {/* 24 ILLUSTRATED ROUND TABLES (Larger 8.4% circular tablecloths with central Flag medallion) */}
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
              aria-label={`Mesa de ${meta.name}, ${occCount} de 4 sillas ocupadas`}
              title={`Mesa de ${meta.name} (${occCount}/4 ocupadas)`}
              style={{
                left: `${cellPercent(table.col)}%`,
                top: `${cellPercent(table.row)}%`,
                width: '8.4%',
                height: '8.4%',
                backgroundColor: meta.primaryColor,
                borderColor: isComplete ? '#C9A227' : '#3E2F2A',
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-[0_5px_12px_rgba(62,47,42,0.34)] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 z-20 ${
                isFocused
                  ? 'ring-3 ring-[#C96F4A] scale-115 z-30'
                  : isDimmedByFocus
                    ? 'opacity-30 saturate-50 scale-95'
                    : isComplete && !reducedMotion
                      ? 'ring-2 ring-[#F2C14E] scale-105'
                      : 'hover:scale-106'
              }`}
            >
              {/* Scalloped inner tablecloth ring */}
              <span
                className="pointer-events-none absolute inset-[2.5px] rounded-full border border-dashed opacity-85"
                style={{ borderColor: meta.accentColor }}
              />

              {/* Central Cream Medallion with Country Flag SVG */}
              <div className="relative z-10 w-[64%] h-[64%] rounded-full bg-[#FFF9F0] border border-[#3E2F2A]/45 flex items-center justify-center shadow-2xs">
                <FlagBadge nation={table.nation} size={14} />
              </div>

              {/* 4 occupancy pips */}
              <div className="absolute -bottom-1 flex items-center gap-0.5 bg-[#3E2F2A] px-1 py-0.2 rounded-full">
                {[0, 1, 2, 3].map((pipIdx) => (
                  <span
                    key={pipIdx}
                    className={`w-1 h-1 rounded-full ${
                      pipIdx < occCount ? 'bg-[#F2C14E]' : 'bg-[#FFF9F0]/30'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}

        {/* 68 PHYSICAL ILLUSTRATED CHAIRS (Smaller 5.1% wooden chairs; flags ONLY on shared chairs) */}
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
          const isDimmedByFocus = Boolean(focusedSeatSet && !focusedSeatSet.has(seat.id));

          const isLegalComplete = inspect?.status === 'legal_complete';
          const isLegalPair = inspect?.status === 'legal_needs_pair';
          const isSelectedDraft = inspect?.status === 'selected';
          const isHovered = hoveredSeatId === seat.id;

          const occupantProfile = occupant
            ? getCharacterProfile(occupant.nation, occupant.gender, occupant.jokerNation)
            : null;

          const seatLabel =
            occupant && occupantProfile
              ? `Silla ocupada por ${occupantProfile.name} de ${occupantProfile.countryName}`
              : `Silla ${isShared ? 'compartida' : ''} de ${seat.allowedNations
                  .map((n) => getNationName(n))
                  .join(' y ')}`;

          return (
            <button
              key={seat.id}
              type="button"
              data-seat-id={seat.id}
              data-seat-shared={isShared ? 'true' : 'false'}
              onClick={() => onSeatClick(seat)}
              onMouseEnter={() => setHoveredSeatId(seat.id)}
              onMouseLeave={() => setHoveredSeatId((prev) => (prev === seat.id ? null : prev))}
              aria-label={seatLabel}
              title={
                inspect?.status === 'illegal' && selectedTile
                  ? inspect.whyCannotText
                  : inspect?.previewText || seatLabel
              }
              style={{
                left: `${cellPercent(seat.col)}%`,
                top: `${cellPercent(seat.row)}%`,
                width: '5.1%',
                height: '5.1%',
              }}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-[9px] sm:rounded-[11px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                isDimmedByFocus
                  ? 'z-10 opacity-25 saturate-50 scale-95'
                  : occupant
                    ? isSelectedDraft
                      ? 'z-30 ring-3 ring-[#C9A227] scale-112 shadow-md'
                      : 'z-20 shadow-sm hover:scale-105'
                    : isLegalComplete
                      ? 'z-30 ring-3 ring-[#3F8F6B] bg-[#E6F4EA] scale-115 shadow-[0_0_12px_rgba(63,143,107,0.65)]'
                      : isLegalPair
                        ? 'z-30 ring-3 ring-[#C9A227] bg-[#FEF6E0] scale-112 shadow-[0_0_12px_rgba(201,162,39,0.65)]'
                        : selectedTile
                          ? 'z-10 opacity-65 hover:opacity-100'
                          : 'z-15 hover:scale-105'
              }`}
            >
              {/* Physical Chair Top Wooden Backrest Bar */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-[3px] left-[14%] right-[14%] h-[3.5px] rounded-t-full bg-[#6E472B] border border-[#3E2F2A]"
              />

              {/* Chair Wood Rim + Cushion (Bicolor for Shared Chairs, Country Color for Single Chairs) */}
              <div
                className="relative w-full h-full rounded-[8px] sm:rounded-[10px] border-2 border-[#5C3A21] shadow-inner overflow-hidden flex items-center justify-center"
                style={{
                  background: metaB
                    ? `linear-gradient(135deg, ${metaA.primaryColor} 0%, ${metaA.primaryColor} 50%, ${metaB.primaryColor} 50%, ${metaB.primaryColor} 100%)`
                    : '#7A4E2D',
                }}
              >
                {/* Inner Cushion Pad */}
                <div
                  className={`w-[78%] h-[78%] rounded-[5px] sm:rounded-[7px] flex items-center justify-center overflow-hidden ${
                    occupant
                      ? 'bg-[#FFF9F0] rounded-full'
                      : isLegalComplete
                        ? 'bg-[#E6F4EA]'
                        : isLegalPair
                          ? 'bg-[#FEF6E0]'
                          : isShared
                            ? 'bg-[#FFF9F0]/92'
                            : ''
                  }`}
                  style={
                    !occupant && !isLegalComplete && !isLegalPair && !isShared
                      ? { backgroundColor: metaA.primaryColor }
                      : undefined
                  }
                >
                  {occupant && occupantProfile ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <CharacterPortrait
                        nation={occupant.nation === 'joker' ? 'joker' : occupant.nation}
                        gender={occupant.gender}
                        size={23}
                      />
                    </div>
                  ) : selectedTile && (isLegalComplete || isLegalPair) && isHovered ? (
                    <div className="opacity-70 scale-95 flex items-center justify-center">
                      <CharacterPortrait
                        nation={selectedTile.nation}
                        gender={selectedTile.gender}
                        size={21}
                      />
                    </div>
                  ) : isShared && natB ? (
                    /* Shared chairs keep their two mini flags */
                    <div className="flex items-center justify-center gap-0.5">
                      <FlagBadge nation={natA} size={7} />
                      <FlagBadge nation={natB} size={7} />
                    </div>
                  ) : (
                    /* Normal empty chairs: wood + country color cushion + subtle upholstery button, NO flag */
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full border border-[#3E2F2A]/35 shadow-2xs"
                      style={{ backgroundColor: metaA.accentColor }}
                    />
                  )}
                </div>
              </div>

              {/* Seated Character Name & Flag Pill */}
              {occupant && occupantProfile && (
                <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-[#FFF9F0] border border-[#3E2F2A]/50 px-1 py-0 rounded-full shadow-2xs whitespace-nowrap">
                  <FlagBadge
                    nation={
                      occupant.nation === 'joker'
                        ? (occupant.jokerNation ?? 'joker')
                        : occupant.nation
                    }
                    size={7}
                  />
                  <span className="text-[6px] sm:text-[8px] font-bold text-[#3E2F2A] leading-tight">
                    {occupantProfile.name}
                  </span>
                </div>
              )}

              {/* Predicted Points Floating Pill on Legal Chairs */}
              {!occupant && selectedTile && (isLegalComplete || isLegalPair) && (
                <span
                  className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-30 px-1 py-0 rounded-full text-[7px] sm:text-[9px] font-mono font-extrabold tabular-nums shadow-xs whitespace-nowrap ${
                    isLegalComplete
                      ? 'bg-[#3F5E4A] text-[#FFF9F0] border border-[#FFF9F0]'
                      : 'bg-[#C9A227] text-[#3E2F2A] border border-[#3E2F2A]'
                  }`}
                >
                  {isLegalComplete ? `+${inspect.pointsDelta}` : 'Pareja'}
                </span>
              )}
            </button>
          );
        })}

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
                className="text-[#FFF9F0]/70 hover:text-[#FFF9F0] font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* FOCUSED TABLE FLOATING POPOVER */}
        {focusedTable && (
          <div
            data-testid="table-detail-panel"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-[#FFF9F0] text-[#3E2F2A] rounded-2xl px-3 py-2 border-2 border-[#8B5E3C] shadow-lg flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FlagBadge nation={focusedTable.nation} size={22} />
              <div className="truncate">
                <span className="font-serif font-bold text-sm block leading-none">
                  Mesa de {getNationName(focusedTable.nation)}
                </span>
                <span className="text-[11px] text-[#6F5A4E]">
                  {
                    focusedTable.seatIds.filter(
                      (sid) => gameState.seats.find((s) => s.id === sid)?.occupant !== null,
                    ).length
                  }
                  /4 invitados · Doble puntuación si es mononacional
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
