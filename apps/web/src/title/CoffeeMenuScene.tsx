import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
  getMenuMode,
  MENU_MODES,
  MODE_ROTATIONS,
  nearestModeFromRotation,
  type IngredientSpec,
  type MenuMode,
  type MenuModeConfig,
} from './menuModes';
import { createCanLabelTexture } from './canLabelTexture';

export type CoffeeMenuSceneProps = {
  mode: MenuMode;
  progress: number;
  layout: 'mobile' | 'desktop';
  interactive: boolean;
  reducedMotion: boolean;
  serving: boolean;
  canServe: boolean;
  onModeChange: (mode: MenuMode) => void;
  onServe: () => void;
};

const TWO_PI = Math.PI * 2;

function nearestEquivalent(target: number, reference: number): number {
  return target + Math.round((reference - target) / TWO_PI) * TWO_PI;
}

export function useCanLabelTexture(): THREE.CanvasTexture | null {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createCanLabelTexture().then((created) => {
      if (cancelled) {
        created.dispose();
        return;
      }
      textureRef.current = created;
      setTexture(created);
    });
    return () => {
      cancelled = true;
      textureRef.current?.dispose();
      textureRef.current = null;
    };
  }, []);

  return texture;
}

function useCanBodyGeometry(): THREE.LatheGeometry {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.62, 0),
      new THREE.Vector2(0.68, 0.04),
      new THREE.Vector2(0.68, 0.12),
      new THREE.Vector2(0.7, 0.16),
      new THREE.Vector2(0.7, 2.14),
      new THREE.Vector2(0.66, 2.2),
      new THREE.Vector2(0.58, 2.24),
      new THREE.Vector2(0.58, 2.3),
      new THREE.Vector2(0, 2.3),
    ];
    return new THREE.LatheGeometry(points, 72);
  }, []);
}

export function CanModel({
  labelTexture,
  active,
  reducedMotion,
}: {
  labelTexture: THREE.CanvasTexture | null;
  active: boolean;
  reducedMotion: boolean;
}): React.ReactElement {
  const bodyGeometry = useCanBodyGeometry();
  const brass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#B68950',
        metalness: 0.82,
        roughness: 0.28,
      }),
    [],
  );
  const brassDark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7A542F',
        metalness: 0.75,
        roughness: 0.36,
      }),
    [],
  );
  const paper = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF8EC',
        roughness: 0.65,
        metalness: 0.02,
      }),
    [],
  );
  const labelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        map: null,
        roughness: 0.62,
        metalness: 0.02,
      }),
    [],
  );

  useEffect(() => {
    labelMaterial.map = labelTexture;
    labelMaterial.color.set(labelTexture ? '#FFFFFF' : '#FFF8EC');
    labelMaterial.needsUpdate = true;
  }, [labelMaterial, labelTexture]);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      brass.dispose();
      brassDark.dispose();
      paper.dispose();
      labelMaterial.dispose();
    },
    [bodyGeometry, brass, brassDark, paper, labelMaterial],
  );

  return (
    <group>
      <mesh geometry={bodyGeometry} material={brass} />

      {/* Main paper label: three 120° panels, one per menu mode. */}
      <mesh position={[0, 1.0, 0]} rotation={[0, -Math.PI / 3, 0]}>
        <cylinderGeometry args={[0.706, 0.706, 1.46, 72, 1, true]} />
        <primitive object={labelMaterial} attach="material" />
      </mesh>

      {/* Paper edge / brass bands */}
      {[0.27, 1.73].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={brassDark}>
          <torusGeometry args={[0.708, 0.014, 6, 72]} />
        </mesh>
      ))}

      {/* Top rim, lid and brass knob */}
      <mesh position={[0, 2.23, 0]} rotation={[Math.PI / 2, 0, 0]} material={brassDark}>
        <torusGeometry args={[0.6, 0.025, 8, 72]} />
      </mesh>
      <mesh position={[0, 2.3, 0]} material={brass}>
        <cylinderGeometry args={[0.61, 0.61, 0.08, 72]} />
      </mesh>
      <mesh position={[0, 2.37, 0]} material={brassDark}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 24]} />
      </mesh>
      <mesh position={[0, 2.42, 0]} material={brass}>
        <sphereGeometry args={[0.08, 20, 14]} />
      </mesh>

      {/* Bottom rim */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={brassDark}>
        <torusGeometry args={[0.65, 0.018, 6, 72]} />
      </mesh>

      {/* Active halo under the can */}
      {active && (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.02, 64]} />
          <meshBasicMaterial color="#F4C15D" transparent opacity={reducedMotion ? 0.18 : 0.3} />
        </mesh>
      )}

      {/* Small paper tag hanging from the lid */}
      <group position={[0.48, 1.98, 0.47]} rotation={[0.05, 0.3, 0.08]}>
        <mesh material={paper}>
          <boxGeometry args={[0.12, 0.22, 0.01]} />
        </mesh>
        <mesh position={[0, 0.07, 0.008]} material={brassDark}>
          <torusGeometry args={[0.025, 0.006, 6, 16]} />
        </mesh>
      </group>
    </group>
  );
}

