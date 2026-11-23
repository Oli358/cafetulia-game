import React from 'react';

type CatProps = {
  reducedMotion: boolean;
};

/** Gato siamés: cuerpo crema, máscara, orejas, patas y cola marrones. */
export function SiameseCat({ reducedMotion }: CatProps): React.ReactElement {
  return (
    <svg viewBox="0 0 130 95" className="block w-full" aria-hidden="true">
      <ellipse cx="66" cy="88" rx="45" ry="5" fill="#0B1D17" opacity="0.28" />
      <path d="M31 60 Q30 38 51 28 Q70 18 88 31 Q102 42 101 64 Q89 79 64 80 Q40 78 31 60 Z" fill="#E9D8BC" stroke="#0B1D17" strokeWidth="3" />
      <path d="M34 63 Q30 75 42 82 Q55 87 68 84 Q48 79 34 63 Z" fill="#F1E7D5" opacity="0.8" />
      <path d="M31 48 Q18 45 12 32 Q14 23 22 25 Q26 31 33 35" fill="none" stroke="#E9D8BC" strokeWidth="8" strokeLinecap="round" className={reducedMotion ? '' : 'animate-cafe-tail'} />
      <path d="M12 32 Q9 25 14 22" fill="none" stroke="#4A342A" strokeWidth="7" strokeLinecap="round" />
      <circle cx="91" cy="39" r="20" fill="#E9D8BC" stroke="#0B1D17" strokeWidth="3" />
      <path d="M75 27 L75 13 L88 23 Z" fill="#4A342A" stroke="#0B1D17" strokeWidth="2.5" />
      <path d="M100 24 L111 16 L110 32 Z" fill="#4A342A" stroke="#0B1D17" strokeWidth="2.5" />
      <path d="M89 27 Q100 21 108 30 Q104 51 92 56 Q79 51 76 35 Q81 28 89 27 Z" fill="#4A342A" opacity="0.95" />
      <path d="M81 40 Q85 36 89 40" fill="none" stroke="#A9D8D1" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M96 40 Q100 36 104 40" fill="none" stroke="#A9D8D1" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M91 48 Q94 50 97 48" fill="none" stroke="#E9D8BC" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37 58 Q47 65 57 60" fill="none" stroke="#C8A12A" strokeWidth="2.5" />
      <circle cx="55" cy="61" r="2.2" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.2" />
      <path d="M42 76 Q49 82 54 78 M63 80 Q69 84 73 78" fill="none" stroke="#4A342A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Gato común de pelaje marrón oscuro y negro, con pecho claro. */
export function DarkCat({ reducedMotion }: CatProps): React.ReactElement {
  return (
    <svg viewBox="0 0 130 80" className="block w-full" aria-hidden="true">
      <ellipse cx="65" cy="72" rx="45" ry="5" fill="#0B1D17" opacity="0.3" />
      <ellipse cx="64" cy="50" rx="40" ry="20" fill="#241915" stroke="#0B1D17" strokeWidth="3" />
      <path d="M37 43 Q62 29 87 43 Q78 57 63 56 Q48 56 37 43 Z" fill="#4A3327" opacity="0.75" />
      <path d="M24 55 Q7 53 9 34 Q11 22 21 25" fill="none" stroke="#241915" strokeWidth="8" strokeLinecap="round" className={reducedMotion ? '' : 'animate-cafe-tail'} />
      <circle cx="91" cy="38" r="19" fill="#241915" stroke="#0B1D17" strokeWidth="3" />
      <path d="M76 25 L79 11 L89 22 Z" fill="#241915" stroke="#0B1D17" strokeWidth="2.5" />
      <path d="M99 21 L108 13 L109 29 Z" fill="#241915" stroke="#0B1D17" strokeWidth="2.5" />
      <path d="M82 39 Q86 36 89 39" fill="none" stroke="#D7C5A7" strokeWidth="2" strokeLinecap="round" />
      <path d="M96 39 Q99 36 102 39" fill="none" stroke="#D7C5A7" strokeWidth="2" strokeLinecap="round" />
      <path d="M88 46 Q93 49 98 45" fill="none" stroke="#E9D8BC" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M77 44 Q91 50 105 43" fill="none" stroke="#C8A12A" strokeWidth="2.4" />
      <circle cx="90" cy="47" r="2.2" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.2" />
      <path d="M52 35 Q57 32 62 35" fill="none" stroke="#6E5A4E" strokeWidth="1.6" opacity="0.65" />
      <path d="M43 59 Q51 65 57 60 M63 61 Q70 66 76 60" fill="none" stroke="#241915" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
