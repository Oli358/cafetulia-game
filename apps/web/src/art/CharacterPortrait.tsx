import React from 'react';
import { getPresetAvatar, NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import type { Gender, Nation } from '@cafetulia/engine';

export type TileNation = Nation | 'joker';

export function FlagBadge({
  nation,
  size = 20,
}: {
  nation: TileNation;
  size?: number;
}): React.ReactElement {
  if (nation === 'joker') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="inline-block shrink-0 rounded-sm shadow-xs"
      >
        <rect
          x="1"
          y="1"
          width="22"
          height="22"
          rx="4"
          fill="#FFF9F0"
          stroke="#3E2F2A"
          strokeWidth="1.8"
        />
        <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#C9A227" />
        <circle cx="12" cy="12" r="4" fill="#A94438" />
      </svg>
    );
  }

  const meta = NATION_VISUALS[nation as NationKey] ?? NATION_VISUALS.fr;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="inline-block shrink-0 rounded-sm shadow-xs"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="4"
        fill={meta.primaryColor}
        stroke="#3E2F2A"
        strokeWidth="1.8"
      />
      {meta.pattern === 'stripes' && (
        <>
          <rect x="8.5" y="2" width="7" height="20" fill={meta.accentColor} />
          <rect x="15.5" y="2" width="6.5" height="20" fill={meta.secondaryColor} />
        </>
      )}
      {meta.pattern === 'checks' && (
        <>
          <rect x="2" y="2" width="10" height="10" fill={meta.secondaryColor} />
          <rect x="12" y="12" width="10" height="10" fill={meta.secondaryColor} />
          <circle cx="12" cy="12" r="3.5" fill={meta.accentColor} />
        </>
      )}
      {meta.pattern === 'dots' && (
        <>
          <rect x="2" y="8" width="20" height="8" fill={meta.secondaryColor} />
          <circle cx="8" cy="12" r="2.5" fill={meta.accentColor} />
          <circle cx="16" cy="12" r="2.5" fill={meta.accentColor} />
        </>
      )}
      {meta.pattern === 'diamonds' && (
        <>
          <polygon points="12,3 21,12 12,21 3,12" fill={meta.secondaryColor} />
          <circle cx="12" cy="12" r="3.5" fill={meta.accentColor} />
        </>
      )}
      {meta.pattern === 'waves' && (
        <>
          <path
            d="M2 9 Q7 5 12 9 T22 9 L22 15 Q17 19 12 15 T2 15 Z"
            fill={meta.secondaryColor}
          />
          <circle cx="12" cy="12" r="3" fill={meta.accentColor} />
        </>
      )}
      {meta.pattern === 'tartans' && (
        <>
          <path d="M2 2 L22 22 M22 2 L2 22" stroke={meta.accentColor} strokeWidth="3.5" />
          <path d="M12 2 L12 22 M2 12 L22 12" stroke={meta.secondaryColor} strokeWidth="3.5" />
        </>
      )}
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="4"
        fill="none"
        stroke="#3E2F2A"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CharacterPortrait({
  nation,
  gender,
  size = 64,
  sipping = false,
}: {
  nation: TileNation;
  gender: Gender;
  size?: number;
  sipping?: boolean;
}): React.ReactElement {
  if (nation === 'joker') {
    const isFemale = gender === 'F';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        aria-hidden="true"
        className="select-none shrink-0"
      >
        <circle cx="40" cy="40" r="36" fill="#FFF9F0" stroke="#3E2F2A" strokeWidth="3" />
        {/* Harlequin collar */}
        <path
          d="M16 66 Q40 52 64 66 L60 74 Q40 68 20 74 Z"
          fill={isFemale ? '#A94438' : '#2F4A6D'}
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
        <polygon points="28,60 34,70 40,60" fill="#F2C14E" stroke="#3E2F2A" strokeWidth="1.8" />
        <polygon points="40,60 46,70 52,60" fill="#F2C14E" stroke="#3E2F2A" strokeWidth="1.8" />
        {/* Head */}
        <circle
          cx="40"
          cy="43"
          r="15"
          fill={isFemale ? '#F3D2BA' : '#ECC4A8'}
          stroke="#3E2F2A"
          strokeWidth="2.8"
        />
        {/* Harlequin Jester Hat */}
        <path
          d="M24 34 Q18 14 34 24 Q40 12 46 24 Q62 14 56 34 Z"
          fill="#C9A227"
          stroke="#3E2F2A"
          strokeWidth="2.6"
        />
        <circle cx="22" cy="19" r="3.5" fill="#A94438" stroke="#3E2F2A" strokeWidth="2" />
        <circle cx="58" cy="19" r="3.5" fill="#2F4A6D" stroke="#3E2F2A" strokeWidth="2" />
        {/* Mask */}
        <path
          d="M27 38 Q33 34 40 39 Q47 34 53 38 Q50 45 43 43 Q40 41 37 43 Q30 45 27 38 Z"
          fill="#3E2F2A"
        />
        <circle cx="34" cy="40" r="2" fill="#FFF9F0" />
        <circle cx="46" cy="40" r="2" fill="#FFF9F0" />
        {/* Smile */}
        <path
          d="M35 49 Q40 54 45 49"
          fill="none"
          stroke="#3E2F2A"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const meta = NATION_VISUALS[nation as NationKey] ?? NATION_VISUALS.fr;
  const isFemale = gender === 'F';
  const skin = isFemale ? meta.skinToneF : meta.skinToneM;
  const hair = isFemale ? meta.hairColorF : meta.hairColorM;
  const hat = isFemale ? meta.hatStyleF : meta.hatStyleM;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden="true"
      className="select-none shrink-0"
    >
      {/* Background medallion */}
      <circle cx="40" cy="40" r="36" fill="#FFF9F0" stroke={meta.primaryColor} strokeWidth="4" />
      <circle cx="40" cy="40" r="33" fill="none" stroke="#3E2F2A" strokeWidth="2" />

      {/* Hair back for female */}
      {isFemale && (
        <path
          d="M22 36 Q19 54 26 62 L54 62 Q61 54 58 36 Z"
          fill={hair}
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
      )}

      {/* Shoulders / Coat */}
      <path
        d="M17 68 Q40 53 63 68 L58 73 Q40 69 22 73 Z"
        fill={meta.primaryColor}
        stroke="#3E2F2A"
        strokeWidth="2.6"
      />
      {/* Scarf / Collar accent */}
      <path
        d="M31 58 Q40 65 49 58"
        fill="none"
        stroke={meta.secondaryColor}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Head */}
      <circle cx="40" cy="43" r="15" fill={skin} stroke="#3E2F2A" strokeWidth="2.8" />

      {/* Cheeks */}
      <circle cx="31" cy="46" r="2.6" fill="#E8B4B8" opacity="0.75" />
      <circle cx="49" cy="46" r="2.6" fill="#E8B4B8" opacity="0.75" />

      {/* Eyes */}
      <circle cx="34.5" cy="42" r="2.1" fill="#3E2F2A" />
      <circle cx="45.5" cy="42" r="2.1" fill="#3E2F2A" />
      {isFemale && (
        <>
          <path d="M32 40 L30 38" stroke="#3E2F2A" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M48 40 L50 38" stroke="#3E2F2A" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Smile or Moustache */}
      {!isFemale && (nation === 'it' || nation === 'fr' || nation === 'tu' || nation === 'in') ? (
        <path
          d="M33 48 Q37 46 40 48 Q43 46 47 48"
          fill="none"
          stroke={hair}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M35 49 Q40 53 45 49"
          fill="none"
          stroke="#3E2F2A"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      )}

      {/* Hair top */}
      <path
        d="M25 39 Q28 26 40 27 Q52 26 55 39 Q47 33 40 34 Q33 33 25 39 Z"
        fill={hair}
        stroke="#3E2F2A"
        strokeWidth="2.4"
      />

      {/* Country Hat / Headpiece */}
      {hat === 'beret' && (
        <path
          d="M23 31 Q38 19 56 27 Q50 34 25 33 Z"
          fill={meta.secondaryColor}
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
      )}
      {hat === 'fez' && (
        <polygon
          points="32,29 35,17 45,17 48,29"
          fill="#C84B31"
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
      )}
      {hat === 'ushanka' && (
        <rect
          x="24"
          y="20"
          width="32"
          height="13"
          rx="5"
          fill="#6E4C36"
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
      )}
      {hat === 'turban' && (
        <path
          d="M24 32 Q40 16 56 32 Q48 25 40 29 Q32 25 24 32 Z"
          fill={meta.accentColor}
          stroke="#3E2F2A"
          strokeWidth="2.5"
        />
      )}
      {hat === 'tophat' && (
        <>
          <rect
            x="29"
            y="14"
            width="22"
            height="14"
            rx="2"
            fill="#334E68"
            stroke="#3E2F2A"
            strokeWidth="2.5"
          />
          <line
            x1="23"
            y1="28"
            x2="57"
            y2="28"
            stroke="#3E2F2A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {hat === 'straw' && (
        <>
          <path d="M27 28 Q40 18 53 28 Z" fill="#F2C14E" stroke="#3E2F2A" strokeWidth="2.4" />
          <line
            x1="21"
            y1="28"
            x2="59"
            y2="28"
            stroke="#3E2F2A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {hat === 'flower' && (
        <circle cx="52" cy="31" r="5" fill="#A94438" stroke="#3E2F2A" strokeWidth="2.2" />
      )}
      {hat === 'ribbon' && (
        <path
          d="M32 24 L48 24 L44 29 L36 29 Z"
          fill={meta.secondaryColor}
          stroke="#3E2F2A"
          strokeWidth="2"
        />
      )}
      {hat === 'crown' && (
        <polygon
          points="27,30 33,19 40,25 47,19 53,30"
          fill="#F2C14E"
          stroke="#3E2F2A"
          strokeWidth="2.3"
        />
      )}

      {/* Tiny warm coffee cup when sitting/sipping */}
      {sipping && (
        <g transform="translate(47, 52)">
          <rect
            x="0"
            y="2"
            width="12"
            height="10"
            rx="2"
            fill="#FFF9F0"
            stroke="#3E2F2A"
            strokeWidth="2"
          />
          <path d="M12 4 Q16 7 12 10" fill="none" stroke="#3E2F2A" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export function PlayerAvatar({
  avatarId,
  size = 28,
}: {
  avatarId?: string;
  size?: number;
}): React.ReactElement {
  const preset = getPresetAvatar(avatarId);

  if (preset.kind === 'character' && preset.nation && preset.gender) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        title={preset.label}
      >
        <CharacterPortrait
          nation={preset.nation as TileNation}
          gender={preset.gender}
          size={size}
        />
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label={preset.label}
      className="inline-block shrink-0 select-none rounded-full shadow-2xs"
    >
      <circle cx="20" cy="20" r="18.5" fill={preset.bg} stroke="#3E2F2A" strokeWidth="2.2" />
      <circle cx="20" cy="20" r="15.5" fill="#FFF9F0" stroke="#3E2F2A" strokeWidth="1.2" />

      {preset.id === 'espresso' && (
        <g>
          <ellipse cx="20" cy="28" rx="9" ry="2.2" fill="#C9A227" stroke="#3E2F2A" strokeWidth="1.4" />
          <path
            d="M13 17 H27 L25.5 26 Q24.5 28 20 28 Q15.5 28 14.5 26 Z"
            fill="#C96F4A"
            stroke="#3E2F2A"
            strokeWidth="1.6"
          />
          <path d="M27 19 Q31 19 30 23 Q29 25 26 24" fill="none" stroke="#3E2F2A" strokeWidth="1.6" />
          <path d="M18 14 Q17 11 19 9" fill="none" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 14 Q21 11 23 9" fill="none" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {preset.id === 'croissant' && (
        <g>
          <path
            d="M10 24 Q12 13 20 13 Q28 13 30 24 Q26 26 24 21 Q20 19 16 21 Q14 26 10 24 Z"
            fill="#E0A526"
            stroke="#3E2F2A"
            strokeWidth="1.6"
          />
          <path d="M16 15 Q20 21 24 15" fill="none" stroke="#8B5E3C" strokeWidth="1.4" />
        </g>
      )}

      {preset.id === 'gato' && (
        <g>
          <polygon points="12,17 14,10 18,15" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.5" />
          <polygon points="28,17 26,10 22,15" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.5" />
          <circle cx="20" cy="21" r="8" fill="#D98E3A" stroke="#3E2F2A" strokeWidth="1.6" />
          <circle cx="17" cy="20" r="1.3" fill="#3E2F2A" />
          <circle cx="23" cy="20" r="1.3" fill="#3E2F2A" />
          <path d="M18 23 Q20 25 22 23" fill="none" stroke="#3E2F2A" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}

      {preset.id === 'moka' && (
        <g>
          <polygon points="15,28 25,28 23,20 17,20" fill="#4F7C8A" stroke="#3E2F2A" strokeWidth="1.5" />
          <polygon points="16,19 24,19 25,13 15,13" fill="#B9855A" stroke="#3E2F2A" strokeWidth="1.5" />
          <rect x="19" y="10" width="2" height="3" fill="#3E2F2A" />
          <path d="M24 15 Q28 15 27 21 L24 21" fill="none" stroke="#3E2F2A" strokeWidth="1.6" />
        </g>
      )}

      {preset.id === 'tetera' && (
        <g>
          <ellipse cx="20" cy="22" rx="7.5" ry="6" fill="#3F8F6B" stroke="#3E2F2A" strokeWidth="1.6" />
          <circle cx="20" cy="14.5" r="2" fill="#C9A227" stroke="#3E2F2A" strokeWidth="1.3" />
          <path d="M12.5 21 Q9 18 10 15" fill="none" stroke="#3E2F2A" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M27.5 19 Q31 20 27.5 24" fill="none" stroke="#3E2F2A" strokeWidth="1.6" />
        </g>
      )}

      {preset.id === 'churros' && (
        <g>
          <path d="M14 27 L18 12" stroke="#D98E3A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M20 27 L20 11" stroke="#E0A526" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M26 27 L22 12" stroke="#D98E3A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M12 23 H28 L26 29 H14 Z" fill="#8B5E3C" stroke="#3E2F2A" strokeWidth="1.5" />
        </g>
      )}

      {preset.id === 'macaron' && (
        <g>
          <ellipse cx="20" cy="17" rx="8.5" ry="4" fill="#D96C5F" stroke="#3E2F2A" strokeWidth="1.5" />
          <rect x="11.5" y="19" width="17" height="3" rx="1.5" fill="#FFF9F0" stroke="#3E2F2A" strokeWidth="1.3" />
          <ellipse cx="20" cy="24" rx="8.5" ry="3.8" fill="#D96C5F" stroke="#3E2F2A" strokeWidth="1.5" />
        </g>
      )}

      {preset.id === 'copa' && (
        <g>
          <path d="M13 13 H27 L22 21 H18 Z" fill="#2F4A6D" stroke="#3E2F2A" strokeWidth="1.5" />
          <line x1="20" y1="21" x2="20" y2="28" stroke="#3E2F2A" strokeWidth="1.8" />
          <line x1="15" y1="28" x2="25" y2="28" stroke="#3E2F2A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="16" r="1.6" fill="#F2C14E" />
        </g>
      )}
    </svg>
  );
}

export function CafetuliaLogo({ compact = false }: { compact?: boolean }): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        width={compact ? 32 : 44}
        height={compact ? 32 : 44}
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="shrink-0"
      >
        <ellipse
          cx="32"
          cy="52"
          rx="24"
          ry="6"
          fill="#C9A227"
          stroke="#3E2F2A"
          strokeWidth="2.8"
        />
        <path
          d="M14 24 L50 24 L46 46 Q44 52 32 52 Q20 52 18 46 Z"
          fill="#FFF9F0"
          stroke="#3E2F2A"
          strokeWidth="3"
        />
        <path d="M16 32 L48 32 L47 38 L17 38 Z" fill="#C96F4A" />
        <path
          d="M49 28 Q60 28 58 38 Q56 45 46 43"
          fill="none"
          stroke="#3E2F2A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M25 18 Q23 12 27 8"
          fill="none"
          stroke="#B9855A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M35 19 Q33 11 38 7"
          fill="none"
          stroke="#C96F4A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <span
          className={`font-serif font-bold tracking-tight text-[#3E2F2A] block leading-none ${
            compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
          }`}
        >
          Cafetulia
        </span>
      </div>
    </div>
  );
}