export function Bean(): React.ReactElement {
  return (
    <group>
      <mesh scale={[1, 1.32, 0.58]} castShadow={false}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#4B2A17" roughness={0.56} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.094]} scale={[0.16, 1.05, 0.16]}>
        <boxGeometry args={[0.035, 0.24, 0.035]} />
        <meshStandardMaterial color="#2A140B" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CinnamonStick(): React.ReactElement {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.055, 0.05, 0.84, 12]} />
        <meshStandardMaterial color="#8C4A2A" roughness={0.78} />
      </mesh>
      <mesh position={[0.018, 0.01, 0.02]}>
        <cylinderGeometry args={[0.035, 0.032, 0.86, 10]} />
        <meshStandardMaterial color="#A65A32" roughness={0.72} />
      </mesh>
      <mesh position={[-0.024, 0, -0.02]}>
        <cylinderGeometry args={[0.022, 0.02, 0.85, 8]} />
        <meshStandardMaterial color="#5E2E1B" roughness={0.8} />
      </mesh>
    </group>
  );
}

function OrangePeel(): React.ReactElement {
  return (
    <group rotation={[0.5, 0.2, 0.35]}>
      <mesh rotation={[0.2, 0.4, 0.1]}>
        <torusGeometry args={[0.3, 0.035, 6, 26, Math.PI * 1.35]} />
        <meshStandardMaterial color="#D9772E" roughness={0.68} />
      </mesh>
      <mesh rotation={[0.5, 0.1, -0.2]} position={[0.02, 0.02, 0.02]}>
        <torusGeometry args={[0.26, 0.012, 5, 22, Math.PI * 1.15]} />
        <meshStandardMaterial color="#F2A24D" roughness={0.6} />
      </mesh>
    </group>
  );
}

function CoffeeFlower(): React.ReactElement {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * TWO_PI;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0]}
            rotation={[0, 0, angle]}
            scale={[1, 0.42, 0.25]}
          >
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color="#FFF8EC" roughness={0.82} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.035]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#E5B93C" roughness={0.6} />
      </mesh>
    </group>
  );
}

function VanillaPod(): React.ReactElement {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.03, -0.34, 0),
      new THREE.Vector3(0.03, -0.14, 0.03),
      new THREE.Vector3(-0.015, 0.1, -0.04),
      new THREE.Vector3(0.07, 0.3, 0.01),
      new THREE.Vector3(0.05, 0.4, 0.03),
    ]);
  }, []);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 24, 0.032, 7, false]} />
        <meshStandardMaterial color="#3E2417" roughness={0.76} />
      </mesh>
      <mesh position={[0.012, 0.02, 0.018]}>
        <tubeGeometry args={[curve, 24, 0.008, 5, false]} />
        <meshStandardMaterial color="#C8A12A" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Cardamom(): React.ReactElement {
  return (
    <group>
      <mesh>
        <capsuleGeometry args={[0.055, 0.17, 4, 8]} />
        <meshStandardMaterial color="#7C8C4A" roughness={0.78} />
      </mesh>
      <mesh position={[0.025, 0.07, 0.02]} rotation={[0.2, 0.1, 0.2]}>
        <capsuleGeometry args={[0.018, 0.05, 3, 6]} />
        <meshStandardMaterial color="#B8C57B" roughness={0.7} />
      </mesh>
    </group>
  );
}

