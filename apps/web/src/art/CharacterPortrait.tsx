import React from 'react';
import { getPresetAvatar, NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import type { Gender, Nation } from '@cafetulia/engine';

export type TileNation = Nation | 'joker';

const TILE_FRAME_COLORS: Record<NationKey | 'joker', string> = {
  af: '#F6EBC9',
  ch: '#F2B8BE',
  cu: '#EB7A6A',
  fr: '#F4F1EA',
  al: '#B7A2BA',
  in: '#F5B85A',
  it: '#CF8D5A',
  ru: '#5E9B8A',
  es: '#E5E4D5',
  tu: '#CFD5DC',
  en: '#DCE4EC',
  am: '#F6E06B',
  joker: '#E8DFC5',
};

/**
 * Renders the authentic national flag graphics inside a given coordinate box (0..100 x 0..64)
 */
function renderAuthenticFlag(nation: TileNation): React.ReactElement {
  switch (nation) {
    case 'fr':
      return (
        <g>
          <rect x="0" y="0" width="33.4" height="64" fill="#1E4E8C" />
          <rect x="33.3" y="0" width="33.4" height="64" fill="#FFF9F0" />
          <rect x="66.6" y="0" width="33.4" height="64" fill="#C83E31" />
        </g>
      );
    case 'it':
      return (
        <g>
          <rect x="0" y="0" width="33.4" height="64" fill="#2E7D52" />
          <rect x="33.3" y="0" width="33.4" height="64" fill="#FFF9F0" />
          <rect x="66.6" y="0" width="33.4" height="64" fill="#C83E31" />
        </g>
      );
    case 'al':
      return (
        <g>
          <rect x="0" y="0" width="100" height="21.4" fill="#231F20" />
          <rect x="0" y="21.3" width="100" height="21.4" fill="#C83E31" />
          <rect x="0" y="42.6" width="100" height="21.4" fill="#F2C14E" />
        </g>
      );
    case 'ru':
      return (
        <g>
          <rect x="0" y="0" width="100" height="21.4" fill="#FFF9F0" />
          <rect x="0" y="21.3" width="100" height="21.4" fill="#24579A" />
          <rect x="0" y="42.6" width="100" height="21.4" fill="#C83E31" />
        </g>
      );
    case 'es':
      return (
        <g>
          <rect x="0" y="0" width="100" height="16" fill="#C83E31" />
          <rect x="0" y="16" width="100" height="32" fill="#F2C14E" />
          <rect x="0" y="48" width="100" height="16" fill="#C83E31" />
        </g>
      );
    case 'in':
      return (
        <g>
          <rect x="0" y="0" width="100" height="21.4" fill="#E67E22" />
          <rect x="0" y="21.3" width="100" height="21.4" fill="#FFF9F0" />
          <rect x="0" y="42.6" width="100" height="21.4" fill="#2E7D52" />
          <circle cx="50" cy="32" r="7" fill="none" stroke="#1E4E8C" strokeWidth="2" />
          <circle cx="50" cy="32" r="2" fill="#1E4E8C" />
        </g>
      );
    case 'ch':
      return (
        <g>
          <rect x="0" y="0" width="100" height="64" fill="#C83E31" />
          <polygon
            points="18,10 20.5,17.5 28,17.5 22,22 24,29.5 18,25 12,29.5 14,22 8,17.5 15.5,17.5"
            fill="#F2C14E"
          />
          <circle cx="34" cy="10" r="2.2" fill="#F2C14E" />
          <circle cx="38" cy="16" r="2.2" fill="#F2C14E" />
          <circle cx="38" cy="24" r="2.2" fill="#F2C14E" />
          <circle cx="34" cy="30" r="2.2" fill="#F2C14E" />
        </g>
      );
    case 'tu':
      return (
        <g>
          <rect x="0" y="0" width="100" height="64" fill="#C83E31" />
          <circle cx="36" cy="32" r="15" fill="#FFF9F0" />
          <circle cx="40.5" cy="32" r="12" fill="#C83E31" />
          <polygon
            points="54,25 56,30 61,30 57,33 58.5,38 54,35 49.5,38 51,33 47,30 52,30"
            fill="#FFF9F0"
          />
        </g>
      );
    case 'cu':
      return (
        <g>
          <rect x="0" y="0" width="100" height="12.8" fill="#1E4E8C" />
          <rect x="0" y="12.8" width="100" height="12.8" fill="#FFF9F0" />
          <rect x="0" y="25.6" width="100" height="12.8" fill="#1E4E8C" />
          <rect x="0" y="38.4" width="100" height="12.8" fill="#FFF9F0" />
          <rect x="0" y="51.2" width="100" height="12.8" fill="#1E4E8C" />
          <polygon points="0,0 46,32 0,64" fill="#C83E31" />
          <polygon
            points="15,23 17,29 23,29 18,33 20,39 15,35 10,39 12,33 7,29 13,29"
            fill="#FFF9F0"
          />
        </g>
      );
    case 'af':
      return (
        <g>
          <rect x="0" y="0" width="100" height="16" fill="#1E4E8C" />
          <rect x="0" y="16" width="100" height="16" fill="#FFF9F0" />
          <rect x="0" y="32" width="100" height="16" fill="#2E7D52" />
          <rect x="0" y="48" width="100" height="16" fill="#F2C14E" />
          <rect x="42" y="0" width="16" height="64" fill="#C83E31" />
          <polygon
            points="16,4 17.5,8.5 22,8.5 18.5,11 20,15.5 16,12.5 12,15.5 13.5,11 10,8.5 14.5,8.5"
            fill="#F2C14E"
          />
        </g>
      );
    case 'en':
      return (
        <g>
          <rect x="0" y="0" width="100" height="64" fill="#1E4E8C" />
          <path d="M0,0 L100,64 M100,0 L0,64" stroke="#FFF9F0" strokeWidth="12" />
          <path d="M0,0 L100,64 M100,0 L0,64" stroke="#C83E31" strokeWidth="5" />
          <path d="M50,0 V64 M0,32 H100" stroke="#FFF9F0" strokeWidth="16" />
          <path d="M50,0 V64 M0,32 H100" stroke="#C83E31" strokeWidth="8" />
        </g>
      );
    case 'am':
      return (
        <g>
          <rect x="0" y="0" width="100" height="64" fill="#FFF9F0" />
          {[0, 2, 4, 6, 8].map((row) => (
            <rect key={row} x="0" y={row * 7.1} width="100" height="7.1" fill="#C83E31" />
          ))}
          <rect x="0" y="0" width="44" height="35" fill="#1E4E8C" />
          {[6, 16, 26, 36].map((cx) =>
            [7, 17, 27].map((cy) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="#FFF9F0" />
            )),
          )}
        </g>
      );
    case 'joker':
    default:
      return (
        <g>
          <rect x="0" y="0" width="100" height="64" fill="#FFF9F0" />
          <polygon points="0,0 50,0 25,32" fill="#E0A526" />
          <polygon points="50,0 100,0 75,32" fill="#C83E31" />
          <polygon points="0,64 50,64 25,32" fill="#2E7D52" />
          <polygon points="50,64 100,64 75,32" fill="#1E4E8C" />
          <polygon points="25,32 50,0 75,32 50,64" fill="#8A3F5D" opacity="0.85" />
        </g>
      );
  }
}

