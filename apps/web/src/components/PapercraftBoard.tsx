import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GameState, Nation, Placement, Seat, Table, Tile } from '@cafetulia/engine';
import { NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import { CharacterPortrait, FlagBadge } from '../art/CharacterPortrait';
import { getNationName, type SeatInspectResult } from '../utils/moveHelper';

type PapercraftBoardProps = {
  gameState: GameState;
  selectedTile: Tile | null;
  draftPlacements: Placement[];
  seatInspections: Record<string, SeatInspectResult>;
  focusedTableId: string | null;
  viewMode: '3d' | '2d';
  cameraAngleIndex: 0 | 1 | 2 | 3;
  cameraZoom: number;
  nightMode: boolean;
  reducedMotion: boolean;
  onSeatClick: (seat: Seat) => void;
  onTableClick: (table: Table) => void;
  onBarClick: () => void;
};

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

function gridToWorld(row: number, col: number): { x: number; z: number } {
  return {
    x: (col - 7) * 1.15,
    z: (row - 7) * 1.15,
  };
}

function makeWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#CFA97E';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#B38B5E';
    ctx.lineWidth = 2.5;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const offset = (y / 32) % 2 === 0 ? 64 : 160;
      ctx.beginPath();
      ctx.moveTo(offset, y);
      ctx.lineTo(offset, y + 32);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function makeTableTopTexture(nation: Nation): THREE.CanvasTexture {
  const meta = NATION_VISUALS[nation as NationKey] ?? NATION_VISUALS.fr;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFF9F0';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = meta.primaryColor;
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    // Inner tablecloth pattern ring
    ctx.strokeStyle = meta.secondaryColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(64, 64, 42, 0, Math.PI * 2);
    ctx.stroke();

    // Center cream medallion with country code
    ctx.fillStyle = '#FFF9F0';
    ctx.beginPath();
    ctx.arc(64, 64, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meta.shortCode, 64, 65);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGuestTokenTexture(tile: Tile): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const isJoker = tile.nation === 'joker';
    const effNat = isJoker ? (tile.jokerNation ?? 'fr') : tile.nation;
    const meta = NATION_VISUALS[effNat as NationKey] ?? NATION_VISUALS.fr;

    ctx.fillStyle = '#FFF9F0';
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = isJoker ? '#C9A227' : meta.primaryColor;
    ctx.stroke();

    // Simple comic face silhouette on the 3D token top
    ctx.fillStyle = tile.gender === 'F' ? meta.skinToneF : meta.skinToneM;
    ctx.beginPath();
    ctx.arc(64, 58, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3E2F2A';
    ctx.stroke();

    // Hat / hair arc
    ctx.fillStyle = isJoker ? '#C9A227' : meta.secondaryColor;
    ctx.beginPath();
    ctx.arc(64, 46, 22, Math.PI, 0);
    ctx.fill();

    // Eyes & smile
    ctx.fillStyle = '#3E2F2A';
    ctx.beginPath();
    ctx.arc(56, 58, 3, 0, Math.PI * 2);
    ctx.arc(72, 58, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(64, 64, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Label at bottom
    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${isJoker ? '★' : meta.shortCode}·${tile.gender}`, 64, 102);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function PapercraftBoard({
  gameState,
  selectedTile,
  draftPlacements,
  seatInspections,
  focusedTableId,
  viewMode,
  cameraAngleIndex,
  cameraZoom,
  nightMode,
  onSeatClick,
  onTableClick,
  onBarClick,
}: PapercraftBoardProps): React.ReactElement {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    for (const s of gameState.seats) {
      map.set(`${s.row},${s.col}`, s);
    }
    return map;
  }, [gameState.seats]);

  const tableMap = useMemo(() => {
    const map = new Map<string, Table>();
    for (const t of gameState.tables) {
      map.set(`${t.row},${t.col}`, t);
    }
    return map;
  }, [gameState.tables]);

  // Next available bar slot
  const nextBarIndex = useMemo(
    () => gameState.bar.findIndex((t) => t === null),
    [gameState.bar],
  );
  const nextBarValue =
    nextBarIndex >= 0 ? (gameState.barValues[nextBarIndex] ?? -14) : null;

  // Check if any table move is legal right now for the active player
  const hasAnyLegalTableSeatForSelected = useMemo(() => {
    return Object.values(seatInspections).some(
      (i) => i.status === 'legal_complete' || i.status === 'legal_needs_pair',
    );
  }, [seatInspections]);

  // Mount Three.js 2.5D diorama scene once when in 3D mode
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = canvasMountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 200;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(nightMode ? '#1F2430' : '#EFE1CC');
    scene.fog = new THREE.FogExp2(nightMode ? '#1F2430' : '#EFE1CC', 0.015);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 14.2, 10.5);
    camera.lookAt(0, 0, 0.6);
    cameraRef.current = camera;

    // Warm key light + cool sky/ground HemisphereLight fill
    const hemiLight = new THREE.HemisphereLight(
      nightMode ? 0x6b8cce : 0xfff3de,
      0x7a5233,
      nightMode ? 0.55 : 0.72,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      nightMode ? 0xffcb8e : 0xffdfba,
      nightMode ? 0.95 : 1.15,
    );
    keyLight.position.set(-10, 18, 10);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 40;
      const d = 10;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    // 1. Cafe Wood Floor Base + Brass Frame (Composite Group)
    const boardGroup = new THREE.Group();
    const floorTex = makeWoodFloorTexture();
    const floorGeo = new THREE.BoxGeometry(16.2, 0.25, 16.2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTex,
      roughness: 0.82,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.125;
    floorMesh.receiveShadow = !isSoftwareGl;
    boardGroup.add(floorMesh);

    const frameGeo = new THREE.BoxGeometry(16.6, 0.32, 16.6);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x8b5e3c,
      roughness: 0.7,
      metalness: 0.15,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = -0.18;
    boardGroup.add(frameMesh);

    // Central Diamond Bar Counter + Brass Plaque + Cozy Sleeping Cat
    const barGroup = new THREE.Group();
    const barCounterGeo = new THREE.CylinderGeometry(1.55, 1.65, 0.38, 4);
    const barCounterMat = new THREE.MeshStandardMaterial({
      color: 0x8b5e3c,
      roughness: 0.65,
      metalness: 0.1,
    });
    const barCounter = new THREE.Mesh(barCounterGeo, barCounterMat);
    barCounter.position.set(0, 0.19, 0);
    barGroup.add(barCounter);

    const barTopGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.08, 4);
    const barTopMat = new THREE.MeshStandardMaterial({
      color: 0xfff9f0,
      roughness: 0.78,
      metalness: 0.05,
    });
    const barTop = new THREE.Mesh(barTopGeo, barTopMat);
    barTop.position.set(0, 0.4, 0);
    barGroup.add(barTop);

    // Brass plaque (couple initials detail)
    const plaqueGeo = new THREE.BoxGeometry(0.45, 0.04, 0.22);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      roughness: 0.35,
      metalness: 0.65,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 0.45, 0.55);
    barGroup.add(plaque);

    // Cozy cat curled on the bar corner (3-part composite mesh: body, head, ears/tail)
    const catGroup = new THREE.Group();
    const catMat = new THREE.MeshStandardMaterial({
      color: 0xd98e3a,
      roughness: 0.85,
      metalness: 0.05,
    });
    const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), catMat);
    catBody.scale.set(1.2, 0.7, 1.0);
    catBody.position.set(-0.45, 0.5, -0.35);
    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), catMat);
    catHead.position.set(-0.32, 0.56, -0.28);
    catGroup.add(catBody, catHead);
    barGroup.add(catGroup);

    boardGroup.add(barGroup);

    // 2. Static 24 Tables (each a composite 4-part Group: pedestal, column, tabletop, tablecloth medallion)
    const pedestalGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.06, 16);
    const columnGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.34, 12);
    const topGeo = new THREE.CylinderGeometry(0.48, 0.46, 0.08, 24);
    const shadowDiscGeo = new THREE.CircleGeometry(0.52, 20);
    shadowDiscGeo.rotateX(-Math.PI / 2);

    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: 0x6e472b,
      roughness: 0.75,
      metalness: 0.1,
    });
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      color: 0x3e2f2a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });

    for (const table of gameState.tables) {
      const { x, z } = gridToWorld(table.row, table.col);
      const tGroup = new THREE.Group();
      tGroup.position.set(x, 0, z);

      const shadowDisc = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
      shadowDisc.position.y = 0.012;
      tGroup.add(shadowDisc);

      const pedestal = new THREE.Mesh(pedestalGeo, woodDarkMat);
      pedestal.position.y = 0.03;
      tGroup.add(pedestal);

      const colMesh = new THREE.Mesh(columnGeo, woodDarkMat);
      colMesh.position.y = 0.2;
      tGroup.add(colMesh);

      const topTex = makeTableTopTexture(table.nation);
      const topMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: topTex,
        roughness: 0.78,
        metalness: 0.05,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 0.38;
      topMesh.castShadow = !isSoftwareGl;
      tGroup.add(topMesh);

      boardGroup.add(tGroup);
    }

    scene.add(boardGroup);

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // On-demand render scheduler with software-WebGL fence pacing
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 40);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 50);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;
    requestRender();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    };
  }, [viewMode, nightMode, gameState.tables]);

  // Update dynamic 3D chairs, seated guest tokens, legal highlights, and camera when state changes
  useEffect(() => {
    if (viewMode !== '3d') return;
    const dyn = dynamicGroupRef.current;
    const camera = cameraRef.current;
    const requestRender = requestRenderRef.current;
    if (!dyn || !camera || !requestRender) return;

    // Position camera based on angle & zoom & optional focused table
    const angleRad = (cameraAngleIndex * Math.PI) / 2;
    const dist = 10.6 / cameraZoom;
    const height = 14.2 / Math.sqrt(cameraZoom);
    let targetX = 0;
    let targetZ = 0.4;
    if (focusedTableId) {
      const fTable = gameState.tables.find((t) => t.id === focusedTableId);
      if (fTable) {
        const pos = gridToWorld(fTable.row, fTable.col);
        targetX = pos.x * 0.65;
        targetZ = pos.z * 0.65;
      }
    }
    camera.position.set(
      targetX + Math.sin(angleRad) * dist,
      height,
      targetZ + Math.cos(angleRad) * dist,
    );
    camera.lookAt(targetX, 0, targetZ);

    // Clear previous dynamic children
    while (dyn.children.length > 0) {
      const child = dyn.children[0];
      if (child) dyn.remove(child);
    }

    const chairBaseGeo = new THREE.BoxGeometry(0.46, 0.14, 0.46);
    const cushionHalfGeo = new THREE.BoxGeometry(0.21, 0.06, 0.4);
    const cushionFullGeo = new THREE.BoxGeometry(0.42, 0.06, 0.4);
    const backGeo = new THREE.BoxGeometry(0.44, 0.24, 0.07);
    const tokenGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20);
    const ringGeo = new THREE.RingGeometry(0.32, 0.42, 24);
    ringGeo.rotateX(-Math.PI / 2);

    const chairWoodMat = new THREE.MeshStandardMaterial({
      color: 0xb9855a,
      roughness: 0.78,
      metalness: 0.05,
    });

    for (const seat of gameState.seats) {
      const { x, z } = gridToWorld(seat.row, seat.col);
      const sGroup = new THREE.Group();
      sGroup.position.set(x, 0, z);

      const baseMesh = new THREE.Mesh(chairBaseGeo, chairWoodMat);
      baseMesh.position.y = 0.07;
      sGroup.add(baseMesh);

      const backMesh = new THREE.Mesh(backGeo, chairWoodMat);
      backMesh.position.set(0, 0.22, -0.19);
      sGroup.add(backMesh);

      // Shared seats have bicolor cushions; single-table seats have single nation cushion
      const natA = seat.allowedNations[0] ?? 'fr';
      const natB = seat.allowedNations[1];
      const colorA = NATION_VISUALS[natA as NationKey]?.primaryColor ?? '#3B5BA5';

      if (natB) {
        const colorB = NATION_VISUALS[natB as NationKey]?.primaryColor ?? '#C94C4C';
        const leftCushion = new THREE.Mesh(
          cushionHalfGeo,
          new THREE.MeshStandardMaterial({ color: colorA, roughness: 0.8 }),
        );
        leftCushion.position.set(-0.11, 0.16, 0.02);
        const rightCushion = new THREE.Mesh(
          cushionHalfGeo,
          new THREE.MeshStandardMaterial({ color: colorB, roughness: 0.8 }),
        );
        rightCushion.position.set(0.11, 0.16, 0.02);
        sGroup.add(leftCushion, rightCushion);
      } else {
        const fullCushion = new THREE.Mesh(
          cushionFullGeo,
          new THREE.MeshStandardMaterial({ color: colorA, roughness: 0.8 }),
        );
        fullCushion.position.set(0, 0.16, 0.02);
        sGroup.add(fullCushion);
      }

      // Check occupant or draft placement
      const draftItem = draftPlacements.find((d) => d.seatId === seat.id);
      let occupantTile: Tile | null = seat.occupant;
      if (!occupantTile && draftItem) {
        const hand = gameState.hands[gameState.turn] ?? [];
        const found = hand.find((t) => t.id === draftItem.tileId);
        if (found) {
          occupantTile = found.nation === 'joker'
            ? { ...found, jokerNation: draftItem.jokerNation }
            : found;
        }
      }

      if (occupantTile) {
        const tokTex = makeGuestTokenTexture(occupantTile);
        const effNat =
          occupantTile.nation === 'joker'
            ? (occupantTile.jokerNation ?? natA)
            : occupantTile.nation;
        const rimColor =
          NATION_VISUALS[effNat as NationKey]?.primaryColor ?? '#C96F4A';
        const rimMat = new THREE.MeshStandardMaterial({
          color: rimColor,
          roughness: 0.72,
          metalness: 0.08,
        });
        const topMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: tokTex,
          roughness: 0.75,
          metalness: 0.05,
        });
        const tokenMesh = new THREE.Mesh(tokenGeo, [rimMat, topMat, rimMat]);
        tokenMesh.position.y = 0.27;
        sGroup.add(tokenMesh);
      } else {
        const inspect = seatInspections[seat.id];
        if (
          selectedTile &&
          inspect &&
          (inspect.status === 'legal_complete' || inspect.status === 'legal_needs_pair')
        ) {
          const highlightColor =
            inspect.status === 'legal_complete' ? 0x3f8f6b : 0xc9a227;
          const ringMat = new THREE.MeshBasicMaterial({
            color: highlightColor,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.y = 0.21;
          sGroup.add(ringMesh);
        }
      }

      dyn.add(sGroup);
    }

    requestRender();
  }, [
    viewMode,
    gameState,
    selectedTile,
    draftPlacements,
    seatInspections,
    cameraAngleIndex,
    cameraZoom,
    focusedTableId,
  ]);

  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div
      className={`relative w-full rounded-[24px] border border-[#3E2F2A]/15 overflow-hidden shadow-[0_8px_24px_rgba(62,47,42,0.12)] ${
        nightMode ? 'bg-[#1F2430] text-[#FFF9F0]' : 'bg-[#F7EEDF] text-[#3E2F2A]'
      }`}
      data-testid="papercraft-board"
    >
      {/* Top 3D / 2D Diorama Viewport */}
      {viewMode === '3d' && (
        <div className="relative w-full h-[155px] sm:h-[175px] border-b border-[#3E2F2A]/10">
          <div ref={canvasMountRef} className="w-full h-full" />
          <div className="pointer-events-none absolute top-2 left-3 flex items-center gap-2 text-xs font-medium bg-[#FFF9F0]/90 text-[#3E2F2A] px-2.5 py-0.5 rounded-lg shadow-xs">
            <span>Vista diorama 2.5D</span>
            <span aria-hidden="true">·</span>
            <span>Zoom {Math.round(cameraZoom * 100)}%</span>
          </div>
          {/* Brass couple plaque badge in corner */}
          <div
            className="pointer-events-none absolute bottom-1.5 right-3 text-[11px] font-serif text-[#3E2F2A] bg-[#C9A227]/25 border border-[#C9A227]/60 px-2 py-0.5 rounded"
            title="Placa conmemorativa del café"
          >
            Placa de latón · O &amp; C
          </div>
        </div>
      )}

      {/* Interactive 13x13 Board Grid (Tactile Papercraft Map — accessible in both 2.5D and 2D mode) */}
      <div className="p-2 sm:p-2.5">
        <div
          className="grid grid-cols-13 gap-0.5 sm:gap-1 mx-auto max-w-[500px] aspect-square bg-[#EAD9C0] p-1.5 rounded-[16px] border border-[#8B5E3C]/30 shadow-inner"
          role="grid"
          aria-label="Tablero de Cafetulia de 13 por 13 casillas"
        >
          {rows.map((r) =>
            cols.map((c) => {
              const key = `${r},${c}`;
              const table = tableMap.get(key);
              const seat = seatMap.get(key);

              // Central Bar cell at (7, 7)
              if (r === 7 && c === 7) {
                const barHighlight = selectedTile !== null && !hasAnyLegalTableSeatForSelected;
                return (
                  <button
                    key={key}
                    type="button"
                    data-testid="bar-center-button"
                    onClick={onBarClick}
                    aria-label={`Barra central: siguiente posavasos ${
                      nextBarValue !== null
                        ? nextBarValue > 0
                          ? `+${nextBarValue}`
                          : `${nextBarValue}`
                        : 'llena'
                    } puntos`}
                    className={`relative flex flex-col items-center justify-center rounded-lg border transition-transform select-none overflow-hidden ${
                      barHighlight
                        ? 'bg-[#F2C14E] border-[#C96F4A] scale-105 shadow-md'
                        : 'bg-[#8B5E3C] border-[#C9A227] hover:scale-105'
                    } text-[#FFF9F0]`}
                  >
                    <span className="text-[7px] sm:text-[8px] font-bold tracking-tight leading-none">
                      BAR
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-serif font-bold text-[#F2C14E] tabular-nums leading-none mt-0.5">
                      {nextBarValue !== null
                        ? nextBarValue > 0
                          ? `+${nextBarValue}`
                          : nextBarValue
                        : '20/20'}
                    </span>
                  </button>
                );
              }

              if (table) {
                const meta = NATION_VISUALS[table.nation as NationKey] ?? NATION_VISUALS.fr;
                const occCount = table.seatIds.filter((sid) => {
                  const s = gameState.seats.find((item) => item.id === sid);
                  return s?.occupant !== null || draftPlacements.some((d) => d.seatId === sid);
                }).length;
                const isFocused = focusedTableId === table.id;

                return (
                  <button
                    key={key}
                    type="button"
                    data-table-id={table.id}
                    onClick={() => onTableClick(table)}
                    aria-label={`Mesa ${meta.name} (${meta.shortCode}), ${occCount} de 4 sillas ocupadas`}
                    className={`relative flex flex-col items-center justify-center rounded-full border-2 transition-transform select-none ${
                      isFocused ? 'ring-2 ring-[#C96F4A] scale-110 z-10' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: meta.primaryColor,
                      borderColor: '#3E2F2A',
                    }}
                  >
                    <span className="text-[9px] sm:text-[11px] font-bold text-[#FFF9F0] drop-shadow-xs leading-none">
                      {meta.shortCode}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-[#FFF9F0]/90 tabular-nums leading-none mt-0.5">
                      {occCount}/4
                    </span>
                  </button>
                );
              }

              if (seat) {
                const inspect = seatInspections[seat.id];
                const draftItem = draftPlacements.find((d) => d.seatId === seat.id);
                let occupant: Tile | null = seat.occupant;
                if (!occupant && draftItem) {
                  const hand = gameState.hands[gameState.turn] ?? [];
                  const found = hand.find((t) => t.id === draftItem.tileId);
                  if (found) {
                    occupant =
                      found.nation === 'joker'
                        ? { ...found, jokerNation: draftItem.jokerNation }
                        : found;
                  }
                }

                const natA = seat.allowedNations[0] ?? 'fr';
                const natB = seat.allowedNations[1];
                const metaA = NATION_VISUALS[natA as NationKey] ?? NATION_VISUALS.fr;
                const metaB = natB ? NATION_VISUALS[natB as NationKey] : null;
                const isShared = Boolean(metaB);

                const isLegalComplete = inspect?.status === 'legal_complete';
                const isLegalPair = inspect?.status === 'legal_needs_pair';
                const isSelectedDraft = inspect?.status === 'selected';

                const seatLabel = occupant
                  ? `Silla ${seat.id} ocupada por ${getNationName(
                      occupant.nation === 'joker'
                        ? (occupant.jokerNation ?? 'joker')
                        : occupant.nation,
                    )} (${occupant.gender === 'M' ? 'Hombre' : 'Mujer'})`
                  : `Silla ${isShared ? 'compartida' : ''} ${seat.allowedNations
                      .map((n) => getNationName(n))
                      .join(' / ')} (${seat.id})`;

                return (
                  <button
                    key={key}
                    type="button"
                    data-seat-id={seat.id}
                    onClick={() => onSeatClick(seat)}
                    aria-label={seatLabel}
                    title={
                      inspect?.status === 'illegal' && selectedTile
                        ? inspect.whyCannotText
                        : inspect?.previewText || seatLabel
                    }
                    className={`relative flex flex-col items-center justify-center rounded-lg border transition-all select-none overflow-hidden ${
                      occupant
                        ? 'bg-[#FFF9F0] border-[#3E2F2A] shadow-xs'
                        : isSelectedDraft
                          ? 'bg-[#F2C14E] border-[#3E2F2A] ring-2 ring-[#C96F4A]'
                          : isLegalComplete
                            ? 'bg-[#E6F4EA] border-[#3F5E4A] border-2 ring-2 ring-[#3F8F6B] scale-105 cursor-pointer'
                            : isLegalPair
                              ? 'bg-[#FEF6E0] border-[#C9A227] border-2 ring-2 ring-[#E0A526] scale-105 cursor-pointer'
                              : selectedTile
                                ? 'bg-[#FFF9F0]/55 border-[#3E2F2A]/25 opacity-60 hover:opacity-95'
                                : 'bg-[#FFF9F0] border-[#3E2F2A]/40 hover:border-[#3E2F2A]'
                    }`}
                  >
                    {/* Shared seat bicolor top bar */}
                    <div className="w-full h-1.5 flex shrink-0">
                      <span
                        className="flex-1 h-full"
                        style={{ backgroundColor: metaA.primaryColor }}
                      />
                      {metaB && (
                        <span
                          className="flex-1 h-full"
                          style={{ backgroundColor: metaB.primaryColor }}
                        />
                      )}
                    </div>

                    {occupant ? (
                      <div className="flex flex-col items-center justify-center flex-1 py-0.5">
                        <div className="hidden sm:block">
                          <CharacterPortrait
                            nation={
                              occupant.nation === 'joker'
                                ? 'joker'
                                : occupant.nation
                            }
                            gender={occupant.gender}
                            size={22}
                          />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-[#3E2F2A] leading-none">
                          {occupant.nation === 'joker'
                            ? `★${(occupant.jokerNation ?? '').toUpperCase()}`
                            : occupant.nation.toUpperCase()}
                          ·{occupant.gender}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 px-0.5">
                        <span className="text-[7px] sm:text-[9px] font-semibold text-[#3E2F2A] leading-tight text-center">
                          {metaB ? `${metaA.shortCode}/${metaB.shortCode}` : metaA.shortCode}
                        </span>
                        {(isLegalComplete || isLegalPair) && (
                          <span
                            className={`text-[8px] font-bold tabular-nums leading-none ${
                              isLegalComplete ? 'text-[#3F5E4A]' : 'text-[#8B5E3C]'
                            }`}
                          >
                            {isLegalComplete ? `+${inspect.pointsDelta}` : '1ª/2'}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              }

              // Empty wooden floor tile
              return (
                <div
                  key={key}
                  aria-hidden="true"
                  className="rounded-md bg-[#DFC8A9]/45 border border-[#8B5E3C]/10"
                />
              );
            }),
          )}
        </div>

        {/* 20 Bar Coasters Strip below the 13x13 grid */}
        <div
          className="mt-3 bg-[#FFF9F0] border border-[#3E2F2A]/15 rounded-2xl p-2.5 sm:p-3"
          data-testid="bar-strip"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-sm text-[#3E2F2A]">
                Barra del café (20 posavasos)
              </span>
              <span className="text-xs text-[#6F5A4E] tabular-nums">
                · Ocupados: {gameState.bar.filter((b) => b !== null).length}/20
              </span>
              <span className="text-xs text-[#6F5A4E] hidden sm:inline">
                · 🐈 Gato de la casa durmiendo junto al tirador
              </span>
            </div>
            {selectedTile && selectedTile.nation !== 'joker' && (
              <button
                type="button"
                data-testid="send-to-bar-btn"
                onClick={onBarClick}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  !hasAnyLegalTableSeatForSelected
                    ? 'bg-[#C96F4A] text-[#FFF9F0] ring-2 ring-[#F2C14E]'
                    : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/25 hover:bg-[#EAD9C0]'
                }`}
              >
                Sentar en la barra (
                {nextBarValue !== null
                  ? nextBarValue > 0
                    ? `+${nextBarValue} pts`
                    : `${nextBarValue} pts`
                  : 'llena'}
                )
              </button>
            )}
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
            {gameState.barValues.map((val, idx) => {
              const occ = gameState.bar[idx];
              const isNext = idx === nextBarIndex;
              return (
                <div
                  key={idx}
                  title={
                    occ
                      ? `Plaza ${idx + 1}: ocupada por ${getNationName(occ.nation)} (${occ.gender})`
                      : `Plaza ${idx + 1}: ${val > 0 ? `+${val}` : val} puntos`
                  }
                  className={`flex flex-col items-center justify-center py-1 rounded-lg border text-[10px] tabular-nums select-none ${
                    occ
                      ? 'bg-[#8B5E3C] text-[#FFF9F0] border-[#3E2F2A]'
                      : isNext
                        ? 'bg-[#F2C14E]/45 text-[#3E2F2A] border-[#C96F4A] border-2 font-bold'
                        : val > 0
                          ? 'bg-[#E6F4EA]/70 text-[#3F5E4A] border-[#3F5E4A]/25'
                          : 'bg-[#FDECEB]/70 text-[#A94438] border-[#A94438]/25'
                  }`}
                >
                  <span>{occ ? `${occ.nation.toUpperCase()}` : val > 0 ? `+${val}` : val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Focused Table Detail Drawer */}
      {focusedTableId && (
        <FocusedTablePanel
          gameState={gameState}
          tableId={focusedTableId}
          onClose={() => {
            const firstTable = gameState.tables.find((t) => t.id === focusedTableId);
            if (firstTable) onTableClick(firstTable);
          }}
        />
      )}
    </div>
  );
}

function FocusedTablePanel({
  gameState,
  tableId,
  onClose,
}: {
  gameState: GameState;
  tableId: string;
  onClose: () => void;
}): React.ReactElement | null {
  const table = gameState.tables.find((t) => t.id === tableId);
  if (!table) return null;

  const meta = NATION_VISUALS[table.nation as NationKey] ?? NATION_VISUALS.fr;
  const tableSeats = table.seatIds
    .map((sid) => gameState.seats.find((s) => s.id === sid))
    .filter((s): s is Seat => Boolean(s));

  const occupants = tableSeats
    .map((s) => s.occupant)
    .filter((o): o is Tile => o !== null);
  const males = occupants.filter((o) => o.gender === 'M').length;
  const females = occupants.filter((o) => o.gender === 'F').length;
  const isMonoNational =
    occupants.length >= 2 &&
    occupants.every((o) => (o.nation === 'joker' ? o.jokerNation : o.nation) === table.nation);

  return (
    <div
      className="mx-3 mb-3 p-3.5 rounded-2xl bg-[#FFF9F0] text-[#3E2F2A] border border-[#3E2F2A]/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      data-testid="table-detail-panel"
    >
      <div className="flex items-center gap-3">
        <FlagBadge nation={table.nation} size={32} />
        <div>
          <h4 className="font-serif font-bold text-base leading-tight">
            Mesa de {meta.name} ({meta.shortCode})
          </h4>
          <p className="text-xs text-[#6F5A4E] mt-0.5">
            Ocupación: {occupants.length}/4 sillas · Sexos: {males}H + {females}M ·{' '}
            {isMonoNational
              ? '¡Puntuación doble por mesa de una sola nacionalidad!'
              : 'Admite invitados mediante sillas compartidas'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-[#6F5A4E] tabular-nums">
          Próximo invitado: {occupants.length < 4 ? `+${occupants.length + 1} (o +${(occupants.length + 1) * 2} pura)` : 'Completa'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
        >
          Cerrar detalle
        </button>
      </div>
    </div>
  );
}