function ChocolateChunk(): React.ReactElement {
  return (
    <mesh scale={[1.05, 0.78, 0.9]}>
      <dodecahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial color="#3B2118" roughness={0.58} metalness={0.02} />
    </mesh>
  );
}

function StarAnise(): React.ReactElement {
  return (
    <group>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
        const angle = (index / 8) * TWO_PI;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0]}
            rotation={[0, 0, angle]}
          >
            <coneGeometry args={[0.045, 0.16, 4]} />
            <meshStandardMaterial color="#5C2F1B" roughness={0.8} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.03]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color="#C08442" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CocoaNib(): React.ReactElement {
  return (
    <mesh scale={[1, 0.7, 0.9]}>
      <tetrahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color="#4C2C19" roughness={0.7} />
    </mesh>
  );
}

function IngredientShape({ kind }: { kind: IngredientSpec['kind'] }): React.ReactElement {
  switch (kind) {
    case 'bean':
      return <Bean />;
    case 'cinnamon':
      return <CinnamonStick />;
    case 'orange':
      return <OrangePeel />;
    case 'flower':
      return <CoffeeFlower />;
    case 'vanilla':
      return <VanillaPod />;
    case 'cardamom':
      return <Cardamom />;
    case 'chocolate':
      return <ChocolateChunk />;
    case 'anise':
      return <StarAnise />;
    case 'cocoa':
    default:
      return <CocoaNib />;
  }
}

function FloatingIngredient({
  spec,
  reducedMotion,
}: {
  spec: IngredientSpec;
  reducedMotion: boolean;
}): React.ReactElement {
  const inner = useRef<THREE.Group | null>(null);
  const intro = useRef(0);
  const phase = useMemo(() => {
    let hash = 0;
    for (const char of spec.id) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
    return hash / 1000;
  }, [spec.id]);

  useFrame((state, delta) => {
    if (!inner.current) return;
    intro.current = Math.min(1, intro.current + delta * 2.4);
    const time = state.clock.elapsedTime;
    inner.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.8 + phase * 8) * 0.075;
    inner.current.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.55 + phase * 6) * 0.08;
    inner.current.rotation.x = reducedMotion ? 0 : Math.cos(time * 0.4 + phase * 5) * 0.05;
    inner.current.scale.setScalar(0.65 + intro.current * 0.35);
  });

  return (
    <group position={spec.position} rotation={spec.rotation} scale={spec.scale}>
      <group ref={inner}>
        <IngredientShape kind={spec.kind} />
      </group>
    </group>
  );
}

