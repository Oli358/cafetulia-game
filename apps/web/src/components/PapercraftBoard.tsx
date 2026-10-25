import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GameState, Nation, Placement, Seat, Table, Tile } from '@cafetulia/engine';
import { getCharacterProfile, NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import type { SeatInspectResult } from '../utils/moveHelper';

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
    x: (col - 6) * 1.15,
    z: (row - 6) * 1.15,
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

    ctx.strokeStyle = meta.secondaryColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(64, 64, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFF9F0';
    ctx.beginPath();
    ctx.arc(64, 64, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = meta.secondaryColor;
    ctx.beginPath();
    ctx.arc(64, 64, 10, 0, Math.PI * 2);
    ctx.fill();
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
    const profile = getCharacterProfile(tile.nation, tile.gender, tile.jokerNation);

    ctx.fillStyle = '#FFF9F0';
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = isJoker ? '#C9A227' : meta.primaryColor;
    ctx.stroke();

    ctx.fillStyle = tile.gender === 'F' ? meta.skinToneF : meta.skinToneM;
    ctx.beginPath();
    ctx.arc(64, 56, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3E2F2A';
    ctx.stroke();

    ctx.fillStyle = isJoker ? '#C9A227' : meta.secondaryColor;
    ctx.beginPath();
    ctx.arc(64, 44, 22, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#3E2F2A';
    ctx.beginPath();
    ctx.arc(56, 56, 3, 0, Math.PI * 2);
    ctx.arc(72, 56, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(64, 62, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText(profile.name, 64, 102);
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
  cameraAngleIndex,
  cameraZoom,
  nightMode,
}: PapercraftBoardProps): React.ReactElement {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
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
    renderer.toneMappingExposure = 0.92;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(nightMode ? '#1F2430' : '#EFE1CC');
    scene.fog = new THREE.FogExp2(nightMode ? '#1F2430' : '#EFE1CC', 0.015);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 24, 18);
    camera.lookAt(0, 0, 0.4);
    cameraRef.current = camera;

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
    }
    scene.add(keyLight);

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

    const plaqueGeo = new THREE.BoxGeometry(0.45, 0.04, 0.22);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      roughness: 0.35,
      metalness: 0.65,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 0.45, 0.55);
    barGroup.add(plaque);

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
      const h = container.clientHeight || 420;
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
  }, [nightMode, gameState.tables]);

  useEffect(() => {
    const dyn = dynamicGroupRef.current;
    const camera = cameraRef.current;
    const requestRender = requestRenderRef.current;
    if (!dyn || !camera || !requestRender) return;

    const angleRad = (cameraAngleIndex * Math.PI) / 2;
    const dist = 18.5 / cameraZoom;
    const height = 24 / Math.sqrt(cameraZoom);
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

      const draftItem = draftPlacements.find((d) => d.seatId === seat.id);
      let occupantTile: Tile | null = seat.occupant;
      if (!occupantTile && draftItem) {
        const hand = gameState.hands[gameState.turn] ?? [];
        const found = hand.find((t) => t.id === draftItem.tileId);
        if (found) {
          occupantTile =
            found.nation === 'joker'
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
    gameState,
    selectedTile,
    draftPlacements,
    seatInspections,
    cameraAngleIndex,
    cameraZoom,
    focusedTableId,
  ]);

  return (
    <div
      className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#3E2F2A]/20"
      data-testid="cafe-3d-diorama"
    >
      <div ref={canvasMountRef} className="w-full h-full" />
      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 text-xs font-medium bg-[#FFF9F0]/90 text-[#3E2F2A] px-3 py-1 rounded-xl shadow-xs">
        <span>Diorama 3D Papercraft</span>
        <span aria-hidden="true">·</span>
        <span>Zoom {Math.round(cameraZoom * 100)}%</span>
      </div>
      <div
        className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-serif text-[#3E2F2A] bg-[#C9A227]/30 border border-[#C9A227]/70 px-2.5 py-0.5 rounded-lg"
        title="Placa conmemorativa del café"
      >
        Placa de latón · O &amp; C
      </div>
    </div>
  );
}
