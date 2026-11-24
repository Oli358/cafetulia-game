import React from 'react';

type Paper = {
  left: string;
  top: string;
  width: number;
  rotate: number;
  blur: number;
  opacity: number;
  duration: number;
  delay: number;
  title: string;
  subtitle: string;
  mobileHidden?: boolean;
};

const papers: Paper[] = [
  {
    left: '48%',
    top: '5%',
    width: 260,
    rotate: -14,
    blur: 1.1,
    opacity: 0.86,
    duration: 31,
    delay: -4,
    title: 'Cafetulia',
    subtitle: 'Salón de té · O & A',
  },
  {
    left: '72%',
    top: '17%',
    width: 210,
    rotate: 11,
    blur: 2.2,
    opacity: 0.74,
    duration: 37,
    delay: -13,
    title: 'Reserva',
    subtitle: 'Mesa 07 · 4 comensales',
  },
  {
    left: '34%',
    top: '29%',
    width: 170,
    rotate: 19,
    blur: 4.5,
    opacity: 0.58,
    duration: 29,
    delay: -7,
    title: 'Carta',
    subtitle: 'Tertulia de la tarde',
    mobileHidden: true,
  },
  {
    left: '3%',
    top: '16%',
    width: 220,
    rotate: -9,
    blur: 0.8,
    opacity: 0.88,
    duration: 33,
    delay: -16,
    title: 'Comanda',
    subtitle: 'Café · tarta · sobremesa',
  },
  {
    left: '8%',
    top: '58%',
    width: 250,
    rotate: 13,
    blur: 2,
    opacity: 0.76,
    duration: 36,
    delay: -2,
    title: 'Nota de cata',
    subtitle: 'Caramelo y naranja',
  },
  {
    left: '78%',
    top: '51%',
    width: 230,
    rotate: -12,
    blur: 1.6,
    opacity: 0.78,
    duration: 27,
    delay: -11,
    title: 'Cafetulia',
    subtitle: 'Tertulia internacional',
    mobileHidden: true,
  },
  {
    left: '58%',
    top: '72%',
    width: 190,
    rotate: 8,
    blur: 4.2,
    opacity: 0.56,
    duration: 34,
    delay: -19,
    title: 'Mesa 03',
    subtitle: 'Reservado · 20:30',
    mobileHidden: true,
  },
  {
    left: '24%',
    top: '73%',
    width: 170,
    rotate: -16,
    blur: 1.8,
    opacity: 0.7,
    duration: 28,
    delay: -6,
    title: 'Cafetulia',
    subtitle: 'Mezcla de la casa',
  },
  {
    left: '43%',
    top: '46%',
    width: 280,
    rotate: -4,
    blur: 5.5,
    opacity: 0.48,
    duration: 40,
    delay: -22,
    title: 'Comanda',
    subtitle: 'Para la mesa de la ventana',
    mobileHidden: true,
  },
];

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function FloatingMenuPapers({ progress }: { progress: number }): React.ReactElement {
  const opacity = 1 - smoothstep(0.18, 0.5, progress);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[4] overflow-hidden"
      style={{ opacity }}
    >
      {papers.map((paper, index) => (
        <div
          key={`${paper.title}-${index}`}
          className={`floating-paper absolute ${paper.mobileHidden ? 'hidden sm:block' : 'block'}`}
          style={{
            left: paper.left,
            top: paper.top,
            width: paper.width,
            opacity: paper.opacity,
            filter: `blur(${paper.blur}px)`,
            ['--paper-rotate' as string]: `${paper.rotate}deg`,
            animationDuration: `${paper.duration}s`,
            animationDelay: `${paper.delay}s`,
          }}
        >
          <div className="floating-paper-head">
            <span>{paper.title}</span>
            <span className="floating-paper-stamp">O &amp; A</span>
          </div>
          <div className="floating-paper-lines" />
          <div className="floating-paper-foot">{paper.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