function ModeIngredients({
  mode,
  reducedMotion,
}: {
  mode: MenuModeConfig;
  reducedMotion: boolean;
}): React.ReactElement {
  return (
    <group key={mode.id}>
      {mode.ingredients.map((spec) => (
        <FloatingIngredient key={spec.id} spec={spec} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

export function CupWithSteam({
  reducedMotion,
  position = [-2.05, -1.17, 0.55],
  scale = 1,
}: {
  reducedMotion: boolean;
  position?: [number, number, number];
  scale?: number;
}): React.ReactElement {
  const steamRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    if (reducedMotion) return;
    steamRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const progress = (state.clock.elapsedTime * 0.22 + index * 0.33) % 1;
      mesh.position.y = 0.52 + progress * 0.55;
      mesh.position.x = Math.sin(progress * 8 + index) * 0.05;
      mesh.scale.setScalar(0.05 + progress * 0.055);
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, (1 - progress) * 0.22);
    });
  });

  return (
    <group position={position} scale={scale} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.47, 0.45, 0.04, 32]} />
        <meshStandardMaterial color="#FFF8EC" roughness={0.4} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.3, 0.24, 0.38, 28]} />
        <meshStandardMaterial color="#FFF8EC" roughness={0.34} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 28]} />
        <meshStandardMaterial color="#4B2A17" roughness={0.35} />
      </mesh>
      <mesh position={[0.3, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.022, 8, 20]} />
        <meshStandardMaterial color="#FFF8EC" roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            steamRefs.current[index] = node;
          }}
          position={[0, 0.55, 0]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#FFF8EC" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#9A6844');
    gradient.addColorStop(0.5, '#845434');
    gradient.addColorStop(1, '#6F4328');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    let seed = 7;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    for (let index = 0; index < 46; index += 1) {
      const y = random() * 512;
      const alpha = 0.05 + random() * 0.1;
      ctx.strokeStyle = random() > 0.5 ? `rgba(52, 28, 16, ${alpha})` : `rgba(214, 164, 112, ${alpha * 0.8})`;
      ctx.lineWidth = 0.7 + random() * 2.2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 64) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + index) * (2 + random() * 4));
      }
      ctx.stroke();
    }

    for (let index = 0; index < 7; index += 1) {
      const x = random() * 512;
      const y = random() * 512;
      ctx.strokeStyle = 'rgba(49, 27, 16, 0.18)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(x, y, 12 + random() * 26, 3 + random() * 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1.6);
  texture.needsUpdate = true;
  return texture;
}

function BarAndCup({ reducedMotion }: { reducedMotion: boolean }): React.ReactElement {
  const woodTexture = useMemo(() => createWoodTexture(), []);
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        color: '#C08A5E',
        roughness: 0.74,
        metalness: 0.02,
      }),
    [woodTexture],
  );

  useEffect(
    () => () => {
      woodTexture.dispose();
      woodMaterial.dispose();
    },
    [woodTexture, woodMaterial],
  );

  return (
    <group>
      <RoundedBox
        args={[12, 0.48, 4.8]}
        radius={0.14}
        smoothness={4}
        position={[0, -1.45, -0.45]}
        castShadow={false}
        receiveShadow={false}
      >
        <primitive object={woodMaterial} attach="material" />
      </RoundedBox>

      {/* Brass edge line on the bar */}
      <mesh position={[0, -1.205, 1.94]}>
        <boxGeometry args={[11.8, 0.018, 0.018]} />
        <meshStandardMaterial color="#C8A12A" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Paper doily under the can */}
      <mesh position={[0, -1.198, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.22, 64]} />
        <meshStandardMaterial color="#FFF8EC" roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.196, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.18, 64]} />
        <meshStandardMaterial color="#C8A12A" roughness={0.5} metalness={0.3} />
      </mesh>

      <CupWithSteam reducedMotion={reducedMotion} />
    </group>
  );
}

function ModeLights({ mode }: { mode: MenuModeConfig }): React.ReactElement {
  return (
    <group>
      <ambientLight intensity={0.62} color={mode.theme.paper} />
      <directionalLight position={[4.5, 7, 6]} intensity={2.15} color="#FFF1D6" />
      <directionalLight position={[-5, 3.5, -4]} intensity={1.05} color={mode.theme.glow} />
      <spotLight
        position={[0, 6, 3.5]}
        angle={0.7}
        penumbra={0.85}
        intensity={3.2}
        color={mode.theme.glow}
      />
    </group>
  );
}

