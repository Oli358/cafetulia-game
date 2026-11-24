import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three';
import { MENU_MODES, type MenuMode, type MenuModeConfig } from './menuModes';

const LABEL_WIDTH = 3072;
const LABEL_HEIGHT = 1536;
const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 1024;
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
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.ellipse(32, 52, 24, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(14, 24);
  ctx.lineTo(50, 24);
  ctx.lineTo(46, 46);
  ctx.quadraticCurveTo(44, 52, 32, 52);
  ctx.quadraticCurveTo(20, 52, 18, 46);
  ctx.closePath();
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(49, 28);
  ctx.quadraticCurveTo(60, 28, 58, 38);
  ctx.quadraticCurveTo(56, 45, 46, 43);
  ctx.stroke();

  ctx.lineCap = 'round';
  ctx.lineWidth = 2.4;
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

function drawMotif(
  ctx: CanvasRenderingContext2D,
  mode: MenuModeConfig,
  cx: number,
  cy: number,
): void {
  const accent = mode.theme.canAccent;
  const ink = mode.theme.canInk;
  ctx.save();
  ctx.translate(cx, cy);

  if (mode.id === 'join') {
    // A large cup-and-sun motif
    ctx.strokeStyle = `${ink}55`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.stroke();
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 196, Math.sin(angle) * 196);
      ctx.lineTo(Math.cos(angle) * 220, Math.sin(angle) * 220);
      ctx.strokeStyle = `${accent}aa`;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(-95, -15);
    ctx.lineTo(70, -15);
    ctx.lineTo(56, 74);
    ctx.quadraticCurveTo(40, 104, 0, 104);
    ctx.quadraticCurveTo(-40, 104, -56, 74);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(82, 25, 34, -0.5, 1.5);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-40, -54);
    ctx.quadraticCurveTo(-58, -88, -34, -120);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -50);
    ctx.quadraticCurveTo(-8, -92, 18, -130);
    ctx.stroke();
  } else if (mode.id === 'create') {
    // A coffee flower with rain-like seeds
    for (let index = 0; index < 7; index += 1) {
      const angle = (index / 7) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -110, 44, 92, 0, 0, Math.PI * 2);
      ctx.fillStyle = `${ink}dd`;
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = `${ink}66`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.stroke();
    for (let index = 0; index < 9; index += 1) {
      const angle = (index / 9) * Math.PI * 2;
      const x = Math.cos(angle) * 225;
      const y = Math.sin(angle) * 225;
      ctx.fillStyle = `${accent}bb`;
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 18, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // A crescent moon with a small constellation
    ctx.strokeStyle = `${ink}55`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-18, 0, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mode.theme.canColor;
    ctx.beginPath();
    ctx.arc(42, -28, 112, 0, Math.PI * 2);
    ctx.fill();
    for (let index = 0; index < 7; index += 1) {
      const angle = -0.8 + index * 0.6;
      const radius = 205;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      ctx.fillStyle = `${ink}aa`;
      ctx.beginPath();
      ctx.arc(x, y, index % 2 === 0 ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = `${ink}33`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-168, -66);
    ctx.lineTo(-112, -10);
    ctx.lineTo(-90, -54);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  mode: MenuModeConfig,
  panelIndex: number,
  x: number,
): void {
  const theme = mode.theme;
  const ink = theme.canInk;
  const accent = theme.canAccent;
  const random = seededRandom(101 + panelIndex * 37);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, 0, PANEL_WIDTH, LABEL_HEIGHT);
  ctx.clip();

  const background = ctx.createLinearGradient(x, 0, x, LABEL_HEIGHT);
  background.addColorStop(0, theme.canColor);
  background.addColorStop(1, `${theme.canColor}dd`);
  ctx.fillStyle = background;
  ctx.fillRect(x, 0, PANEL_WIDTH, LABEL_HEIGHT);

  // Painted-can grain and light band
  for (let index = 0; index < 2200; index += 1) {
    const px = x + random() * PANEL_WIDTH;
    const py = random() * LABEL_HEIGHT;
    ctx.fillStyle = `rgba(255, 248, 236, ${0.02 + random() * 0.04})`;
    ctx.fillRect(px, py, 1.2, 1.2);
  }
  const lightBand = ctx.createLinearGradient(x, 0, x + PANEL_WIDTH, 0);
  lightBand.addColorStop(0, 'rgba(255,255,255,0.08)');
  lightBand.addColorStop(0.45, 'rgba(255,255,255,0)');
  lightBand.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = lightBand;
  ctx.fillRect(x, 0, PANEL_WIDTH, LABEL_HEIGHT);

  // Thin frame
  ctx.strokeStyle = `${ink}33`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 42, 42, PANEL_WIDTH - 84, LABEL_HEIGHT - 84);

  // Header
  drawCupMark(ctx, x + 76, 92, 0.82, ink, `${accent}dd`);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ink;
  ctx.font = '700 42px Fraunces, Georgia, serif';
  ctx.fillText('CAFETULIA', x + 154, 112);
  ctx.fillStyle = `${ink}aa`;
  ctx.font = '700 17px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText('COLD BREW DE LA CASA', x + 156, 145);

  // Large motif
  drawMotif(ctx, mode, x + PANEL_WIDTH / 2, 430);

  // Blend name
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = '700 148px Fraunces, Georgia, serif';
  ctx.fillText(mode.blend, x + PANEL_WIDTH / 2, 790);

  // Mode label
  ctx.fillStyle = accent;
  ctx.font = '800 32px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText(mode.tab.toUpperCase(), x + PANEL_WIDTH / 2, 870);

  // Rule
  ctx.strokeStyle = `${ink}55`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + PANEL_WIDTH / 2 - 170, 910);
  ctx.lineTo(x + PANEL_WIDTH / 2 + 170, 910);
  ctx.stroke();

  // Notes
  ctx.fillStyle = `${ink}dd`;
  ctx.font = '600 30px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText(mode.blendNote, x + PANEL_WIDTH / 2, 972);
  ctx.fillStyle = `${ink}99`;
  ctx.font = '700 20px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText('MEZCLA DE LA CASA · O & A', x + PANEL_WIDTH / 2, 1018);

  // Ghost number
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = ink;
  ctx.font = '800 360px Fraunces, Georgia, serif';
  ctx.fillText(`0${panelIndex + 1}`, x + PANEL_WIDTH / 2, 1280);
  ctx.restore();

  // Bottom strip
  ctx.textAlign = 'left';
  ctx.fillStyle = `${ink}cc`;
  ctx.font = '800 19px "Nunito Sans", system-ui, sans-serif';
  ctx.fillText('RESERVA DE LA CASA', x + 76, 1418);
  ctx.textAlign = 'right';
  ctx.fillText('250 ml', x + PANEL_WIDTH - 76, 1418);

  // Brass seal
  const sealX = x + PANEL_WIDTH - 110;
  const sealY = 116;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = '800 15px "Nunito Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('O & A', sealX, sealY + 1);

  ctx.restore();
}

