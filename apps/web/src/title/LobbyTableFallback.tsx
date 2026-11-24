import React from 'react';

export function LobbyTableFallback(): React.ReactElement {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 320 230"
        aria-hidden="true"
        className="h-full max-h-[220px] w-auto drop-shadow-[0_16px_20px_rgba(0,0,0,0.3)]"
      >
        <ellipse cx="160" cy="198" rx="105" ry="16" fill="#1E130E" opacity="0.35" />
        <path d="M82 128h156l-12 54H94z" fill="#6B4128" />
        <ellipse cx="160" cy="126" rx="108" ry="24" fill="#8A5B3A" />
        <ellipse cx="160" cy="122" rx="98" ry="20" fill="#FFF8EC" />
        <ellipse cx="160" cy="122" rx="82" ry="15" fill="none" stroke="#C8A12A" strokeWidth="1.2" opacity="0.6" />
        <g transform="translate(160 64)">
          <rect x="-31" y="0" width="62" height="98" rx="14" fill="#B68950" />
          <rect x="-26" y="14" width="52" height="66" fill="#FFF8EC" />
          <rect x="-21" y="19" width="42" height="56" fill="none" stroke="#B8512F" strokeWidth="0.8" opacity="0.55" />
          <text x="0" y="37" textAnchor="middle" fill="#2B1710" fontSize="6" fontWeight="800" fontFamily="Fraunces, serif" letterSpacing="1">
            CAFETULIA
          </text>
          <text x="0" y="55" textAnchor="middle" fill="#2B1710" fontSize="14" fontWeight="800" fontFamily="Fraunces, serif">
            Tertulia
          </text>
          <text x="0" y="65" textAnchor="middle" fill="#B8512F" fontSize="4" fontWeight="800" fontFamily="Nunito Sans, sans-serif" letterSpacing="1">
            MESA PREPARADA
          </text>
          <ellipse cx="0" cy="-3" rx="22" ry="4" fill="#D7AD72" />
          <circle cx="0" cy="-7" r="4" fill="#7A542F" />
        </g>
        <g transform="translate(238 108) scale(0.65)">
          <ellipse cx="0" cy="18" rx="26" ry="4" fill="#FFF8EC" opacity="0.7" />
          <path d="M-16 0h32l-3 20a13 13 0 0 1-26 0z" fill="#FFF8EC" stroke="#2B1710" strokeWidth="1.2" />
          <ellipse cx="0" cy="0" rx="16" ry="3" fill="#4B2A17" />
        </g>
        {[
          [72, 132],
          [82, 144],
          [242, 136],
          [228, 148],
          [110, 152],
          [210, 158],
        ].map(([x, y], index) => (
          <ellipse
            key={index}
            cx={x}
            cy={y}
            rx="5"
            ry="7"
            fill="#4B2A17"
            transform={`rotate(${index * 42} ${x} ${y})`}
          />
        ))}
      </svg>
    </div>
  );
}
