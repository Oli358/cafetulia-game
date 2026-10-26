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
          <polygon points="25,32 50,0 75,32 50,64" fill="#8A3F5D" opacity="0.88" />
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
 * Returns varied 3/4 caricature head silhouettes (pear, square-jaw, elongated oval, wide round)
 * so every guest has a distinct comic personality.
 */
function getCaricatureHeadPath(nation: TileNation, isFemale: boolean): string {
  if (isFemale) {
    switch (nation) {
      case 'fr':
      case 'it':
      case 'en':
        // Slender oval 3/4 face with sculpted cheekbones
        return 'M31 44 Q31 27 50 27 Q68 27 69 44 Q68 61 58 68 Q50 72 42 68 Q32 61 31 44 Z';
      case 'al':
      case 'ru':
      case 'am':
        // Cheerful fuller cheeks & rounded chin
        return 'M29 45 Q29 27 50 27 Q71 27 71 45 Q72 66 50 70 Q28 66 29 45 Z';
      default:
        // Warm heart-shaped caricature head
        return 'M30 44 Q30 27 50 28 Q70 27 70 44 Q69 65 50 70 Q31 65 30 44 Z';
    }
  }
  switch (nation) {
    case 'al':
    case 'cu':
    case 'ru':
    case 'am':
      // Broad square-jawed caricature head
      return 'M27 42 Q27 25 50 25 Q73 25 73 42 L71 63 Q69 71 50 71 Q31 71 29 63 Z';
    case 'fr':
    case 'es':
    case 'en':
      // Elongated aristocratic / ironic caricature head
      return 'M30 42 Q30 24 50 24 Q70 24 70 42 Q69 69 50 72 Q31 69 30 42 Z';
    case 'it':
    case 'tu':
    case 'in':
      // Pear-shaped expressive lower cheeks
      return 'M30 41 Q31 25 50 25 Q69 25 70 41 Q74 65 50 71 Q26 65 30 41 Z';
    default:
      return 'M28 43 Q28 26 50 26 Q72 26 72 43 Q72 68 50 71 Q28 68 28 43 Z';
  }
}

/**
 * Returns expressive asymmetric 3/4 caricature nose paths.
 */
function getCaricatureNosePath(nation: TileNation, isFemale: boolean): string {
  if (isFemale) {
    switch (nation) {
      case 'fr':
      case 'en':
        // Upturned pert French/English nose
        return 'M50 44 Q55 51 48 53';
      case 'it':
      case 'es':
      case 'tu':
        // Sculpted aquiline profile nose
        return 'M49 43 Q56 49 52 54 Q49 55 47 53';
      default:
        // Soft button caricature nose
        return 'M50 45 Q54 51 49 54';
    }
  }
  switch (nation) {
    case 'fr':
    case 'it':
    case 'tu':
      // Prominent Roman / Gallic bulb nose in 3/4 view
      return 'M49 42 Q59 49 54 55 Q49 56 46 53';
    case 'al':
    case 'ru':
    case 'cu':
      // Wide rounded potato caricature nose
      return 'M48 44 Q58 51 52 56 Q46 56 45 52';
    default:
      // Classic comic hooked nose
      return 'M50 43 Q57 51 48 55';
  }
}

/**
 * Original-style Square Tile Illustration (P1.1 v6):
 * - Rounded square wooden/cardstock frame with ink border
 * - Full-width rectangular national flag filling the upper background
 * - Expressive 3/4 ink-outlined caricature character on top with unmistakable gender,
 *   varied head shapes, asymmetric noses, ironic brows/mouths, and props
 * - 4 distinct Harlequin Jokers (2M + 2F)
 * - ZERO visible text inside the tile
 */