export function FlagBadge({
  nation,
  size = 20,
}: {
  nation: TileNation;
  size?: number;
}): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 64"
      aria-hidden="true"
      className="inline-block shrink-0 rounded-[3px] shadow-2xs"
    >
      <clipPath id={`flag-clip-${nation}`}>
        <rect x="2" y="2" width="96" height="60" rx="8" />
      </clipPath>
      <g clipPath={`url(#flag-clip-${nation})`}>{renderAuthenticFlag(nation)}</g>
      <rect
        x="2"
        y="2"
        width="96"
        height="60"
        rx="8"
        fill="none"
        stroke="#231712"
        strokeWidth="5"
      />
    </svg>
  );
}

/**
 * Original-style Square Tile Illustration (inspired by classic Café International tiles):
 * - Rounded square wooden/pastel frame
 * - Full-width rectangular national flag filling the upper background
 * - Expressive ink-outlined cartoon character on top with unmistakable gender & nationality traits
 * - ZERO visible text inside the tile
 */
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
  const isFemale = gender === 'F';
  const frameBg = TILE_FRAME_COLORS[(nation as NationKey) ?? 'fr'] ?? '#F4F1EA';
  const meta =
    nation === 'joker'
      ? NATION_VISUALS.fr
      : (NATION_VISUALS[nation as NationKey] ?? NATION_VISUALS.fr);
  const skin =
    nation === 'joker'
      ? isFemale
        ? '#F6D6BD'
        : '#F1C7A8'
      : isFemale
        ? meta.skinToneF
        : meta.skinToneM;
  const ink = '#231712';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="select-none shrink-0 block"
    >
      {/* 1. SQUARE ROUNDED TILE BODY (Classic board game cardboard/wood tile) */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="16"
        fill={frameBg}
        stroke={ink}
        strokeWidth="3.5"
      />
      {/* Subtle inner highlight bevel */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="13"
        fill="none"
        stroke="#FFF9F0"
        strokeWidth="1.5"
        opacity="0.55"
      />

      {/* 2. LARGE FULL-WIDTH BACKGROUND FLAG (Upper-middle 80x50 banner behind bust) */}
      <g transform="translate(10, 11)">
        <svg width="80" height="50" viewBox="0 0 100 64" overflow="hidden">
          {renderAuthenticFlag(nation)}
        </svg>
        <rect
          x="0"
          y="0"
          width="80"
          height="50"
          rx="3"
          fill="none"
          stroke={ink}
          strokeWidth="2.8"
        />
      </g>

      {/* 3. FEMALE BACK HAIR (Drawn behind shoulders/neck for clear female silhouette) */}
      {isFemale && nation !== 'joker' && (
        <g>
          {nation === 'af' && (
            /* Big voluminous round afro */
            <circle cx="50" cy="48" r="24" fill="#1E1410" stroke={ink} strokeWidth="3" />
          )}
          {nation === 'es' && (
            /* Long wavy flamenco hair */
            <path
              d="M22 44 Q18 68 26 92 L74 92 Q82 68 78 44 Q74 26 50 26 Q26 26 22 44 Z"
              fill="#1E1410"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'cu' && (
            /* Shoulder-length lush curls */
            <path
              d="M24 46 Q20 66 28 80 L72 80 Q80 66 76 46 Z"
              fill="#241813"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'am' && (
            /* Glamorous blonde waves */
            <path
              d="M23 42 Q18 62 28 76 L72 76 Q82 62 77 42 Q72 25 50 25 Q28 25 23 42 Z"
              fill="#F2C84B"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {(nation === 'fr' || nation === 'ch') && (
            /* Sleek chin-length bob */
            <path
              d="M27 40 Q24 58 31 68 L69 68 Q76 58 73 40 Z"
              fill="#1E1614"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'tu' && (
            /* Patterned yellow headscarf drape */
            <path
              d="M24 38 Q22 68 30 88 L70 88 Q78 68 76 38 Q68 25 50 25 Q32 25 24 38 Z"
              fill="#F2C14E"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {(nation === 'it' || nation === 'al' || nation === 'ru' || nation === 'in' || nation === 'en') && (
            /* High bun / updo silhouette */
            <>
              <circle
                cx={nation === 'in' || nation === 'ru' ? 68 : 50}
                cy={nation === 'in' || nation === 'ru' ? 52 : 24}
                r="10"
                fill={nation === 'al' ? '#9C6228' : nation === 'en' ? '#7D3B22' : '#231712'}
                stroke={ink}
                strokeWidth="2.6"
              />
              <path
                d="M29 44 Q27 60 34 68 L66 68 Q73 60 71 44 Z"
                fill={nation === 'al' ? '#9C6228' : nation === 'en' ? '#7D3B22' : '#231712'}
                stroke={ink}
                strokeWidth="2.6"
              />
            </>
          )}
        </g>
      )}

      {/* 4. SHOULDERS, CLOTHING & GENDER-DISTINCTIVE OUTFIT */}
      {nation === 'joker' ? (
        <g>
          <path
            d="M16 96 Q24 72 50 72 Q76 72 84 96 Z"
            fill={isFemale ? '#C83E31' : '#1E4E8C'}
            stroke={ink}
            strokeWidth="3"
          />
          {/* Harlequin ruffled collar */}
          <polygon points="26,75 36,90 45,74" fill="#F2C14E" stroke={ink} strokeWidth="2.4" />
          <polygon points="45,74 55,90 64,74" fill="#FFF9F0" stroke={ink} strokeWidth="2.4" />
          <polygon points="56,74 66,90 75,75" fill="#F2C14E" stroke={ink} strokeWidth="2.4" />
        </g>
      ) : isFemale ? (
        /* FEMALE OUTFITS: Elegant necklines, turtleneck, sari, dirndl, pearl necklace */
        <g>
          <path
            d="M18 96 Q25 73 50 73 Q75 73 82 96 Z"
            fill={
              nation === 'fr'
                ? '#E8B4B8'
                : nation === 'al'
                  ? '#7BA4C7'
                  : nation === 'in'
                    ? '#C83E31'
                    : nation === 'es'
                      ? '#C83E31'
                      : nation === 'ch'
                        ? '#2E5B48'
                        : nation === 'cu'
                          ? '#7A683A'
                          : nation === 'tu'
                            ? '#2E7D52'
                            : '#2B2B2E'
            }
            stroke={ink}
            strokeWidth="3"
          />
          {/* Neck */}
          <rect
            x="43"
            y="61"
            width="14"
            height="16"
            rx="5"
            fill={skin}
            stroke={ink}
            strokeWidth="2.6"
          />
          {/* Pearl necklace or gold collar on females */}
          {(nation === 'it' || nation === 'en' || nation === 'am' || nation === 'af') && (
            <g>
              <circle cx="41" cy="76" r="2.6" fill={nation === 'af' ? '#F2C14E' : '#FFF9F0'} stroke={ink} strokeWidth="1.5" />
              <circle cx="47" cy="78" r="2.6" fill={nation === 'af' ? '#F2C14E' : '#FFF9F0'} stroke={ink} strokeWidth="1.5" />
              <circle cx="53" cy="78" r="2.6" fill={nation === 'af' ? '#F2C14E' : '#FFF9F0'} stroke={ink} strokeWidth="1.5" />
              <circle cx="59" cy="76" r="2.6" fill={nation === 'af' ? '#F2C14E' : '#FFF9F0'} stroke={ink} strokeWidth="1.5" />
            </g>
          )}
          {nation === 'fr' && (
            /* Chic ribbed turtleneck */
            <rect
              x="40"
              y="66"
              width="20"
              height="12"
              rx="3"
              fill="#E8B4B8"
              stroke={ink}
              strokeWidth="2.4"
            />
          )}
          {nation === 'tu' && (
            /* Tied headscarf knot under chin */
            <path
              d="M36 72 Q50 82 64 72 L58 88 L42 88 Z"
              fill="#C83E31"
              stroke={ink}
              strokeWidth="2.4"
            />
          )}
        </g>
      ) : (
        /* MALE OUTFITS: Broad shoulders, lapels, suit & tie, checkered shirt, military/tunic collar */
        <g>
          <path
            d="M14 96 Q21 71 50 71 Q79 71 86 96 Z"
            fill={
              nation === 'af'
                ? '#4A6FA5'
                : nation === 'ch'
                  ? '#264E42'
                  : nation === 'cu'
                    ? '#6E5A38'
                    : nation === 'fr'
                      ? '#546270'
                      : nation === 'al'
                        ? '#24579A'
                        : nation === 'in'
                          ? '#FFF9F0'
                          : nation === 'it'
                            ? '#EED9B8'
                            : nation === 'ru'
                              ? '#3A534E'
                              : nation === 'es'
                                ? '#C83E31'
                                : nation === 'tu'
                                  ? '#1E4E8C'
                                  : nation === 'en'
                                    ? '#1F242A'
                                    : '#7A583B'
            }
            stroke={ink}
            strokeWidth="3"
          />
          {/* Neck */}
          <rect
            x="42"
            y="60"
            width="16"
            height="16"
            rx="4"
            fill={skin}
            stroke={ink}
            strokeWidth="2.6"
          />
          {/* Shirt V-neck & Tie for suited gentlemen */}
          {(nation === 'af' || nation === 'en' || nation === 'am' || nation === 'it' || nation === 'ru') && (
            <g>
              <polygon points="39,72 50,92 61,72" fill="#FFF9F0" stroke={ink} strokeWidth="2.2" />
              <polygon
                points="48,75 52,75 54,93 46,93"
                fill={nation === 'af' ? '#F2C14E' : '#C83E31'}
                stroke={ink}
                strokeWidth="1.8"
              />
            </g>
          )}
        </g>
      )}

      {/* 5. EARS & EARRINGS (Large hoops/pearls for females, single hoop for Spanish male) */}
      <circle cx="29" cy="52" r="4.5" fill={skin} stroke={ink} strokeWidth="2.5" />
      <circle cx="71" cy="52" r="4.5" fill={skin} stroke={ink} strokeWidth="2.5" />
      {isFemale && (
        <>
          {nation === 'af' || nation === 'es' || nation === 'cu' ? (
            <>
              <circle cx="28" cy="59" r="5" fill="none" stroke="#F2C14E" strokeWidth="2.8" />
              <circle cx="72" cy="59" r="5" fill="none" stroke="#F2C14E" strokeWidth="2.8" />
            </>
          ) : (
            <>
              <circle cx="28" cy="57" r="2.8" fill="#FFF9F0" stroke={ink} strokeWidth="1.8" />
              <circle cx="72" cy="57" r="2.8" fill="#FFF9F0" stroke={ink} strokeWidth="1.8" />
            </>
          )}
        </>
      )}
      {!isFemale && nation === 'es' && (
        <circle cx="28" cy="58" r="3.8" fill="none" stroke="#F2C14E" strokeWidth="2.4" />
      )}

      {/* 6. CARICATURE HEAD SHAPE */}
      <path
        d={
          isFemale
            ? 'M31 46 Q31 28 50 28 Q69 28 69 46 Q69 68 50 70 Q31 68 31 46 Z'
            : 'M29 44 Q29 26 50 26 Q71 26 71 44 Q72 69 50 71 Q28 69 29 44 Z'
        }
        fill={skin}
        stroke={ink}
        strokeWidth="3"
      />

      {/* Rosy cheeks */}
      <circle cx="37" cy="55" r="3.8" fill="#E88D8A" opacity="0.55" />
      <circle cx="63" cy="55" r="3.8" fill="#E88D8A" opacity="0.55" />

      {/* Indian Bindi for Priya */}
      {isFemale && nation === 'in' && (
        <circle cx="50" cy="39" r="2.5" fill="#C83E31" stroke={ink} strokeWidth="1.2" />
      )}

      {/* 7. EYES, EYEBROWS & SUNGLASSES */}
      {nation === 'joker' ? (
        /* Harlequin mask */
        <g>
          <path
            d="M32 42 Q41 36 50 43 Q59 36 68 42 Q64 52 54 49 Q50 47 46 49 Q36 52 32 42 Z"
            fill={isFemale ? '#8A3F5D' : '#231712'}
            stroke={ink}
            strokeWidth="2"
          />
          <circle cx="41" cy="44" r="2.5" fill="#FFF9F0" />
          <circle cx="59" cy="44" r="2.5" fill="#FFF9F0" />
        </g>
      ) : nation === 'cu' || (!isFemale && nation === 'am') ? (
        /* Cool dark sunglasses (Cuba M/F & America Cowboy M) */
        <g>
          <rect x="33" y="42" width="15" height="10" rx="3" fill="#1E242B" stroke={ink} strokeWidth="2.4" />
          <rect x="52" y="42" width="15" height="10" rx="3" fill="#1E242B" stroke={ink} strokeWidth="2.4" />
          <line x1="48" y1="45" x2="52" y2="45" stroke={ink} strokeWidth="2.4" />
          <line x1="35" y1="44" x2="40" y2="49" stroke="#FFF9F0" strokeWidth="1.6" />
          <line x1="54" y1="44" x2="59" y2="49" stroke="#FFF9F0" strokeWidth="1.6" />
        </g>
      ) : isFemale && nation === 'am' ? (
        /* Pink Cat-Eye Sunglasses for American Female */
        <g>
          <path
            d="M30 41 L47 44 L45 51 L33 50 Z"
            fill="#F48FB1"
            stroke={ink}
            strokeWidth="2.2"
          />
          <path
            d="M70 41 L53 44 L55 51 L67 50 Z"
            fill="#F48FB1"
            stroke={ink}
            strokeWidth="2.2"
          />
          <circle cx="39" cy="47" r="2" fill={ink} />
          <circle cx="61" cy="47" r="2" fill={ink} />
        </g>
      ) : (
        /* Expressive Cartoon Eyes with scleras, pupils & eyelashes/brows */
        <g>
          <ellipse cx="42" cy="46" rx="4.5" ry="5.2" fill="#FFF9F0" stroke={ink} strokeWidth="2.2" />
          <ellipse cx="58" cy="46" rx="4.5" ry="5.2" fill="#FFF9F0" stroke={ink} strokeWidth="2.2" />
          {/* Half-lidded ironic eyelids for French/Italian/Russian/African */}
          {(nation === 'fr' || nation === 'it' || nation === 'ru') && (
            <>
              <path d="M37.5 45 H46.5" stroke={ink} strokeWidth="2.2" />
              <path d="M53.5 45 H62.5" stroke={ink} strokeWidth="2.2" />
            </>
          )}
          <circle cx="42.5" cy="47" r="2.3" fill={ink} />
          <circle cx="57.5" cy="47" r="2.3" fill={ink} />
          <circle cx="43.3" cy="46.2" r="0.8" fill="#FFF9F0" />
          <circle cx="58.3" cy="46.2" r="0.8" fill="#FFF9F0" />

          {isFemale ? (
            /* Prominent Female Eyelashes + Arched Brows */
            <>
              <path d="M37 43 L34 40 M39 41 L37 38" stroke={ink} strokeWidth="2" strokeLinecap="round" />
              <path d="M63 43 L66 40 M61 41 L63 38" stroke={ink} strokeWidth="2" strokeLinecap="round" />
              <path d="M36 38 Q42 34 47 38" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M53 38 Q58 34 64 38" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
            </>
          ) : (
            /* Thick Expressive Male Eyebrows */
            <>
              <path
                d="M35 38 Q42 35 47 39"
                fill="none"
                stroke={nation === 'al' || nation === 'en' ? '#FFF9F0' : ink}
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <path
                d="M53 39 Q58 35 65 38"
                fill="none"
                stroke={nation === 'al' || nation === 'en' ? '#FFF9F0' : ink}
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      )}

      {/* 8. CARTOON NOSE */}
      <path
        d={isFemale ? 'M50 46 Q53 52 49 54' : 'M50 44 Q56 52 48 55'}
        fill="none"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 9. MOUTH, RUBY LIPS (FEMALE) OR BEARDS/MUSTACHES/CIGARS/PIPES (MALE) */}
      {isFemale ? (
        /* Distinct Female Painted Lips & Smile */
        <g>
          <path
            d="M42 60 Q46 57 50 59 Q54 57 58 60 Q50 66 42 60 Z"
            fill="#C83E31"
            stroke={ink}
            strokeWidth="2"
          />
          <path d="M43 60 Q50 62 57 60" fill="none" stroke="#FFF9F0" strokeWidth="1.2" />
        </g>
      ) : (
        /* Distinct Male Beards, Mustaches, Cigars & Pipes */
        <g>
          {nation === 'al' && (
            /* Full fluffy white Bavarian beard & mustache */
            <path
              d="M31 53 Q28 73 50 76 Q72 73 69 53 Q60 58 50 55 Q40 58 31 53 Z"
              fill="#FFF9F0"
              stroke={ink}
              strokeWidth="2.6"
            />
          )}
          {nation === 'cu' && (
            /* Full dark Cuban beard + big cigar */
            <>
              <path
                d="M31 52 Q30 73 50 75 Q70 73 69 52 Q59 56 50 54 Q41 56 31 52 Z"
                fill="#231712"
                stroke={ink}
                strokeWidth="2.4"
              />
              <rect x="20" y="57" width="22" height="5.5" rx="2" fill="#5C3A21" stroke={ink} strokeWidth="2" />
              <circle cx="20" cy="59.7" r="2.2" fill="#E67E22" />
            </>
          )}
          {nation === 'in' && (
            /* Groomed black beard + curled mustache */
            <>
              <path
                d="M33 53 Q34 71 50 73 Q66 71 67 53 Q58 62 50 62 Q42 62 33 53 Z"
                fill="#1E1410"
                stroke={ink}
                strokeWidth="2.2"
              />
              <path
                d="M37 56 Q44 52 50 56 Q56 52 63 56"
                fill="none"
                stroke="#1E1410"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </>
          )}
          {(nation === 'fr' || nation === 'it' || nation === 'es' || nation === 'tu' || nation === 'joker') && (
            /* Distinct Mustaches + Smiles */
            <>
              <path
                d={
                  nation === 'es'
                    ? 'M35 58 Q43 52 50 57 Q57 52 65 58'
                    : nation === 'tu'
                      ? 'M34 57 Q43 53 50 56 Q57 53 66 57'
                      : 'M38 57 Q44 54 50 57 Q56 54 62 57'
                }
                fill="none"
                stroke={ink}
                strokeWidth={nation === 'es' || nation === 'tu' ? '4.2' : '3'}
                strokeLinecap="round"
              />
              <path
                d="M43 62 Q50 66 57 62"
                fill="none"
                stroke={ink}
                strokeWidth="2.3"
                strokeLinecap="round"
              />
            </>
          )}
          {nation === 'en' && (
            /* White walrus mustache + curved briar pipe */
            <>
              <path
                d="M36 57 Q44 52 50 57 Q56 52 64 57"
                fill="none"
                stroke="#FFF9F0"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M36 57 Q44 52 50 57 Q56 52 64 57"
                fill="none"
                stroke={ink}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path d="M42 61 Q28 65 26 57" fill="none" stroke="#5C3A21" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="21" y="51" width="7" height="9" rx="2" fill="#5C3A21" stroke={ink} strokeWidth="2" />
            </>
          )}
          {(nation === 'af' || nation === 'ch' || nation === 'am' || nation === 'ru') && (
            /* Big toothy grin (plus cigar for American cowboy) */
            <>
              <path
                d="M39 57 Q50 67 61 57 Z"
                fill="#FFF9F0"
                stroke={ink}
                strokeWidth="2.4"
              />
              {nation === 'am' && (
                <rect x="22" y="58" width="20" height="5" rx="2" fill="#5C3A21" stroke={ink} strokeWidth="2" />
              )}
            </>
          )}
        </g>
      )}

      {/* 10. HATS, HAIR TOPS & ICONIC HEADGEAR */}
      {nation === 'joker' ? (
        /* Harlequin Jester Hat / Carnival Crown */
        <g>
          <path
            d="M24 34 Q14 10 38 22 Q50 6 62 22 Q86 10 76 34 Z"
            fill={isFemale ? '#E0A526' : '#C83E31'}
            stroke={ink}
            strokeWidth="2.8"
          />
          <circle cx="20" cy="15" r="4.5" fill="#F2C14E" stroke={ink} strokeWidth="2.2" />
          <circle cx="50" cy="10" r="4.5" fill="#2E7D52" stroke={ink} strokeWidth="2.2" />
          <circle cx="80" cy="15" r="4.5" fill="#1E4E8C" stroke={ink} strokeWidth="2.2" />
        </g>
      ) : isFemale ? (
        /* FEMALE HATS & HAIRSTYLES */
        <g>
          {nation === 'fr' && (
            /* Tilted pink/red French beret + bangs */
            <>
              <path d="M31 35 Q50 29 69 35 L67 40 Q50 36 33 40 Z" fill="#1E1614" stroke={ink} strokeWidth="2.2" />
              <path
                d="M24 31 Q44 14 74 26 Q66 36 28 34 Z"
                fill="#E8999E"
                stroke={ink}
                strokeWidth="2.8"
              />
              <path d="M50 19 L54 14" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {nation === 'ch' && (
            /* Olive cap with red star over bangs */
            <>
              <path
                d="M27 32 Q50 18 73 32 L69 37 Q50 33 31 37 Z"
                fill="#264E42"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="27" r="3.5" fill="#C83E31" />
            </>
          )}
          {nation === 'cu' && (
            /* Olive cap over curls */
            <path
              d="M28 31 L33 20 L67 20 L72 31 Z"
              fill="#6E5A38"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'es' && (
            /* Wavy parted hair + big red flamenco rose */
            <>
              <path d="M30 38 Q42 25 50 33 Q58 25 70 38" fill="#1E1410" stroke={ink} strokeWidth="2.6" />
              <circle cx="34" cy="30" r="7" fill="#C83E31" stroke={ink} strokeWidth="2.4" />
              <circle cx="34" cy="30" r="2.8" fill="#F2C14E" />
            </>
          )}
          {nation === 'ru' && (
            /* Plush dark fur hat */
            <rect
              x="27"
              y="18"
              width="46"
              height="18"
              rx="8"
              fill="#3B2820"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'en' && (
            /* Classic British cloche tea hat */
            <>
              <path
                d="M27 33 Q50 15 73 33 Z"
                fill="#232931"
                stroke={ink}
                strokeWidth="2.8"
              />
              <line x1="21" y1="33" x2="79" y2="33" stroke={ink} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {nation === 'am' && (
            /* Curly blonde hair top */
            <path
              d="M26 36 Q32 18 46 24 Q56 16 68 25 Q76 30 72 38 Q56 32 30 36 Z"
              fill="#F2C84B"
              stroke={ink}
              strokeWidth="2.6"
            />
          )}
          {(nation === 'af' || nation === 'al' || nation === 'in' || nation === 'it' || nation === 'tu') && (
            /* Parted hair top */
            <path
              d="M31 38 Q40 24 50 31 Q60 24 69 38 Q58 31 50 34 Q42 31 31 38 Z"
              fill={nation === 'al' ? '#9C6228' : '#1E1410'}
              stroke={ink}
              strokeWidth="2.6"
            />
          )}
        </g>
      ) : (
        /* MALE HATS & HEADGEAR */
        <g>
          {nation === 'af' && (
            /* High flat-top dark hair */
            <path
              d="M28 38 L29 20 Q50 17 71 20 L72 38 Q50 32 28 38 Z"
              fill="#1E1410"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'ch' && (
            /* Green peaked cap with red star */
            <>
              <path
                d="M27 32 Q50 16 73 32 L69 37 Q50 32 31 37 Z"
                fill="#264E42"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="26" r="3.8" fill="#C83E31" />
            </>
          )}
          {nation === 'cu' && (
            /* Olive military/field cap */
            <path
              d="M27 32 L32 19 L68 19 L73 32 Z"
              fill="#6E5A38"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'fr' && (
            /* Classic black French beret tilted */
            <>
              <path
                d="M25 31 Q48 13 75 26 Q66 36 28 34 Z"
                fill="#1E242B"
                stroke={ink}
                strokeWidth="2.8"
              />
              <path d="M51 18 L55 13" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {nation === 'al' && (
            /* Bavarian Tyrolean hat with white feather */
            <>
              <path d="M29 31 L36 16 L64 16 L71 31 Z" fill="#2D3B36" stroke={ink} strokeWidth="2.8" />
              <line x1="22" y1="31" x2="78" y2="31" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
              <path d="M62 24 Q70 12 66 8" fill="none" stroke="#FFF9F0" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}
          {nation === 'in' && (
            /* Large pleated magenta/pink Indian turban */
            <>
              <path
                d="M22 36 Q24 14 50 16 Q76 14 78 36 Q64 28 50 33 Q36 28 22 36 Z"
                fill="#C84B73"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="25" r="3.5" fill="#F2C14E" stroke={ink} strokeWidth="1.8" />
            </>
          )}
          {nation === 'it' && (
            /* Stylish Italian fedora hat */
            <>
              <path d="M29 31 L35 16 L65 16 L71 31 Z" fill="#3B444B" stroke={ink} strokeWidth="2.8" />
              <rect x="32" y="26" width="36" height="4" fill="#EED9B8" />
              <line x1="20" y1="31" x2="80" y2="31" stroke={ink} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {nation === 'ru' && (
            /* Tall brown fur ushanka hat */
            <rect
              x="27"
              y="15"
              width="46"
              height="20"
              rx="6"
              fill="#4E3429"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'es' && (
            /* Wide flat-brimmed Spanish Cordoban hat */
            <>
              <rect x="34" y="17" width="32" height="13" rx="2" fill="#5C2D24" stroke={ink} strokeWidth="2.6" />
              <ellipse cx="50" cy="31" rx="33" ry="5" fill="#5C2D24" stroke={ink} strokeWidth="2.8" />
            </>
          )}
          {nation === 'tu' && (
            /* Red Turkish Fez hat with black tassel */
            <>
              <polygon points="36,32 40,15 60,15 64,32" fill="#C83E31" stroke={ink} strokeWidth="2.8" />
              <path d="M60 16 Q68 20 67 28" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
            </>
          )}
          {nation === 'en' && (
            /* Classic English Bowler Hat */
            <>
              <path d="M31 30 Q31 14 50 14 Q69 14 69 30 Z" fill="#1E242B" stroke={ink} strokeWidth="2.8" />
              <line x1="24" y1="30" x2="76" y2="30" stroke={ink} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {nation === 'am' && (
            /* Big Texan Cowboy Stetson Hat */
            <>
              <path
                d="M31 30 L37 15 L50 19 L63 15 L69 30 Z"
                fill="#7D8892"
                stroke={ink}
                strokeWidth="2.6"
              />
              <path
                d="M16 28 Q50 36 84 28"
                fill="none"
                stroke={ink}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      )}

      {/* Optional subtle coffee cup corner icon when selected/sipping */}
      {sipping && (
        <g transform="translate(70, 74)">
          <rect
            x="0"
            y="2"
            width="18"
            height="14"
            rx="3"
            fill="#FFF9F0"
            stroke={ink}
            strokeWidth="2.4"
          />
          <path d="M18 5 Q24 9 18 13" fill="none" stroke={ink} strokeWidth="2.4" />
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
        className="inline-flex items-center justify-center rounded-lg overflow-hidden shrink-0"
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
