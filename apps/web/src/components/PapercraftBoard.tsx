import React, { useEffect, useRef } from 'react';
import type * as THREE_TYPES from 'three';
import type { GameState, Nation, Placement, Seat, Table, Tile } from '@cafetulia/engine';
import { getCharacterProfile, NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import type { SeatInspectResult } from '../utils/moveHelper';

export type PapercraftBoardProps = {
  gameState: GameState;
  selectedTile: Tile | null;
  draftPlacements: Placement[];
  seatInspections: Record<string, SeatInspectResult>;
  focusedTableId: string | null;
  viewMode: '3d' | '2d';
  cameraPreset?: 'general' | 'tables' | 'bar';
  cameraAngleIndex: 0 | 1 | 2 | 3;
  cameraZoom: number;
  nightMode: boolean;
  reducedMotion: boolean;
  onSeatClick: (seat: Seat) => void;
  onTableClick: (table: Table) => void;
  onBarClick: () => void;
};

type ThreeLib = typeof THREE_TYPES;

type AnimatedSipper = {
  armGroup: THREE_TYPES.Group;
  headGroup: THREE_TYPES.Group;
  steamMesh: THREE_TYPES.Mesh;
  phase: number;
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

function makeWoodFloorTexture(THREE: ThreeLib): THREE_TYPES.CanvasTexture {
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

function makeTableTopTexture(THREE: ThreeLib, nation: Nation): THREE_TYPES.CanvasTexture {
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

/**
 * Procedural 3D Paper-Doll Seated Guest with torso, head, hat, arms, steaming cup & idle sipping animation
 */
function createSeatedGuest3D(
  THREE: ThreeLib,
  tile: Tile,
  fallbackNation: Nation,
  phaseSeed: number,
  lookTargetWorld?: { x: number; z: number },
  seatWorld?: { x: number; z: number },
): { group: THREE_TYPES.Group; sipper: AnimatedSipper } {
  const isJoker = tile.nation === 'joker';
  const effNat = isJoker ? (tile.jokerNation ?? fallbackNation) : tile.nation;
  const meta = NATION_VISUALS[effNat as NationKey] ?? NATION_VISUALS.fr;
  const profile = getCharacterProfile(tile.nation, tile.gender, tile.jokerNation);

  const root = new THREE.Group();
  root.name = `guest-${profile.name}`;

  if (lookTargetWorld && seatWorld) {
    const dx = lookTargetWorld.x - seatWorld.x;
    const dz = lookTargetWorld.z - seatWorld.z;
    root.rotation.y = Math.atan2(dx, dz);
  }

  const coatMat = new THREE.MeshStandardMaterial({
    color: isJoker ? '#C9A227' : meta.primaryColor,
    roughness: 0.72,
    metalness: 0.08,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isJoker ? '#8A3F5D' : meta.secondaryColor,
    roughness: 0.68,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: tile.gender === 'F' ? meta.skinToneF : meta.skinToneM,
    roughness: 0.75,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x3e2f2a,
    roughness: 0.6,
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xfff9f0,
    roughness: 0.35,
    metalness: 0.05,
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.25, 14), coatMat);
  torso.position.y = 0.31;
  root.add(torso);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 14), trimMat);
  collar.position.y = 0.42;
  root.add(collar);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.52, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), skinMat);
  headGroup.add(head);

  const eyeGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, darkMat);
  leftEye.position.set(-0.04, 0.015, 0.102);
  const rightEye = new THREE.Mesh(eyeGeo, darkMat);
  rightEye.position.set(0.04, 0.015, 0.102);
  headGroup.add(leftEye, rightEye);

  const hat = new THREE.Mesh(
    tile.gender === 'F'
      ? new THREE.CylinderGeometry(0.12, 0.13, 0.055, 14)
      : new THREE.CylinderGeometry(0.095, 0.125, 0.08, 14),
    trimMat,
  );
  hat.position.set(0, 0.095, -0.01);
  headGroup.add(hat);

  root.add(headGroup);

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.18, 10), coatMat);
  leftArm.position.set(-0.14, 0.33, 0.06);
  leftArm.rotation.x = Math.PI / 3.2;
  leftArm.rotation.z = -0.2;
  root.add(leftArm);

  const armGroup = new THREE.Group();
  armGroup.position.set(0.14, 0.38, 0.02);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.18, 10), coatMat);
  rightArm.position.set(0, -0.05, 0.07);
  rightArm.rotation.x = Math.PI / 2.5;
  armGroup.add(rightArm);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), skinMat);
  hand.position.set(0, -0.07, 0.15);
  armGroup.add(hand);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.058, 12), ceramicMat);
  cup.position.set(-0.02, -0.045, 0.165);
  armGroup.add(cup);

  const coffeeSurface = new THREE.Mesh(
    new THREE.CircleGeometry(0.035, 10),
    new THREE.MeshBasicMaterial({ color: 0x4b2e1e }),
  );
  coffeeSurface.rotation.x = -Math.PI / 2;
  coffeeSurface.position.set(-0.02, -0.015, 0.165);
  armGroup.add(coffeeSurface);

  const steamMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.026, 0.006, 6, 12),
    new THREE.MeshBasicMaterial({
      color: 0xfff9f0,
      transparent: true,
      opacity: 0.65,
    }),
  );
  steamMesh.rotation.x = Math.PI / 2;
  steamMesh.position.set(-0.02, 0.03, 0.165);
  armGroup.add(steamMesh);

  root.add(armGroup);

  return {
    group: root,
    sipper: {
      armGroup,
      headGroup,
      steamMesh,
      phase: phaseSeed,
    },
  };
}