export function CharacterPortrait({
  nation,
  gender,
  size = 64,
  sipping = false,
  tileId,
}: {
  nation: TileNation;
  gender: Gender;
  size?: number;
  sipping?: boolean;
  tileId?: string;
}): React.ReactElement {
  const isFemale = gender === 'F';
  const isAltJoker = Boolean(tileId && (tileId.endsWith('_2') || tileId.endsWith('4')));
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
  const headPath = getCaricatureHeadPath(nation, isFemale);
  const nosePath = getCaricatureNosePath(nation, isFemale);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="select-none shrink-0 block"
    >
      {/* 1. ROUNDED SQUARE CARDBOARD TILE BASE WITH THICKNESS BEVEL */}
      <rect
        x="2"
        y="4"
        width="96"
        height="94"
        rx="16"
        fill="#1E130E"
      />
      <rect
        x="2"
        y="2"
        width="96"
        height="93"
        rx="16"
        fill={frameBg}
        stroke={ink}
        strokeWidth="3.8"
      />
      {/* Subtle top-left paper highlight bevel + bottom cardboard thickness */}
      <path
        d="M16 5.5 H84 A11 11 0 0 1 94.5 16"
        fill="none"
        stroke="#FFFDF8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.78"
      />
      <path
        d="M8 91.5 H92"
        stroke="#231712"
        strokeWidth="1.6"
        opacity="0.22"
      />

      {/* 2. LARGE FULL-WIDTH BACKGROUND FLAG (Upper-middle 82x51 banner behind bust) */}
      <g transform="translate(9, 9)">
        <rect x="1.5" y="2" width="82" height="51" rx="3" fill="#231712" opacity="0.22" />
        <svg width="82" height="51" viewBox="0 0 100 64" overflow="hidden">
          {renderAuthenticFlag(nation)}
        </svg>
        <rect
          x="0"
          y="0"
          width="82"
          height="51"
          rx="3"
          fill="none"
          stroke={ink}
          strokeWidth="3"
        />
      </g>

      {/* 3. FEMALE BACK HAIR (Drawn behind shoulders/neck for clear female silhouette) */}
      {isFemale && nation !== 'joker' && (
        <g>
          {nation === 'af' && (
            /* Big voluminous textured afro silhouette */
            <>
              <circle cx="50" cy="46" r="25" fill="#1E1410" stroke={ink} strokeWidth="3.2" />
              <circle cx="33" cy="36" r="8" fill="#1E1410" />
              <circle cx="67" cy="36" r="8" fill="#1E1410" />
            </>
          )}
          {nation === 'es' && (
            /* Lush wavy flamenco hair cascading over shoulders */
            <path
              d="M20 44 Q15 68 23 92 L77 92 Q85 68 80 44 Q75 25 50 25 Q25 25 20 44 Z"
              fill="#1E1410"
              stroke={ink}
              strokeWidth="3"
            />
          )}
          {nation === 'cu' && (
            /* Shoulder-length lush curls */
            <path
              d="M22 44 Q17 66 26 83 L74 83 Q83 66 78 44 Z"
              fill="#241813"
              stroke={ink}
              strokeWidth="3"
            />
          )}
          {nation === 'am' && (
            /* Glamorous sculpted blonde waves */
            <path
              d="M21 41 Q15 63 26 79 L74 79 Q85 63 79 41 Q72 24 50 24 Q28 24 21 41 Z"
              fill="#F5CE52"
              stroke={ink}
              strokeWidth="3"
            />
          )}
          {(nation === 'fr' || nation === 'ch') && (
            /* Sleek chin-length bob with inward tips */
            <path
              d="M25 40 Q22 59 30 68 L70 68 Q78 59 75 40 Z"
              fill="#1A1311"
              stroke={ink}
              strokeWidth="3"
            />
          )}
          {nation === 'tu' && (
            /* Patterned yellow silk headscarf drape with red/gold motif dots */
            <>
              <path
                d="M23 38 Q20 68 28 89 L72 89 Q80 68 77 38 Q68 24 50 24 Q32 24 23 38 Z"
                fill="#F2C14E"
                stroke={ink}
                strokeWidth="3"
              />
              <circle cx="29" cy="64" r="1.8" fill="#C83E31" />
              <circle cx="71" cy="64" r="1.8" fill="#C83E31" />
              <circle cx="31" cy="74" r="1.8" fill="#2E7D52" />
              <circle cx="69" cy="74" r="1.8" fill="#2E7D52" />
            </>
          )}
          {(nation === 'it' || nation === 'al' || nation === 'ru' || nation === 'in' || nation === 'en') && (
            /* High bun / updo silhouette */
            <>
              <circle
                cx={nation === 'in' || nation === 'ru' ? 69 : 50}
                cy={nation === 'in' || nation === 'ru' ? 52 : 22}
                r="10.8"
                fill={nation === 'al' ? '#8E5622' : nation === 'en' ? '#6D321C' : '#1E1512'}
                stroke={ink}
                strokeWidth="2.8"
              />
              <path
                d="M28 43 Q26 60 33 68 L67 68 Q74 60 72 43 Z"
                fill={nation === 'al' ? '#8E5622' : nation === 'en' ? '#6D321C' : '#1E1512'}
                stroke={ink}
                strokeWidth="2.8"
              />
            </>
          )}
        </g>
      )}

      {/* 4. SHOULDERS, CLOTHING & GENDER-DISTINCTIVE OUTFIT */}
      {nation === 'joker' ? (
        <g>
          <path
            d="M14 95 Q22 70 50 70 Q78 70 86 95 Z"
            fill={
              isFemale
                ? isAltJoker
                  ? '#8A3F5D'
                  : '#C83E31'
                : isAltJoker
                  ? '#2E7D52'
                  : '#1E4E8C'
            }
            stroke={ink}
            strokeWidth="3.2"
          />
          {/* Harlequin multi-pointed jester collar with brass bells */}
          <polygon points="22,75 34,92 45,73" fill="#F2C14E" stroke={ink} strokeWidth="2.5" />
          <polygon points="44,73 50,91 57,73" fill="#FFFDF8" stroke={ink} strokeWidth="2.5" />
          <polygon points="56,73 67,92 78,75" fill="#F2C14E" stroke={ink} strokeWidth="2.5" />
          <circle cx="34" cy="91" r="2.5" fill="#FFFDF8" stroke={ink} strokeWidth="1.6" />
          <circle cx="50" cy="90" r="2.3" fill="#C83E31" stroke={ink} strokeWidth="1.5" />
          <circle cx="67" cy="91" r="2.5" fill="#FFFDF8" stroke={ink} strokeWidth="1.6" />
        </g>
      ) : isFemale ? (
        /* FEMALE OUTFITS: Expressive necklines, turtleneck, sari border, dirndl, fur collar */
        <g>
          <path
            d="M16 95 Q23 71 50 71 Q77 71 84 95 Z"
            fill={
              nation === 'fr'
                ? '#E8B4B8'
                : nation === 'al'
                  ? '#7BA4C7'
                  : nation === 'in'
                    ? '#231712'
                    : nation === 'es'
                      ? '#C83E31'
                      : nation === 'ch'
                        ? '#264E42'
                        : nation === 'cu'
                          ? '#7A683A'
                          : nation === 'tu'
                            ? '#256B4E'
                            : nation === 'af'
                              ? '#3A2E28'
                              : '#2B2B2E'
            }
            stroke={ink}
            strokeWidth="3.2"
          />
          {/* Neck + subtle chin shadow */}
          <rect
            x="43"
            y="60"
            width="14"
            height="16"
            rx="5"
            fill={skin}
            stroke={ink}
            strokeWidth="2.6"
          />
          <path d="M44 65 Q50 69 56 65" fill="none" stroke={ink} strokeWidth="1.6" opacity="0.35" />

          {/* Nation-specific female collar details */}
          {nation === 'af' && (
            /* Double gold ring collar */
            <path d="M37 78 Q50 86 63 78" fill="none" stroke="#F2C14E" strokeWidth="4.2" strokeLinecap="round" />
          )}
          {nation === 'al' && (
            /* Bavarian ruffled collar & button */
            <>
              <path d="M34 75 Q50 85 66 75" fill="none" stroke="#FFFDF8" strokeWidth="3.8" strokeDasharray="4 2" />
              <circle cx="50" cy="83" r="2.4" fill="#F2C14E" stroke={ink} strokeWidth="1.4" />
            </>
          )}
          {nation === 'in' && (
            /* Crimson & gold sari drape across left shoulder */
            <path d="M22 95 L44 73 L64 95 Z" fill="#C83E31" stroke={ink} strokeWidth="2.4" />
          )}
          {nation === 'ru' && (
            /* Plush dark fur coat collar */
            <path d="M26 95 Q33 73 50 77 Q67 73 74 95 Z" fill="#3B2820" stroke={ink} strokeWidth="2.6" />
          )}
          {nation === 'es' && (
            /* Flamenco ruffled neckline */
            <path d="M33 77 Q41 84 50 78 Q59 84 67 77" fill="none" stroke="#F2C14E" strokeWidth="2.8" />
          )}
          {(nation === 'it' || nation === 'en' || nation === 'am') && (
            <g>
              <circle cx="40" cy="76" r="2.6" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
              <circle cx="46.5" cy="78.5" r="2.6" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
              <circle cx="53.5" cy="78.5" r="2.6" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
              <circle cx="60" cy="76" r="2.6" fill="#FFFDF8" stroke={ink} strokeWidth="1.5" />
            </g>
          )}
          {nation === 'fr' && (
            /* Chic ribbed turtleneck with vertical rib lines */
            <g>
              <rect
                x="39.5"
                y="65.5"
                width="21"
                height="13"
                rx="3"
                fill="#E8B4B8"
                stroke={ink}
                strokeWidth="2.5"
              />
              <line x1="45" y1="66.5" x2="45" y2="77.5" stroke={ink} strokeWidth="1.4" />
              <line x1="50" y1="66.5" x2="50" y2="77.5" stroke={ink} strokeWidth="1.4" />
              <line x1="55" y1="66.5" x2="55" y2="77.5" stroke={ink} strokeWidth="1.4" />
            </g>
          )}
          {nation === 'tu' && (
            /* Tied headscarf knot under chin */
            <path
              d="M35 71 Q50 82 65 71 L58 89 L42 89 Z"
              fill="#D97941"
              stroke={ink}
              strokeWidth="2.5"
            />
          )}
        </g>
      ) : (
        /* MALE OUTFITS: Broad shoulders, lapels, suit & tie, Bavarian checkered shirt, military/tunic collar */
        <g>
          <path
            d="M12 95 Q19 69 50 69 Q81 69 88 95 Z"
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
                          ? '#FFFDF8'
                          : nation === 'it'
                            ? '#EED9B8'
                            : nation === 'ru'
                              ? '#3A534E'
                              : nation === 'es'
                                ? '#1E242B'
                                : nation === 'tu'
                                  ? '#1E4E8C'
                                  : nation === 'en'
                                    ? '#1F242A'
                                    : '#7A583B'
            }
            stroke={ink}
            strokeWidth="3.2"
          />
          {/* Neck */}
          <rect
            x="42"
            y="59.5"
            width="16"
            height="16.5"
            rx="4"
            fill={skin}
            stroke={ink}
            strokeWidth="2.6"
          />
          {/* Suit V-neck & Tie for suited gentlemen */}
          {(nation === 'af' || nation === 'en' || nation === 'am' || nation === 'it' || nation === 'ru') && (
            <g>
              <polygon points="38,71 50,93 62,71" fill="#FFFDF8" stroke={ink} strokeWidth="2.3" />
              <polygon
                points="47.5,74 52.5,74 54.5,93 45.5,93"
                fill={nation === 'af' || nation === 'am' ? '#F2C14E' : nation === 'en' ? '#1E242B' : '#C83E31'}
                stroke={ink}
                strokeWidth="1.9"
              />
              {/* Jacket lapels */}
              <path d="M31 73 L41 92 M69 73 L59 92" stroke={ink} strokeWidth="2.2" />
            </g>
          )}
          {nation === 'al' && (
            /* Bavarian checkered shirt & suspender straps */
            <g>
              <path d="M30 74 L34 95 M70 74 L66 95" stroke="#FFFDF8" strokeWidth="4.5" />
              <path d="M38 78 L62 78 M40 85 L60 85" stroke="#FFFDF8" strokeWidth="1.8" />
            </g>
          )}
          {nation === 'es' && (
            /* Red & gold Spanish bolero vest trim */
            <g>
              <polygon points="36,72 45,95 24,95" fill="#C83E31" stroke={ink} strokeWidth="2.2" />
              <polygon points="64,72 55,95 76,95" fill="#C83E31" stroke={ink} strokeWidth="2.2" />
              <line x1="39" y1="75" x2="45" y2="93" stroke="#F2C14E" strokeWidth="2.4" />
              <line x1="61" y1="75" x2="55" y2="93" stroke="#F2C14E" strokeWidth="2.4" />
            </g>
          )}
          {nation === 'tu' && (
            /* Gold zig-zag embroidered collar */
            <path
              d="M36 74 L41 80 L46 74 L50 80 L54 74 L59 80 L64 74"
              fill="none"
              stroke="#F2C14E"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}
          {nation === 'fr' && (
            /* Checkered scarf + jacket lapels */
            <g>
              <path
                d="M38 71 Q50 80 62 71 L56 89 L44 89 Z"
                fill="#FFFDF8"
                stroke={ink}
                strokeWidth="2.3"
              />
              <path d="M42 75 L54 87 M58 75 L46 87" stroke={ink} strokeWidth="1.6" />
            </g>
          )}
        </g>
      )}

      {/* 5. EARS & EARRINGS (Large hoops/pearls/teardrops for females, hoop for Spanish male) */}
      <circle cx="28.5" cy="52" r="4.9" fill={skin} stroke={ink} strokeWidth="2.7" />
      <circle cx="71.5" cy="52" r="4.9" fill={skin} stroke={ink} strokeWidth="2.7" />
      {isFemale && (
        <>
          {nation === 'af' || nation === 'es' || nation === 'cu' ? (
            <>
              <circle cx="27.5" cy="59.5" r="5.4" fill="none" stroke="#F2C14E" strokeWidth="3" />
              <circle cx="72.5" cy="59.5" r="5.4" fill="none" stroke="#F2C14E" strokeWidth="3" />
            </>
          ) : nation === 'am' ? (
            /* Long turquoise teardrop earrings */
            <>
              <ellipse cx="27" cy="60.5" rx="2.6" ry="5.2" fill="#80CBC4" stroke={ink} strokeWidth="1.9" />
              <ellipse cx="73" cy="60.5" rx="2.6" ry="5.2" fill="#80CBC4" stroke={ink} strokeWidth="1.9" />
            </>
          ) : (
            <>
              <circle cx="27.5" cy="57.5" r="3.1" fill="#FFFDF8" stroke={ink} strokeWidth="1.9" />
              <circle cx="72.5" cy="57.5" r="3.1" fill="#FFFDF8" stroke={ink} strokeWidth="1.9" />
            </>
          )}
        </>
      )}
      {!isFemale && nation === 'es' && (
        <circle cx="27.5" cy="58.5" r="4.2" fill="none" stroke="#F2C14E" strokeWidth="2.6" />
      )}

      {/* 6. CARICATURE HEAD SHAPE (Varied silhouettes per character) */}
      <path d={headPath} fill={skin} stroke={ink} strokeWidth="3.3" />

      {/* Warm caricature cheek blush & subtle chin/cheekbones ink line */}
      <circle cx="36.5" cy="55" r="4.4" fill="#E6837E" opacity="0.58" />
      <circle cx="63.5" cy="55" r="4.4" fill="#E6837E" opacity="0.58" />
      <path d="M46 66.5 Q50 68.5 54 66.5" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />

      {/* Indian Bindi for Priya */}
      {isFemale && nation === 'in' && (
        <circle cx="50" cy="39" r="2.7" fill="#C83E31" stroke={ink} strokeWidth="1.3" />
      )}

      {/* 7. EYES, EYEBROWS & SUNGLASSES */}
      {nation === 'joker' ? (
        /* Harlequin mask */
        <g>
          <path
            d="M30.5 42 Q41 34.5 50 43 Q59 34.5 69.5 42 Q64 52.5 54 49 Q50 47 46 49 Q36 52.5 30.5 42 Z"
            fill={isFemale ? '#8A3F5D' : '#231712'}
            stroke={ink}
            strokeWidth="2.4"
          />
          <circle cx="41" cy="44" r="2.7" fill="#FFFDF8" />
          <circle cx="59" cy="44" r="2.7" fill="#FFFDF8" />
          {/* Harlequin cheek diamond */}
          <polygon points="62,53 65.5,56.5 62,60 58.5,56.5" fill="#C83E31" />
        </g>
      ) : nation === 'cu' || (!isFemale && nation === 'am') ? (
        /* Cool dark sunglasses (Cuba M/F & America Cowboy M) */
        <g>
          <rect x="32" y="41" width="16" height="11" rx="3" fill="#181D23" stroke={ink} strokeWidth="2.6" />
          <rect x="52" y="41" width="16" height="11" rx="3" fill="#181D23" stroke={ink} strokeWidth="2.6" />
          <line x1="48" y1="45" x2="52" y2="45" stroke={ink} strokeWidth="2.6" />
          <line x1="34.5" y1="43.5" x2="40.5" y2="49.5" stroke="#FFFDF8" strokeWidth="1.9" strokeLinecap="round" />
          <line x1="54.5" y1="43.5" x2="60.5" y2="49.5" stroke="#FFFDF8" strokeWidth="1.9" strokeLinecap="round" />
        </g>
      ) : isFemale && nation === 'am' ? (
        /* Pink Cat-Eye Sunglasses for American Female */
        <g>
          <path
            d="M28.5 39.5 L47.5 44 L45 51.5 L32 50 Z"
            fill="#F48FB1"
            stroke={ink}
            strokeWidth="2.5"
          />
          <path
            d="M71.5 39.5 L52.5 44 L55 51.5 L68 50 Z"
            fill="#F48FB1"
            stroke={ink}
            strokeWidth="2.5"
          />
          <polygon points="33,43.5 43,45.5 41.5,49.5 34.5,48.5" fill="#231712" />
          <polygon points="67,43.5 57,45.5 58.5,49.5 65.5,48.5" fill="#231712" />
          <line x1="35" y1="44.5" x2="38" y2="48" stroke="#FFFDF8" strokeWidth="1.5" />
          <line x1="59" y1="44.5" x2="62" y2="48" stroke="#FFFDF8" strokeWidth="1.5" />
        </g>
      ) : !isFemale && nation === 'ch' ? (
        /* Happy squinted laughing eyes for Chinese Male (as in classic caricature) */
        <g>
          <path d="M35.5 45 Q41.5 40.5 46.5 45" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M53.5 45 Q58.5 40.5 64.5 45" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M35 38 Q41.5 34 47 38.5" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M53 38.5 Q58.5 34 65 38" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
        </g>
      ) : (
        /* Expressive 3/4 Cartoon Eyes with scleras, side-glancing pupils & eyelashes/brows */
        <g>
          <ellipse cx="41.5" cy="46" rx="4.9" ry="5.6" fill="#FFFDF8" stroke={ink} strokeWidth="2.4" />
          <ellipse cx="58.5" cy="46" rx="4.9" ry="5.6" fill="#FFFDF8" stroke={ink} strokeWidth="2.4" />
          {/* Half-lidded ironic eyelids for French/Italian/Russian/English/Spanish */}
          {(nation === 'fr' || nation === 'it' || nation === 'ru' || nation === 'en' || nation === 'es') && (
            <>
              <path d="M36.8 44.6 H46.4" stroke={ink} strokeWidth="2.4" />
              <path d="M53.6 44.6 H63.2" stroke={ink} strokeWidth="2.4" />
            </>
          )}
          <circle cx="42.5" cy="46.8" r="2.5" fill={ink} />
          <circle cx="58.3" cy="46.8" r="2.5" fill={ink} />
          <circle cx="43.3" cy="45.9" r="0.95" fill="#FFFDF8" />
          <circle cx="59.1" cy="45.9" r="0.95" fill="#FFFDF8" />

          {isFemale ? (
            /* Prominent Female Eyelashes + Arched Expressive Brows */
            <>
              <path d="M36.5 43 L33.2 39.2 M38.8 40.8 L36.5 37.5" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M63.5 43 L66.8 39.2 M61.2 40.8 L63.5 37.5" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M35.5 37.5 Q41.5 32.8 47 37.8" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
              <path d="M53 37.8 Q58.5 32.8 64.5 37.2" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            </>
          ) : (
            /* Thick Asymmetric Expressive Male Eyebrows */
            <>
              <path
                d="M34.5 38 Q41.5 33.8 47 38.8"
                fill="none"
                stroke={nation === 'al' || nation === 'en' ? '#FFFDF8' : ink}
                strokeWidth="3.8"
                strokeLinecap="round"
              />
              <path
                d="M53 38.2 Q59 33.2 65.5 37.2"
                fill="none"
                stroke={nation === 'al' || nation === 'en' ? '#FFFDF8' : ink}
                strokeWidth="3.8"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      )}

      {/* 8. EXPRESSIVE ASYMMETRIC 3/4 CARICATURE NOSE */}
      <path
        d={nosePath}
        fill={skin}
        stroke={ink}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 9. MOUTH, RUBY LIPS (FEMALE) OR BEARDS/MUSTACHES/CIGARS/PIPES (MALE) */}
      {isFemale ? (
        /* Distinct Female Painted Lips & Ironic Café Smile */
        <g>
          {nation === 'ch' ? (
            /* Cheerful wide grin for Chinese female */
            <>
              <path d="M40 58.5 Q50 66.5 60 58.5 Z" fill="#FFFDF8" stroke={ink} strokeWidth="2.3" />
              <line x1="44" y1="61" x2="56" y2="61" stroke={ink} strokeWidth="1.3" />
            </>
          ) : nation === 'am' ? (
            /* Glamorous surprised O-shaped ruby lipstick mouth */
            <>
              <ellipse cx="49" cy="61" rx="5.2" ry="4.5" fill="#C83E31" stroke={ink} strokeWidth="2.1" />
              <ellipse cx="49" cy="61" rx="2.6" ry="1.8" fill="#FFFDF8" />
            </>
          ) : (
            <>
              <path
                d="M41 60 Q46 56.5 50 58.8 Q54 56.5 59 60 Q50 66.8 41 60 Z"
                fill="#C83E31"
                stroke={ink}
                strokeWidth="2.2"
              />
              <path d="M42.8 60 Q50 62.4 57.2 60" fill="none" stroke="#FFFDF8" strokeWidth="1.4" />
            </>
          )}
          {/* French lady's thin café cigarette holder + wisp */}
          {nation === 'fr' && (
            <>
              <line x1="53" y1="61.5" x2="67" y2="66.5" stroke="#FFFDF8" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="53" y1="61.5" x2="67" y2="66.5" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
              <path d="M69 63 Q73 57 69 51" fill="none" stroke="#FFFDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            </>
          )}
        </g>
      ) : (
        /* Distinct Male Beards, Mustaches, Cigars & Pipes */
        <g>
          {nation === 'al' && (
            /* Full fluffy white Bavarian beard & mustache */
            <path
              d="M29 52.5 Q26 74.5 50 77.5 Q74 74.5 71 52.5 Q60 58 50 55 Q40 58 29 52.5 Z"
              fill="#FFFDF8"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'cu' && (
            /* Full dark Cuban beard + big lit cigar + smoke wisp */
            <>
              <path
                d="M29.5 52 Q28.5 73.5 50 75.5 Q71.5 73.5 70.5 52 Q59 56 50 54 Q41 56 29.5 52 Z"
                fill="#231712"
                stroke={ink}
                strokeWidth="2.6"
              />
              <rect x="17" y="56" width="24" height="6" rx="2.2" fill="#5C3A21" stroke={ink} strokeWidth="2.2" />
              <circle cx="17" cy="59" r="2.5" fill="#E67E22" />
              <path d="M16 53 Q12 46 18 40" fill="none" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            </>
          )}
          {nation === 'in' && (
            /* Groomed black beard + curled maharaja mustache */
            <>
              <path
                d="M32 53 Q33 71.5 50 73.5 Q67 71.5 68 53 Q58 62 50 62 Q42 62 32 53 Z"
                fill="#1E1410"
                stroke={ink}
                strokeWidth="2.4"
              />
              <path
                d="M34.5 56 Q43 50.5 50 56 Q57 50.5 65.5 56"
                fill="none"
                stroke="#1E1410"
                strokeWidth="3.8"
                strokeLinecap="round"
              />
            </>
          )}
          {(nation === 'fr' || nation === 'it' || nation === 'es' || nation === 'tu' || nation === 'joker') && (
            /* Distinct Handlebar / Pencil Mustaches + Smirks */
            <>
              <path
                d={
                  nation === 'es'
                    ? 'M41 58 Q45.5 52.5 50 57.5 Q54.5 52.5 59 58'
                    : nation === 'tu'
                      ? 'M33 57 Q43 51.5 50 56 Q57 51.5 67 57'
                      : 'M36.5 57 Q44 53 50 57 Q56 53 63.5 57'
                }
                fill="none"
                stroke={ink}
                strokeWidth={nation === 'es' || nation === 'tu' ? '4.5' : '3.4'}
                strokeLinecap="round"
              />
              <path
                d="M42.5 62 Q50 66.8 58 61.5"
                fill="none"
                stroke={ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {nation === 'fr' && (
                <>
                  <line x1="43" y1="62" x2="31" y2="67" stroke="#FFFDF8" strokeWidth="3.2" strokeLinecap="round" />
                  <line x1="43" y1="62" x2="31" y2="67" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M29 63 Q25 56 30 50" fill="none" stroke="#FFFDF8" strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
                </>
              )}
            </>
          )}
          {nation === 'en' && (
            /* White walrus mustache + curved briar pipe + smoke wisp */
            <>
              <path
                d="M34.5 57 Q44 51 50 57 Q56 51 65.5 57"
                fill="none"
                stroke="#FFFDF8"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M34.5 57 Q44 51 50 57 Q56 51 65.5 57"
                fill="none"
                stroke={ink}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M42 61 Q27 65 25 57" fill="none" stroke="#5C3A21" strokeWidth="3.8" strokeLinecap="round" />
              <rect x="19.5" y="50" width="8" height="10" rx="2.2" fill="#5C3A21" stroke={ink} strokeWidth="2.2" />
              <path d="M23.5 47 Q20 40 25 35" fill="none" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            </>
          )}
          {(nation === 'af' || nation === 'ch' || nation === 'am' || nation === 'ru') && (
            /* Big expressive toothy grin (plus cigar for American cowboy) */
            <>
              <path
                d="M38 56.5 Q50 68 62 56.5 Z"
                fill="#FFFDF8"
                stroke={ink}
                strokeWidth="2.6"
              />
              <line x1="43.5" y1="60" x2="56.5" y2="60" stroke={ink} strokeWidth="1.5" />
              <line x1="47" y1="57.5" x2="47" y2="63" stroke={ink} strokeWidth="1.2" />
              <line x1="53" y1="57.5" x2="53" y2="63" stroke={ink} strokeWidth="1.2" />
              {nation === 'am' && (
                <>
                  <rect x="18" y="57.5" width="22" height="5.5" rx="2" fill="#5C3A21" stroke={ink} strokeWidth="2.1" />
                  <path d="M17 54 Q14 48 19 43" fill="none" stroke="#FFFDF8" strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
                </>
              )}
            </>
          )}
        </g>
      )}

      {/* 10. HATS, HAIR TOPS & ICONIC HEADGEAR */}
      {nation === 'joker' ? (
        /* Harlequin Jester Hat / Carnival Crown (distinct for 2M + 2F) */
        <g>
          <path
            d="M23 34 Q13 9 38 22 Q50 5 62 22 Q87 9 77 34 Z"
            fill={
              isFemale
                ? isAltJoker
                  ? '#8A3F5D'
                  : '#E0A526'
                : isAltJoker
                  ? '#1E4E8C'
                  : '#C83E31'
            }
            stroke={ink}
            strokeWidth="2.9"
          />
          <circle cx="19" cy="14.5" r="4.6" fill="#F2C14E" stroke={ink} strokeWidth="2.2" />
          <circle cx="50" cy="9.5" r="4.6" fill="#2E7D52" stroke={ink} strokeWidth="2.2" />
          <circle cx="81" cy="14.5" r="4.6" fill="#1E4E8C" stroke={ink} strokeWidth="2.2" />
        </g>
      ) : isFemale ? (
        /* FEMALE HATS & HAIRSTYLES */
        <g>
          {nation === 'fr' && (
            /* Tilted pink/red French beret + bangs */
            <>
              <path d="M31 35 Q50 29 69 35 L67 40 Q50 36 33 40 Z" fill="#1E1614" stroke={ink} strokeWidth="2.2" />
              <path
                d="M23 31 Q44 13 75 26 Q66 36 27 34 Z"
                fill="#E8999E"
                stroke={ink}
                strokeWidth="2.8"
              />
              <path d="M50 18.5 L54 13.5" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {nation === 'ch' && (
            /* Olive cap with red star over bangs */
            <>
              <path
                d="M26 32 Q50 17 74 32 L69 37 Q50 33 31 37 Z"
                fill="#264E42"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="26.5" r="3.6" fill="#C83E31" />
            </>
          )}
          {nation === 'cu' && (
            /* Olive cap over curls */
            <path
              d="M27 31 L32 19.5 L68 19.5 L73 31 Z"
              fill="#6E5A38"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'es' && (
            /* Wavy parted hair + big red flamenco rose + peineta */
            <>
              <path d="M43 16 L57 16 L55 28 L45 28 Z" fill="#C9A227" stroke={ink} strokeWidth="2" />
              <path d="M30 38 Q42 25 50 33 Q58 25 70 38" fill="#1E1410" stroke={ink} strokeWidth="2.6" />
              <circle cx="33.5" cy="30" r="7.2" fill="#C83E31" stroke={ink} strokeWidth="2.4" />
              <circle cx="33.5" cy="30" r="2.8" fill="#F2C14E" />
            </>
          )}
          {nation === 'ru' && (
            /* Plush dark fur hat with gold pin */
            <>
              <rect
                x="26"
                y="17.5"
                width="48"
                height="18.5"
                rx="8"
                fill="#3B2820"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="26.5" r="3" fill="#F2C14E" stroke={ink} strokeWidth="1.5" />
            </>
          )}
          {nation === 'en' && (
            /* Classic British cloche tea hat with ribbon */
            <>
              <path
                d="M26 33 Q50 14 74 33 Z"
                fill="#232931"
                stroke={ink}
                strokeWidth="2.8"
              />
              <line x1="20" y1="33" x2="80" y2="33" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
              <circle cx="64" cy="29" r="3.5" fill="#C83E31" stroke={ink} strokeWidth="1.5" />
            </>
          )}
          {nation === 'am' && (
            /* Curly blonde hair top */
            <path
              d="M25 36 Q32 17 46 23 Q56 15 68 24 Q77 30 72 38 Q56 32 29 36 Z"
              fill="#F2C84B"
              stroke={ink}
              strokeWidth="2.6"
            />
          )}
          {(nation === 'af' || nation === 'al' || nation === 'in' || nation === 'it' || nation === 'tu') && (
            /* Parted hair top */
            <path
              d="M30 38 Q40 23.5 50 31 Q60 23.5 70 38 Q58 31 50 34 Q42 31 30 38 Z"
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
              d="M27 38 L28 19.5 Q50 16.5 72 19.5 L73 38 Q50 32 27 38 Z"
              fill="#1E1410"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'ch' && (
            /* Green peaked cap with red star */
            <>
              <path
                d="M26 32 Q50 15.5 74 32 L69 37 Q50 32 31 37 Z"
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
              d="M26 32 L31 18.5 L69 18.5 L74 32 Z"
              fill="#6E5A38"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'fr' && (
            /* Classic black French beret tilted */
            <>
              <path
                d="M24 31 Q48 12.5 76 26 Q66 36 27 34 Z"
                fill="#1E242B"
                stroke={ink}
                strokeWidth="2.8"
              />
              <path d="M51 17.5 L55 12.5" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
          {nation === 'al' && (
            /* Bavarian Tyrolean hat with white feather */
            <>
              <path d="M28 31 L35 15.5 L65 15.5 L72 31 Z" fill="#2D3B36" stroke={ink} strokeWidth="2.8" />
              <line x1="21" y1="31" x2="79" y2="31" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
              <path d="M62 24 Q70 11.5 66 7.5" fill="none" stroke="#FFF9F0" strokeWidth="3.6" strokeLinecap="round" />
            </>
          )}
          {nation === 'in' && (
            /* Large pleated magenta/pink Indian turban with jewel */
            <>
              <path
                d="M21 36 Q23 13.5 50 15.5 Q77 13.5 79 36 Q64 28 50 33 Q36 28 21 36 Z"
                fill="#C84B73"
                stroke={ink}
                strokeWidth="2.8"
              />
              <circle cx="50" cy="24.5" r="3.8" fill="#F2C14E" stroke={ink} strokeWidth="1.8" />
            </>
          )}
          {nation === 'it' && (
            /* Stylish Italian Borsalino fedora hat */
            <>
              <path d="M28 31 L34 15.5 L66 15.5 L72 31 Z" fill="#3B444B" stroke={ink} strokeWidth="2.8" />
              <rect x="31" y="26" width="38" height="4" fill="#EED9B8" />
              <line x1="19" y1="31" x2="81" y2="31" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
            </>
          )}
          {nation === 'ru' && (
            /* Tall brown fur ushanka hat */
            <rect
              x="26"
              y="14.5"
              width="48"
              height="20.5"
              rx="6"
              fill="#4E3429"
              stroke={ink}
              strokeWidth="2.8"
            />
          )}
          {nation === 'es' && (
            /* Wide flat-brimmed Spanish Cordoban hat */
            <>
              <rect x="33" y="16.5" width="34" height="13.5" rx="2" fill="#5C2D24" stroke={ink} strokeWidth="2.6" />
              <ellipse cx="50" cy="31" rx="34" ry="5.2" fill="#5C2D24" stroke={ink} strokeWidth="2.8" />
            </>
          )}
          {nation === 'tu' && (
            /* Red Turkish Fez hat with black tassel */
            <>
              <polygon points="35,32 39.5,14.5 60.5,14.5 65,32" fill="#C83E31" stroke={ink} strokeWidth="2.8" />
              <path d="M60.5 15.5 Q68.5 19.5 67.5 28" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
            </>
          )}
          {nation === 'en' && (
            /* Classic English Bowler Hat */
            <>
              <path d="M30 30 Q30 13.5 50 13.5 Q70 13.5 70 30 Z" fill="#1E242B" stroke={ink} strokeWidth="2.8" />
              <line x1="23" y1="30" x2="77" y2="30" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
            </>
          )}
          {nation === 'am' && (
            /* Big Texan Cowboy Stetson Hat */
            <>
              <path
                d="M30 30 L36.5 14.5 L50 18.5 L63.5 14.5 L70 30 Z"
                fill="#7D8892"
                stroke={ink}
                strokeWidth="2.6"
              />
              <path
                d="M15 28 Q50 36.5 85 28"
                fill="none"
                stroke={ink}
                strokeWidth="4.6"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      )}

      {/* 11. FOREGROUND CAFÉ PROPS (Fan for Spanish lady, espresso cup for Italian/French/Turkish, newspaper corner for English) */}
      {isFemale && nation === 'es' && !sipping && (
        <path
          d="M62 88 L79 74 A16 16 0 0 1 86 90 Z"
          fill="#C83E31"
          stroke={ink}
          strokeWidth="2.2"
        />
      )}
      {!isFemale && nation === 'fr' && !sipping && (
        <g transform="translate(68, 76)">
          <rect x="0" y="0" width="16" height="12" rx="2" fill="#FFF9F0" stroke={ink} strokeWidth="2" />
          <line x1="3" y1="4" x2="13" y2="4" stroke={ink} strokeWidth="1.5" />
          <line x1="3" y1="8" x2="11" y2="8" stroke={ink} strokeWidth="1.5" />
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

export function CafetuliaLogo({
  compact = false,
  hideTextOnMobile = false,
}: {
  compact?: boolean;
  hideTextOnMobile?: boolean;
}): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <svg
        width={compact ? 28 : 42}
        height={compact ? 28 : 42}
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
          stroke="#231712"
          strokeWidth="2.8"
        />
        <path
          d="M14 24 L50 24 L46 46 Q44 52 32 52 Q20 52 18 46 Z"
          fill="#FFF9F0"
          stroke="#231712"
          strokeWidth="3"
        />
        <path d="M16 32 L48 32 L47 38 L17 38 Z" fill="#C96F4A" />
        <path
          d="M49 28 Q60 28 58 38 Q56 45 46 43"
          fill="none"
          stroke="#231712"
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
      <div className={hideTextOnMobile ? 'hidden sm:block' : 'block'}>
        <span
          className={`font-serif font-bold tracking-tight text-[#3E2F2A] block leading-none ${
            compact ? 'text-lg sm:text-xl' : 'text-3xl sm:text-4xl'
          }`}
        >
          Cafetulia
        </span>
      </div>
    </div>
  );
}