function CameraRig({
  progress,
  layout,
  reducedMotion,
}: {
  progress: number;
  layout: 'mobile' | 'desktop';
  reducedMotion: boolean;
}): null {
  const camera = useThree((state) => state.camera);
  const smooth = useRef(0);
  const target = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    smooth.current = reducedMotion
      ? progress
      : THREE.MathUtils.damp(smooth.current, progress, 5, delta);
    const p = smooth.current;

    const heroPosition: [number, number, number] =
      layout === 'desktop' ? [0, 1.9, 11.4] : [0, 2, 12.2];
    const reservePosition: [number, number, number] =
      layout === 'desktop' ? [0.55, 1.5, 8.2] : [0, 1.85, 9.4];
    const heroTarget: [number, number, number] =
      layout === 'desktop' ? [0, 0.55, 0] : [0, 0.5, 0];
    const reserveTarget: [number, number, number] =
      layout === 'desktop' ? [-0.62, 0.05, 0] : [0, -0.18, 0];

    camera.position.set(
      THREE.MathUtils.lerp(heroPosition[0], reservePosition[0], p),
      THREE.MathUtils.lerp(heroPosition[1], reservePosition[1], p),
      THREE.MathUtils.lerp(heroPosition[2], reservePosition[2], p),
    );
    target.current.set(
      THREE.MathUtils.lerp(heroTarget[0], reserveTarget[0], p),
      THREE.MathUtils.lerp(heroTarget[1], reserveTarget[1], p),
      THREE.MathUtils.lerp(heroTarget[2], reserveTarget[2], p),
    );
    camera.lookAt(target.current);
  });

  return null;
}