export function PapercraftBoard({
  gameState,
  selectedTile,
  draftPlacements,
  seatInspections,
  focusedTableId,
  cameraPreset = 'general',
  cameraAngleIndex,
  cameraZoom,
  nightMode,
  reducedMotion,
}: PapercraftBoardProps): React.ReactElement {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const threeLibRef = useRef<ThreeLib | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const dynamicGroupRef = useRef<THREE_TYPES.Group | null>(null);
  const cameraRef = useRef<THREE_TYPES.PerspectiveCamera | null>(null);
  const sippersRef = useRef<AnimatedSipper[]>([]);
  const rebuildDynamicRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanupScene: (() => void) | null = null;

    void Promise.all([
      import('three'),
      import('three/addons/environments/RoomEnvironment.js'),
    ]).then(([THREE, { RoomEnvironment }]) => {
      if (cancelled) return;
      threeLibRef.current = THREE;
      const container = canvasMountRef.current;
      if (!container) return;

      let renderer: THREE_TYPES.WebGLRenderer;
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
      renderer.toneMappingExposure = 0.94;
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
      camera.position.set(0, 14.2, 10.5);
      camera.lookAt(0, 0, 0.4);
      cameraRef.current = camera;

      const hemiLight = new THREE.HemisphereLight(
        nightMode ? 0x6b8cce : 0xfff3de,
        0x7a5233,
        nightMode ? 0.58 : 0.75,
      );
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(
        nightMode ? 0xffcb8e : 0xffdfba,
        nightMode ? 0.98 : 1.18,
      );
      keyLight.position.set(-10, 18, 10);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
      }
      scene.add(keyLight);

      const boardGroup = new THREE.Group();
      const floorTex = makeWoodFloorTexture(THREE);
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

      // CENTRAL 3D BAR COUNTER
      const barGroup = new THREE.Group();
      const barCounterGeo = new THREE.BoxGeometry(2.6, 0.42, 2.2);
      const barCounterMat = new THREE.MeshStandardMaterial({
        color: 0x6e472b,
        roughness: 0.65,
        metalness: 0.1,
      });
      const barCounter = new THREE.Mesh(barCounterGeo, barCounterMat);
      barCounter.position.set(0, 0.21, 0);
      barGroup.add(barCounter);

      const barTopGeo = new THREE.BoxGeometry(2.74, 0.07, 2.34);
      const barTopMat = new THREE.MeshStandardMaterial({
        color: 0xfff9f0,
        roughness: 0.72,
        metalness: 0.06,
      });
      const barTop = new THREE.Mesh(barTopGeo, barTopMat);
      barTop.position.set(0, 0.44, 0);
      barGroup.add(barTop);

      const machineMat = new THREE.MeshStandardMaterial({
        color: 0xc9a227,
        roughness: 0.32,
        metalness: 0.68,
      });
      const espressoMachine = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.28, 0.3),
        machineMat,
      );
      espressoMachine.position.set(0, 0.61, -0.78);
      barGroup.add(espressoMachine);

      const catGroup = new THREE.Group();
      const catMat = new THREE.MeshStandardMaterial({
        color: 0xd98e3a,
        roughness: 0.85,
        metalness: 0.05,
      });
      const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), catMat);
      catBody.scale.set(1.25, 0.68, 1.0);
      catBody.position.set(-0.88, 0.52, -0.78);
      const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), catMat);
      catHead.position.set(-0.74, 0.56, -0.72);
      catGroup.add(catBody, catHead);
      barGroup.add(catGroup);
      boardGroup.add(barGroup);

      // 24 TABLES WITH TABLECLOTH, CUPS, SAUCERS & CROISSANT/CANDLE DETAILS
      const pedestalGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.06, 16);
      const columnGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.34, 12);
      const topGeo = new THREE.CylinderGeometry(0.5, 0.48, 0.08, 24);
      const saucerGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.016, 12);
      const tableCupGeo = new THREE.CylinderGeometry(0.044, 0.034, 0.055, 12);
      const candleHolderGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.07, 10);
      const shadowDiscGeo = new THREE.CircleGeometry(0.54, 20);
      shadowDiscGeo.rotateX(-Math.PI / 2);

      const woodDarkMat = new THREE.MeshStandardMaterial({
        color: 0x6e472b,
        roughness: 0.75,
        metalness: 0.1,
      });
      const porcelainMat = new THREE.MeshStandardMaterial({
        color: 0xfff9f0,
        roughness: 0.3,
        metalness: 0.05,
      });
      const croissantMat = new THREE.MeshStandardMaterial({
        color: 0xd98e3a,
        roughness: 0.65,
      });
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xc9a227,
        roughness: 0.35,
        metalness: 0.6,
      });
      const shadowDiscMat = new THREE.MeshBasicMaterial({
        color: 0x3e2f2a,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });

      for (let tIdx = 0; tIdx < gameState.tables.length; tIdx++) {
        const table = gameState.tables[tIdx];
        if (!table) continue;
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

        const topTex = makeTableTopTexture(THREE, table.nation);
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

        const centerpiece = new THREE.Mesh(candleHolderGeo, brassMat);
        centerpiece.position.set(0, 0.455, 0);
        tGroup.add(centerpiece);

        const saucer1 = new THREE.Mesh(saucerGeo, porcelainMat);
        saucer1.position.set(0.22, 0.428, 0.14);
        const cup1 = new THREE.Mesh(tableCupGeo, porcelainMat);
        cup1.position.set(0.22, 0.455, 0.14);
        tGroup.add(saucer1, cup1);

        const saucer2 = new THREE.Mesh(saucerGeo, porcelainMat);
        saucer2.position.set(-0.22, 0.428, -0.14);
        const pastry = new THREE.Mesh(
          new THREE.TorusGeometry(0.038, 0.016, 6, 10, Math.PI * 1.3),
          croissantMat,
        );
        pastry.rotation.x = Math.PI / 2;
        pastry.position.set(-0.22, 0.442, -0.14);
        tGroup.add(saucer2, pastry);

        boardGroup.add(tGroup);
      }

      scene.add(boardGroup);

      const dynamicGroup = new THREE.Group();
      scene.add(dynamicGroup);
      dynamicGroupRef.current = dynamicGroup;

      let frameId = 0;
      let animInterval: ReturnType<typeof setInterval> | null = null;
      let renderBusy = false;
      let renderDirty = false;
      const startTime = performance.now();

      function applyIdleSipping(nowMs: number) {
        const elapsed = (nowMs - startTime) * 0.001;
        for (const sip of sippersRef.current) {
          const wave = Math.max(0, Math.sin(elapsed * 2.2 + sip.phase));
          sip.armGroup.rotation.x = -wave * 0.55;
          sip.armGroup.position.y = 0.38 + wave * 0.05;
          sip.headGroup.rotation.x = wave * 0.16;
          const steamWave = (elapsed * 0.8 + sip.phase) % 1;
          sip.steamMesh.position.y = 0.02 + steamWave * 0.09;
          sip.steamMesh.scale.setScalar(0.8 + steamWave * 0.5);
        }
      }

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
        frameId = requestAnimationFrame((nowMs) => {
          renderDirty = false;
          if (!reducedMotion) {
            applyIdleSipping(nowMs);
          }
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
      rebuildDynamicRef.current?.();
      requestRender();

      if (!reducedMotion) {
        animInterval = setInterval(
          () => {
            requestRender();
          },
          isSoftwareGl ? 140 : 45,
        );
      }

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

      cleanupScene = () => {
        window.removeEventListener('resize', onResize);
        if (animInterval) clearInterval(animInterval);
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        renderer.dispose();
      };
    });

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, [nightMode, reducedMotion, gameState.tables]);

  useEffect(() => {
    const rebuild = () => {
      const THREE = threeLibRef.current;
      const dyn = dynamicGroupRef.current;
      const camera = cameraRef.current;
      const requestRender = requestRenderRef.current;
      if (!THREE || !dyn || !camera || !requestRender) return;

      const angleRad = (cameraAngleIndex * Math.PI) / 2;
      const baseDist =
        cameraPreset === 'bar' ? 6.2 : cameraPreset === 'tables' ? 7.8 : 9.4;
      const baseHeight =
        cameraPreset === 'bar' ? 7.4 : cameraPreset === 'tables' ? 9.8 : 12.2;
      const dist = baseDist / cameraZoom;
      const height = baseHeight / Math.sqrt(cameraZoom);
      let targetX = 0;
      let targetZ = cameraPreset === 'bar' ? 0 : 0.35;
      if (focusedTableId) {
        const fTable = gameState.tables.find((t) => t.id === focusedTableId);
        if (fTable) {
          const pos = gridToWorld(fTable.row, fTable.col);
          targetX = pos.x * 0.72;
          targetZ = pos.z * 0.72;
        }
      }
      camera.position.set(
        targetX + Math.sin(angleRad) * dist,
        height,
        targetZ + Math.cos(angleRad) * dist,
      );
      camera.lookAt(targetX, 0.25, targetZ);

      while (dyn.children.length > 0) {
        const child = dyn.children[0];
        if (child) dyn.remove(child);
      }
      const nextSippers: AnimatedSipper[] = [];

      const chairBaseGeo = new THREE.BoxGeometry(0.44, 0.14, 0.44);
      const cushionHalfGeo = new THREE.BoxGeometry(0.2, 0.06, 0.38);
      const cushionFullGeo = new THREE.BoxGeometry(0.4, 0.06, 0.38);
      const backGeo = new THREE.BoxGeometry(0.42, 0.24, 0.07);
      const ringGeo = new THREE.RingGeometry(0.3, 0.4, 24);
      ringGeo.rotateX(-Math.PI / 2);

      const chairWoodMat = new THREE.MeshStandardMaterial({
        color: 0xb9855a,
        roughness: 0.78,
        metalness: 0.05,
      });

      for (let sIdx = 0; sIdx < gameState.seats.length; sIdx++) {
        const seat = gameState.seats[sIdx];
        if (!seat) continue;
        const { x, z } = gridToWorld(seat.row, seat.col);
        const sGroup = new THREE.Group();
        sGroup.position.set(x, 0, z);

        const baseMesh = new THREE.Mesh(chairBaseGeo, chairWoodMat);
        baseMesh.position.y = 0.07;
        sGroup.add(baseMesh);

        const backMesh = new THREE.Mesh(backGeo, chairWoodMat);
        backMesh.position.set(0, 0.22, -0.18);
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
          leftCushion.position.set(-0.1, 0.16, 0.02);
          const rightCushion = new THREE.Mesh(
            cushionHalfGeo,
            new THREE.MeshStandardMaterial({ color: colorB, roughness: 0.8 }),
          );
          rightCushion.position.set(0.1, 0.16, 0.02);
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
          const adjTable = gameState.tables.find((t) => t.seatIds.includes(seat.id));
          const tableWorld = adjTable
            ? gridToWorld(adjTable.row, adjTable.col)
            : { x: 0, z: 0 };
          const { group: guestGroup, sipper } = createSeatedGuest3D(
            THREE,
            occupantTile,
            natA,
            sIdx * 0.7,
            tableWorld,
            { x, z },
          );
          guestGroup.scale.setScalar(1.26);
          sGroup.add(guestGroup);
          nextSippers.push(sipper);
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

      // 20 BAR COASTERS + BAR STOOLS + 3D SEATED PEOPLE AT THE BAR
      const coasterGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16);
      const stoolGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.2, 12);
      const positiveCoasterMat = new THREE.MeshStandardMaterial({
        color: 0x3f5e4a,
        roughness: 0.65,
      });
      const negativeCoasterMat = new THREE.MeshStandardMaterial({
        color: 0xa94438,
        roughness: 0.65,
      });
      const occupiedCoasterMat = new THREE.MeshStandardMaterial({
        color: 0xc9a227,
        roughness: 0.45,
        metalness: 0.35,
      });

      for (let bIdx = 0; bIdx < 20; bIdx++) {
        const colIdx = bIdx % 5;
        const rowIdx = Math.floor(bIdx / 5);
        const val = gameState.barValues[bIdx] ?? -14;
        const barOccupant = gameState.bar[bIdx] ?? null;

        const cx = (colIdx - 2) * 0.46;
        const cz = (rowIdx - 1.5) * 0.42 + 0.15;

        const coasterMesh = new THREE.Mesh(
          coasterGeo,
          barOccupant ? occupiedCoasterMat : val > 0 ? positiveCoasterMat : negativeCoasterMat,
        );
        coasterMesh.position.set(cx, 0.485, cz);
        coasterMesh.name = `bar-coaster-${bIdx + 1}`;
        dyn.add(coasterMesh);

        if (barOccupant) {
          const stool = new THREE.Mesh(stoolGeo, chairWoodMat);
          stool.position.set(cx, 0.36, cz);
          dyn.add(stool);

          const { group: barGuest, sipper } = createSeatedGuest3D(
            THREE,
            barOccupant,
            barOccupant.nation === 'joker' ? 'fr' : barOccupant.nation,
            (bIdx + 30) * 0.65,
          );
          barGuest.scale.setScalar(1.04);
          barGuest.position.set(cx, 0.3, cz);
          dyn.add(barGuest);
          nextSippers.push(sipper);
        }
      }

      sippersRef.current = nextSippers;
      requestRender();
    };

    rebuildDynamicRef.current = rebuild;
    rebuild();
  }, [
    gameState,
    selectedTile,
    draftPlacements,
    seatInspections,
    cameraPreset,
    cameraAngleIndex,
    cameraZoom,
    focusedTableId,
  ]);

  const seatedAtTablesCount = gameState.seats.filter((s) => s.occupant !== null).length;
  const seatedAtBarCount = gameState.bar.filter((b) => b !== null).length;

  return (
    <div
      className="relative w-full h-[360px] sm:h-[460px] rounded-2xl overflow-hidden border border-[#3E2F2A]/20"
      data-testid="cafe-3d-diorama"
    >
      <div ref={canvasMountRef} className="w-full h-full" />
      <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2 text-xs font-semibold bg-[#FFF9F0]/92 text-[#3E2F2A] px-3 py-1 rounded-xl shadow-xs border border-[#3E2F2A]/15">
        <span>Café Vivo 3D</span>
        <span aria-hidden="true">·</span>
        <span>{seatedAtTablesCount} en mesas</span>
        <span aria-hidden="true">·</span>
        <span>{seatedAtBarCount}/20 en barra</span>
        <span aria-hidden="true">·</span>
        <span>Zoom {Math.round(cameraZoom * 100)}%</span>
      </div>
      <div
        className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-serif text-[#3E2F2A] bg-[#C9A227]/30 border border-[#C9A227]/70 px-2.5 py-0.5 rounded-lg"
        title="Placa conmemorativa del café"
      >
        Placa de latón · O &amp; A
      </div>
    </div>
  );
}

export default PapercraftBoard;
