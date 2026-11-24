import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three';
import { MENU_MODES, type MenuModeConfig } from './menuModes';

const LABEL_WIDTH = 3072;
const LABEL_HEIGHT = 1024;
const PANEL_WIDTH = LABEL_WIDTH / 3;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function drawCupMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  ink: string,
  accent: string,
  paper: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';

  // Saucer
  ctx.beginPath();
  ctx.ellipse(32, 52, 24, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.stroke();

  // Cup body
  ctx.beginPath();
  ctx.moveTo(14, 24);
  ctx.lineTo(50, 24);
  ctx.lineTo(46, 46);
  ctx.quadraticCurveTo(44, 52, 32, 52);
  ctx.quadraticCurveTo(20, 52, 18, 46);
  ctx.closePath();
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.stroke();

  // Accent band
  ctx.beginPath();
  ctx.moveTo(16, 32);
  ctx.lineTo(48, 32);
  ctx.lineTo(47, 38);
  ctx.lineTo(17, 38);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.fill();

  // Handle
  ctx.beginPath();
  ctx.moveTo(49, 28);
  ctx.quadraticCurveTo(60, 28, 58, 38);
  ctx.quadraticCurveTo(56, 45, 46, 43);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Steam
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(25, 18);
  ctx.quadraticCurveTo(23, 12, 27, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(35, 19);
  ctx.quadraticCurveTo(33, 11, 38, 7);
  ctx.stroke();

  ctx.restore();
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  mode: MenuModeConfig,
  panelIndex: number,
): void {
  const x = panelIndex * PANEL_WIDTH;
  const theme = mode.theme;
  // The label is always cream paper, so its ink is always espresso even for
  // the night mode whose page-level ink is cream.
  const ink = '#2B1710';
  const random = seededRandom(101 + panelIndex * 37);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, 0, PANEL_WIDTH, LABEL_HEIGHT);
  ctx.clip();

  const background = ctx.createLinearGradient(x, 0, x, LABEL_HEIGHT);
  background.addColorStop(0, theme.paper);
  background.addColorStop(0.6, theme.paper);
  background.addColorStop(1, theme.accentSoft);
  ctx.fillStyle = background;
  ctx.fillRect(x, 0, PANEL_WIDTH, LABEL_HEIGHT);

  // Cotton-paper grain
  for (let i = 0; i < 1650; i += 1) {
    const px = x + random() * PANEL_WIDTH;
    const py = random() * LABEL_HEIGHT;
    const alpha = 0.025 + random() * 0.045;
    ctx.fillStyle = `rgba(62, 47, 42, ${alpha})`;
    ctx.fillRect(px, py, 1.2, 1.2);
  }

  // Panel frame: two fine editorial rules
  ctx.strokeStyle = `${theme.accent}66`;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 38, 38, PANEL_WIDTH - 76, LABEL_HEIGHT - 76);
  ctx.strokeStyle = `${theme.accent}33`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 52, 52, PANEL_WIDTH - 104, LABEL_HEIGHT - 104);

  // Header seal
  drawCupMark(ctx, x + 70, 78, 0.82, ink, theme.accent, theme.paper);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ink;
  ctx.font = '700 42px Fraunces, Georgia, serif';
  ctx.fillText('CAFETULIA', x + 150, 100);
  ctx.fillStyle = `${ink}aa`;
  ctx.font = '700 17px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText('SALÓN DE TÉ Y TERTULIA INTERNACIONAL', x + 152, 132);

  // Blend name
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = '700 132px Fraunces, Georgia, serif';
  ctx.fillText(mode.blend, x + PANEL_WIDTH / 2, 345);

  // Mode / action
  ctx.fillStyle = theme.accent;
  ctx.font = '800 30px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText(mode.tab.toUpperCase(), x + PANEL_WIDTH / 2, 430);

  // Rule
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + PANEL_WIDTH / 2 - 150, 470);
  ctx.lineTo(x + PANEL_WIDTH / 2 + 150, 470);
  ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(x + PANEL_WIDTH / 2, 470, 5, 0, Math.PI * 2);
  ctx.fill();

  // Notes
  ctx.fillStyle = `${ink}cc`;
  ctx.font = '600 28px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText(mode.blendNote, x + PANEL_WIDTH / 2, 528);
  ctx.font = '600 20px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText('MEZCLA DE LA CASA · O & A', x + PANEL_WIDTH / 2, 576);

  // Large ghost numeral
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = theme.accent;
  ctx.font = '800 360px Fraunces, Georgia, serif';
  ctx.fillText(`0${panelIndex + 1}`, x + PANEL_WIDTH / 2, 790);
  ctx.restore();

  // Bottom reservation strip
  ctx.fillStyle = ink;
  ctx.font = '800 20px "Nunito Sans", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RESERVA DE LA CASA', x + 76, 900);
  ctx.textAlign = 'right';
  ctx.fillText('250 g', x + PANEL_WIDTH - 76, 900);

  // Small brass seal
  const sealX = x + PANEL_WIDTH - 105;
  const sealY = 126;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.font = '800 15px "Nunito Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('O & A', sealX, sealY + 1);

  ctx.restore();
}

export async function createCanLabelTexture(): Promise<CanvasTexture> {
  if (typeof document === 'undefined') {
    throw new Error('createCanLabelTexture requires a browser document');
  }

  await Promise.all([
    document.fonts.load('700 132px Fraunces'),
    document.fonts.load('600 28px "Nunito Sans"'),
    document.fonts.load('800 30px "Nunito Sans"'),
  ]);
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = LABEL_WIDTH;
  canvas.height = LABEL_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D canvas context available');

  MENU_MODES.forEach((mode, index) => drawPanel(ctx, mode, index));

  // Separators at the panel seams. The centre of each panel is what faces
  // the camera at its mode angle; the seams stay at the back/sides.
  ctx.strokeStyle = 'rgba(62, 47, 42, 0.28)';
  ctx.lineWidth = 4;
  for (let index = 1; index < 3; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * PANEL_WIDTH, 0);
    ctx.lineTo(index * PANEL_WIDTH, LABEL_HEIGHT);
    ctx.stroke();
  }

  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debuglabel')) {
    (window as unknown as { __CAFETULIA_LABEL_DATA__?: string }).__CAFETULIA_LABEL_DATA__ =
      canvas.toDataURL('image/png');
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