function SceneContent({
  mode,
  progress,
  layout,
  interactive,
  reducedMotion,
  serving,
  canServe,
  onModeChange,
  onServe,
}: CoffeeMenuSceneProps): React.ReactElement {
  const modeConfig = getMenuMode(mode);
  const labelTexture = useCanLabelTexture();
  const stage = useRef<THREE.Group | null>(null);
  const can = useRef<THREE.Group | null>(null);
  const targetRotation = useRef(MODE_ROTATIONS[mode]);
  const smoothProgress = useRef(0);
  const lastMode = useRef<MenuMode>(mode);
  const modeRef = useRef<MenuMode>(mode);
  const servingRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const dragDistance = useRef(0);
  const dragStartedAt = useRef(0);
  const lastWheelAt = useRef(0);
  const { gl } = useThree();
  const onModeChangeRef = useRef(onModeChange);
  const onServeRef = useRef(onServe);
  const canServeRef = useRef(canServe);
  onModeChangeRef.current = onModeChange;
  onServeRef.current = onServe;
  canServeRef.current = canServe;

  const selectMode = React.useCallback((nextMode: MenuMode) => {
    if (nextMode === modeRef.current) return;
    targetRotation.current = nearestEquivalent(
      MODE_ROTATIONS[nextMode],
      targetRotation.current,
    );
    modeRef.current = nextMode;
    lastMode.current = nextMode;
    onModeChangeRef.current(nextMode);
  }, []);

  useEffect(() => {
    if (mode === lastMode.current) {
      modeRef.current = mode;
      return;
    }
    const previous = getMenuMode(lastMode.current);
    const next = getMenuMode(mode);
    const steps = (next.index - previous.index + MENU_MODES.length) % MENU_MODES.length;
    targetRotation.current -= (steps * TWO_PI) / 3;
    lastMode.current = mode;
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (serving && !servingRef.current) {
      servingRef.current = true;
      const base = MODE_ROTATIONS[modeRef.current];
      let target = base;
      while (target < targetRotation.current + TWO_PI) target += TWO_PI;
      targetRotation.current = target;
    }
    if (!serving) {
      servingRef.current = false;
    }
  }, [serving]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current || !can.current) return;
      const dx = event.clientX - dragStartX.current;
      dragDistance.current += dx;
      targetRotation.current = dragStartRotation.current + dx * 0.011;
      dragStartRotation.current = targetRotation.current;
      dragStartX.current = event.clientX;
    };
    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      gl.domElement.style.cursor = '';
      const duration = performance.now() - dragStartedAt.current;
      const isServingFlick =
        canServeRef.current && Math.abs(dragDistance.current) > 560;
      if (typeof window !== 'undefined') {
        (window as unknown as { __CAFETULIA_DRAG__?: unknown }).__CAFETULIA_DRAG__ = {
          duration,
          distance: dragDistance.current,
          canServe: canServeRef.current,
          served: isServingFlick,
        };
      }
      if (isServingFlick) {
        onServeRef.current();
        return;
      }
      const nearest = nearestModeFromRotation(targetRotation.current);
      targetRotation.current = nearestEquivalent(
        MODE_ROTATIONS[nearest],
        targetRotation.current,
      );
      selectMode(nearest);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [gl, selectMode]);

  useEffect(() => {
    const element = gl.domElement;
    const onWheel = (event: WheelEvent) => {
      if (!interactive) return;
      if (Math.abs(event.deltaY) < 2) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheelAt.current < 380) return;
      lastWheelAt.current = now;
      const currentIndex = getMenuMode(modeRef.current).index;
      const offset = event.deltaY > 0 ? 1 : MENU_MODES.length - 1;
      const next = MENU_MODES[(currentIndex + offset) % MENU_MODES.length];
      if (next) selectMode(next.id);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [gl, interactive, selectMode]);

  useFrame((state, delta) => {
    smoothProgress.current = reducedMotion
      ? progress
      : THREE.MathUtils.damp(smoothProgress.current, progress, 5, delta);
    const p = smoothProgress.current;
    if (stage.current) {
      stage.current.position.x = THREE.MathUtils.damp(
        stage.current.position.x,
        layout === 'desktop' ? -1.02 * p : 0,
        5,
        delta,
      );
      stage.current.scale.setScalar(1 + p * 0.03);
    }
    if (can.current) {
      const desired = targetRotation.current + (1 - p) * 0.22;
      can.current.rotation.y = reducedMotion
        ? desired
        : THREE.MathUtils.damp(can.current.rotation.y, desired, 6, delta);
      if (typeof window !== 'undefined') {
        (window as unknown as { __CAFETULIA_CAN_ROTATION__?: number }).__CAFETULIA_CAN_ROTATION__ =
          can.current.rotation.y;
      }
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    event.stopPropagation();
    dragging.current = true;
    dragStartX.current = event.nativeEvent.clientX;
    dragStartRotation.current = targetRotation.current;
    dragDistance.current = 0;
    dragStartedAt.current = performance.now();
    gl.domElement.style.cursor = 'grabbing';
    try {
      gl.domElement.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is a progressive enhancement.
    }
  };

  return (
    <>
      <CameraRig progress={progress} layout={layout} reducedMotion={reducedMotion} />
      <ModeLights mode={modeConfig} />
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#FFF4DD"
          position={[0, 6, -5]}
          scale={[12, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#FFD6A0"
          position={[-6, 3, 3]}
          rotation-y={Math.PI / 2}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#FFFFFF"
          position={[6, 2, 4]}
          rotation-y={-Math.PI / 2}
          scale={[5, 5, 1]}
        />
      </Environment>

      <group ref={stage} position={[0, 0, 0]}>
        <BarAndCup reducedMotion={reducedMotion} />
        <ContactShadows
          position={[0, -1.19, 0]}
          opacity={0.4}
          scale={8}
          blur={2.8}
          far={3}
          resolution={256}
          color="#2B1710"
          frames={1}
        />

        <group ref={can} position={[0, -1.18, 0]}>
          <CanModel
            labelTexture={labelTexture}
            active={interactive}
            reducedMotion={reducedMotion}
          />
        </group>

        <ModeIngredients mode={modeConfig} reducedMotion={reducedMotion} />

        {/* Invisible drag surface around the can */}
        <mesh position={[0, 0.05, 0.2]} onPointerDown={handlePointerDown}>
          <cylinderGeometry args={[1.25, 1.25, 3.1, 16, 1, false]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

export default function CoffeeMenuScene(props: CoffeeMenuSceneProps): React.ReactElement {
  return (
    <Canvas
      dpr={props.layout === 'mobile' ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 28, position: [0, 1.5, 9.45], near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        touchAction: 'pan-y',
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
