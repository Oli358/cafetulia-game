import React, { useRef } from 'react';
import { PRESET_AVATARS, SUBTITLE_MODES, SUBTITLE_STYLES } from '@cafetulia/ui';
import { PlayerAvatar } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import { AnchoredPopover } from './Modals';

function AvatarOption({
  avatar,
  active,
  onSelect,
}: {
  avatar: (typeof PRESET_AVATARS)[number];
  active: boolean;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={avatar.label}
      data-testid={`avatar-option-${avatar.id}`}
      onClick={onSelect}
      title={avatar.label}
      className={`relative flex min-h-[98px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-1.5 transition-all cursor-pointer ${
        active
          ? 'border-[#C96F4A] bg-[#FEF6E0] ring-2 ring-[#C96F4A]/45 shadow-[0_3px_0_#231712] scale-[1.02]'
          : 'border-[#3E2F2A]/10 bg-[#F7EEDF]/75 hover:-translate-y-0.5 hover:border-[#C96F4A]/40 hover:bg-[#F7EEDF]'
      }`}
    >
      <PlayerAvatar avatarId={avatar.id} size={54} />
      <span className="w-full text-center text-[9px] font-bold leading-tight text-[#3E2F2A]">
        {avatar.label}
      </span>
      {active && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#231712] bg-[#C9A227] text-[9px] font-black text-[#231712]"
        >
          ✓
        </span>
      )}
    </button>
  );
}

function AvatarSection({
  title,
  subtitle,
  items,
  activeId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  items: (typeof PRESET_AVATARS)[number][];
  activeId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <section>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3E2F2A]">
          {title}
        </h3>
        <span className="text-[9px] font-semibold text-[#8A7365]">{subtitle}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((avatar) => (
          <AvatarOption
            key={avatar.id}
            avatar={avatar}
            active={activeId === avatar.id}
            onSelect={() => onSelect(avatar.id)}
          />
        ))}
      </div>
    </section>
  );
}

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
          <PlayerAvatar avatarId={avatarId} size={compact ? 32 : 36} />
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
        maxWidth={372}
        preferPlacement="bottom-start"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <div>
              <span className="font-serif font-bold text-sm">Tu identidad en la mesa</span>
              <span className="ml-1.5 text-[9px] font-bold text-[#8A7365]">
                {PRESET_AVATARS.length} opciones
              </span>
            </div>
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

          <AvatarSection
            title="Retratos de tertulia"
            subtitle="Caras nuevas"
            items={PRESET_AVATARS.filter((avatar) => avatar.kind === 'character')}
            activeId={avatarId}
            onSelect={(id) => {
              void setAvatarId(id);
              setActiveOverlay(null);
              btnRef.current?.focus();
            }}
          />

          <AvatarSection
            title="Emblemas de café"
            subtitle="Clásicos"
            items={PRESET_AVATARS.filter((avatar) => avatar.kind === 'icon')}
            activeId={avatarId}
            onSelect={(id) => {
              void setAvatarId(id);
              setActiveOverlay(null);
              btnRef.current?.focus();
            }}
          />

          <p className="text-[10px] font-semibold text-[#6F5A4E]">
            El retrato te acompaña en el lobby, la partida y la postal final.
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
