import React, { useRef } from 'react';
import { PRESET_AVATARS, SUBTITLE_MODES, SUBTITLE_STYLES } from '@cafetulia/ui';
import { PlayerAvatar } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import { AnchoredPopover } from './Modals';

export function AvatarDropdownPicker({
  compact = false,
  iconOnly = false,
}: {
  compact?: boolean;
  iconOnly?: boolean;
}): React.ReactElement {
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const open = activeOverlay === 'avatar';

  const currentAvatar =
    PRESET_AVATARS.find((a) => a.id === avatarId) ?? {
      id: 'espresso',
      label: 'Taza Espresso',
      bg: '#C96F4A',
      kind: 'icon' as const,
    };

  return (
    <div className="relative" data-testid="title-avatar-picker">
      <button
        ref={btnRef}
        type="button"
        data-testid="avatar-dropdown-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="avatar-dropdown-popover"
        onClick={() => toggleOverlay('avatar')}
        className={`inline-flex items-center justify-between gap-2 rounded-full bg-[#F7EEDF]/90 border border-[#231712]/20 text-[#3E2F2A] font-bold hover:bg-[#EAD9C0] transition-colors cursor-pointer ${
          compact ? 'min-h-[44px] min-w-[44px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 text-xs sm:text-sm w-full'
        }`}
        aria-label={iconOnly ? `Cambiar avatar (${currentAvatar.label})` : undefined}
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <PlayerAvatar avatarId={avatarId} size={compact ? 26 : 26} />
          {!iconOnly && <span className="truncate max-w-[110px]">{currentAvatar.label}</span>}
        </span>
        {!iconOnly && (
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
            className="text-[#6F5A4E] shrink-0"
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <AnchoredPopover
        open={open}
        onClose={() => setActiveOverlay(null)}
        anchorRef={btnRef}
        id="avatar-dropdown-popover"
        role="radiogroup"
        ariaLabel="Elige tu avatar"
        testId="avatar-dropdown-popover"
        maxWidth={360}
        preferPlacement="bottom-start"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Elige tu avatar (16)</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                btnRef.current?.focus();
              }}
              aria-label="Cerrar selector de avatar"
              className="px-2 py-1 rounded-lg bg-[#F7EEDF] text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer inline-flex items-center justify-center"
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
          <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory">
            {PRESET_AVATARS.map((av) => {
              const active = avatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`avatar-option-${av.id}`}
                  onClick={() => {
                    void setAvatarId(av.id);
                    setActiveOverlay(null);
                    btnRef.current?.focus();
                  }}
                  title={av.label}
                  className={`snap-start shrink-0 w-[78px] min-h-[92px] flex flex-col items-center justify-center p-1.5 rounded-xl border transition-transform cursor-pointer ${
                    active
                      ? 'bg-[#FEF6E0] border-[#C96F4A] ring-2 ring-[#C96F4A] scale-103'
                      : 'bg-[#F7EEDF]/75 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                  }`}
                >
                  <PlayerAvatar avatarId={av.id} size={40} />
                  <span className="text-[9px] font-bold leading-tight w-full text-center mt-1">
                    {av.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] font-semibold text-[#6F5A4E]">
            Desliza para elegir · tu emblema se ve en la mesa
          </p>
        </div>
      </AnchoredPopover>
    </div>
  );
}

export function SubtitlesDropdownPicker({
  compact = false,
}: {
  compact?: boolean;
}): React.ReactElement {
  const subtitleMode = useGameStore((s) => s.subtitleMode);
  const subtitleStyle = useGameStore((s) => s.subtitleStyle);
  const setSubtitleMode = useGameStore((s) => s.setSubtitleMode);
  const setSubtitleStyle = useGameStore((s) => s.setSubtitleStyle);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const open = activeOverlay === 'subtitles';

  const modeMeta = SUBTITLE_MODES.find((m) => m.id === subtitleMode) ?? {
    id: 'key' as const,
    label: 'Solo momentos clave',
    desc: '',
  };
  const styleMeta = SUBTITLE_STYLES.find((st) => st.id === subtitleStyle) ?? {
    id: 'comic' as const,
    label: 'Cómic',
    desc: '',
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        data-testid="subtitles-dropdown-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="subtitles-dropdown-popover"
        onClick={() => toggleOverlay('subtitles')}
        className={`inline-flex items-center justify-between gap-1.5 rounded-full bg-[#F7EEDF]/90 border border-[#231712]/20 text-[#3E2F2A] font-bold hover:bg-[#EAD9C0] transition-colors cursor-pointer ${
          compact ? 'min-h-[32px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 text-xs w-full'
        }`}
      >
        <span className="truncate">
          {compact
            ? `Subtítulos: ${styleMeta.label}`
            : `Subtítulos: ${modeMeta.label} · ${styleMeta.label}`}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
          className="text-[#6F5A4E] shrink-0"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnchoredPopover
        open={open}
        onClose={() => setActiveOverlay(null)}
        anchorRef={btnRef}
        id="subtitles-dropdown-popover"
        role="dialog"
        ariaLabel="Configuración de subtítulos de eventos"
        testId="subtitles-dropdown-popover"
        maxWidth={340}
        preferPlacement="bottom-end"
      >
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Subtítulos de partida</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                btnRef.current?.focus();
              }}
              aria-label="Cerrar opciones de subtítulos"
              className="px-2 py-1 rounded-lg bg-[#F7EEDF] text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer inline-flex items-center justify-center"
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

          <div className="space-y-1">
            <span className="font-bold text-[11px] text-[#6F5A4E] block">Frecuencia</span>
            <div className="grid grid-cols-1 gap-1">
              {SUBTITLE_MODES.map((m) => {
                const active = subtitleMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`subtitle-mode-${m.id}`}
                    onClick={() => setSubtitleMode(m.id)}
                    className={`text-left px-2.5 py-1.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold'
                        : 'bg-[#F7EEDF]/70 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                    }`}
                  >
                    <span>{m.label}</span>
                    {active && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                        className="text-[#3F5E4A] shrink-0"
                      >
                        <path
                          d="M2.2 6.2L4.8 8.8L9.8 3.2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[11px] text-[#6F5A4E] block">Estilo visual</span>
            <div className="grid grid-cols-3 gap-1.5">
              {SUBTITLE_STYLES.map((st) => {
                const active = subtitleStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    data-testid={`subtitle-style-${st.id}`}
                    onClick={() => setSubtitleStyle(st.id)}
                    className={`px-2 py-1.5 rounded-xl border text-center cursor-pointer ${
                      active
                        ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold ring-1 ring-[#C96F4A]'
                        : 'bg-[#F7EEDF]/70 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                    }`}
                  >
                    <span className="block font-bold">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AnchoredPopover>
    </div>
  );
}