export async function createCanLabelTextures(): Promise<Record<MenuMode, CanvasTexture>> {
  if (typeof document === 'undefined') {
    throw new Error('createCanLabelTexture requires a browser document');
  }

  await Promise.all([
    document.fonts.load('700 148px Fraunces'),
    document.fonts.load('600 30px "Nunito Sans"'),
    document.fonts.load('800 32px "Nunito Sans"'),
  ]);
  await document.fonts.ready;

  const textures = {} as Record<MenuMode, CanvasTexture>;

  for (const mode of MENU_MODES) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D canvas context available');
    ctx.scale(CANVAS_WIDTH / LABEL_WIDTH, CANVAS_HEIGHT / LABEL_HEIGHT);

    for (let panelIndex = 0; panelIndex < 3; panelIndex += 1) {
      drawPanel(ctx, mode, panelIndex, panelIndex * PANEL_WIDTH);
    }

    // Separators at the panel seams. The design repeats three times, so every
    // 120° stop presents the same face while the whole can changes colour.
    ctx.strokeStyle = 'rgba(255, 248, 236, 0.16)';
    ctx.lineWidth = 5;
    for (let index = 1; index < 3; index += 1) {
      ctx.beginPath();
      ctx.moveTo(index * PANEL_WIDTH, 0);
      ctx.lineTo(index * PANEL_WIDTH, LABEL_HEIGHT);
      ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    textures[mode.id] = texture;
  }

  return textures;
}
