import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
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
import { createCanLabelTextures } from './canLabelTexture';
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
export function useCanLabelTextures(): Record<MenuMode, THREE.CanvasTexture> | null {
  const [textures, setTextures] = useState<Record<MenuMode, THREE.CanvasTexture> | null>(null);
  const texturesRef = useRef<Record<MenuMode, THREE.CanvasTexture> | null>(null);
  useEffect(() => {
    let cancelled = false;
    void createCanLabelTextures().then((created) => {
      if (cancelled) {
        Object.values(created).forEach((texture) => texture.dispose());
        return;
      }
      texturesRef.current = created;
      setTextures(created);
    });
    return () => {
      cancelled = true;
      if (texturesRef.current) {
        Object.values(texturesRef.current).forEach((texture) => texture.dispose());
        texturesRef.current = null;
      }
    };
  }, []);
  return textures;
}
function useCanBodyGeometry(): THREE.LatheGeometry {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.46, 0),
      new THREE.Vector2(0.57, 0.02),
      new THREE.Vector2(0.63, 0.06),
      new THREE.Vector2(0.65, 0.12),
      new THREE.Vector2(0.65, 2.18),
      new THREE.Vector2(0.63, 2.28),
      new THREE.Vector2(0.57, 2.45),
      new THREE.Vector2(0.54, 2.56),
      new THREE.Vector2(0.54, 2.62),
      new THREE.Vector2(0.58, 2.64),
      new THREE.Vector2(0.58, 2.68),
      new THREE.Vector2(0, 2.68),
    ];
    return new THREE.LatheGeometry(points, 96);
  }, []);
}
function CanModel({
  labelTextures,
  mode,
}: {
  labelTextures: Record<MenuMode, THREE.CanvasTexture> | null;
  mode: MenuMode;
}): React.ReactElement {
  const bodyGeometry = useCanBodyGeometry();
  const aluminum = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D9D9D9', metalness: 0.9, roughness: 0.22 }),
    [],
  );
  const aluminumDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9C9C9C', metalness: 0.82, roughness: 0.3 }),
    [],
  );
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#C05A35', metalness: 0.52, roughness: 0.38 }),
    [],
  );
  const labelMaterials = useMemo(
    () =>
      MENU_MODES.reduce<Record<MenuMode, THREE.MeshStandardMaterial>>(
        (materials, item) => {
          materials[item.id] = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            map: null,
            transparent: true,
            opacity: item.id === mode ? 1 : 0,
            depthWrite: false,
            roughness: 0.34,
            metalness: 0.18,
          });
          return materials;
        },
        {} as Record<MenuMode, THREE.MeshStandardMaterial>,
      ),
    /* The mode at mount only decides the initial opacity; later changes are damped in useFrame and must not recreate the materials. eslint-disable-next-line react-hooks/exhaustive-deps */ [],
  );
  const dropletMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF8EC',
        transparent: true,
        opacity: 0.44,
        roughness: 0.12,
        metalness: 0.1,
      }),
    [],
  );
  const bodyTarget = useMemo(() => new THREE.Color(getMenuMode(mode).theme.canColor), [mode]);
  const opacities = useRef<Record<MenuMode, number>>({
    join: mode === 'join' ? 1 : 0,
    create: mode === 'create' ? 1 : 0,
    solo: mode === 'solo' ? 1 : 0,
  });
  useEffect(() => {
    MENU_MODES.forEach((item) => {
      const material = labelMaterials[item.id];
      material.map = labelTextures?.[item.id] ?? null;
      material.color.set(material.map ? '#FFFFFF' : item.theme.canColor);
      material.needsUpdate = true;
    });
  }, [labelTextures, labelMaterials]);
  useEffect(
    () => () => {
      bodyGeometry.dispose();
      aluminum.dispose();
      aluminumDark.dispose();
      bodyMaterial.dispose();
      dropletMaterial.dispose();
      Object.values(labelMaterials).forEach((material) => material.dispose());
    },
    [bodyGeometry, aluminum, aluminumDark, bodyMaterial, dropletMaterial, labelMaterials],
  );
  useFrame((_, delta) => {
    bodyMaterial.color.lerp(bodyTarget, 1 - Math.exp(-4 * delta));
    MENU_MODES.forEach((item) => {
      const target = item.id === mode ? 1 : 0;
      const current = opacities.current[item.id];
      const next = THREE.MathUtils.damp(current, target, 3.2, delta);
      opacities.current[item.id] = next;
      const material = labelMaterials[item.id];
      material.opacity = next;
      material.visible = next > 0.002;
    });
  });
  const droplets = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = -0.9 + (index / 13) * 1.8;
        const y = 0.28 + ((index * 0.73) % 1.7);
        return { angle, y, radius: 0.668, size: 0.012 + (index % 3) * 0.005 };
      }),
    [],
  );
  return (
    <group>
      {/* Coloured aluminium body behind the printed wraps */}
      <mesh geometry={bodyGeometry} material={bodyMaterial} />
      {/* Three full-wrap labels crossfade while the can turns */}
      {MENU_MODES.map((item, index) => (
        <mesh
          key={item.id}
          position={[0, 1.12, 0]}
          rotation={[0, -Math.PI / 3, 0]}
          renderOrder={index + 1}
        >
          <cylinderGeometry
            args={[0.656 + index * 0.0006, 0.656 + index * 0.0006, 2.12, 96, 1, true]}
          />
          <primitive object={labelMaterials[item.id]} attach="material" />
        </mesh>
      ))}
      {/* Top and bottom printed edges */}
      {[0.065, 2.175].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={aluminumDark}>
          <torusGeometry args={[0.669, 0.009, 6, 96]} />
        </mesh>
      ))}
      {/* Bottom rim */}
      <mesh position={[0, 0.055, 0]} rotation={[Math.PI / 2, 0, 0]} material={aluminumDark}>
        <torusGeometry args={[0.61, 0.018, 8, 96]} />
      </mesh>
      {/* Lid, rim and pull tab */}
      <mesh position={[0, 2.665, 0]} material={aluminum}>
        <cylinderGeometry args={[0.56, 0.56, 0.035, 96]} />
      </mesh>
      <mesh position={[0, 2.683, 0]} rotation={[Math.PI / 2, 0, 0]} material={aluminumDark}>
        <torusGeometry args={[0.57, 0.018, 8, 96]} />
      </mesh>
      <group position={[0.18, 2.71, 0.08]} rotation={[0, -0.35, 0]}>
        <mesh material={aluminumDark}>
          <boxGeometry args={[0.22, 0.018, 0.1]} />
        </mesh>
        <mesh position={[0.13, 0.002, 0]} rotation={[Math.PI / 2, 0, 0]} material={aluminum}>
          <torusGeometry args={[0.045, 0.011, 6, 20]} />
        </mesh>
        <mesh position={[-0.09, 0.001, 0]} material={aluminumDark}>
          <cylinderGeometry args={[0.014, 0.014, 0.012, 12]} />
        </mesh>
      </group>
      {/* Cold condensation */}
      {droplets.map((droplet, index) => (
        <mesh
          key={index}
          position={[
            Math.sin(droplet.angle) * droplet.radius,
            droplet.y,
            Math.cos(droplet.angle) * droplet.radius,
          ]}
          material={dropletMaterial}
        >
          <sphereGeometry args={[droplet.size, 6, 5]} />
        </mesh>
      ))}
    </group>
  );
}
export function Bean(): React.ReactElement {
  return (
    <group>
      <mesh scale={[1, 1.32, 0.58]}>
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
  return (
    <group rotation={[0.12, 0.25, 0.4]}>
      <mesh scale={[0.72, 1.65, 0.42]}>
        <capsuleGeometry args={[0.045, 0.22, 4, 12]} />
        <meshStandardMaterial color="#3E2417" roughness={0.74} />
      </mesh>
      <mesh position={[0.018, 0.01, 0.03]} scale={[0.55, 1.5, 0.36]}>
        <capsuleGeometry args={[0.012, 0.2, 4, 8]} />
        <meshStandardMaterial color="#8A5A3F" roughness={0.6} />
      </mesh>
      <mesh position={[-0.022, -0.06, 0.026]} scale={[0.5, 0.8, 0.32]}>
        <capsuleGeometry args={[0.009, 0.1, 3, 6]} />
        <meshStandardMaterial color="#1E130E" roughness={0.8} />
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
  progress,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  spec: IngredientSpec;
  progress: number;
  reducedMotion: boolean;
  pointerWorld: React.RefObject<THREE.Vector3>;
  layout: 'mobile' | 'desktop';
}): React.ReactElement {
  const outer = useRef<THREE.Group | null>(null);
  const inner = useRef<THREE.Group | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const intro = useRef(0);
  const world = useMemo(() => new THREE.Vector3(), []);
  const phase = useMemo(() => {
    let hash = 0;
    for (const char of spec.id) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
    return hash / 1000;
  }, [spec.id]);
  useFrame((state, delta) => {
    if (!outer.current || !inner.current) return;
    intro.current = Math.min(1, intro.current + delta * 2.1);
    const time = state.clock.elapsedTime;
    let targetX = 0;
    let targetY = 0;
    let influence = 0;
    if (!reducedMotion) {
      outer.current.getWorldPosition(world);
      const dx = world.x - pointerWorld.current.x;
      const dy = world.y - pointerWorld.current.y;
      const distance = Math.hypot(dx, dy);
      influence = Math.max(0, 1 - distance / (layout === 'mobile' ? 1.35 : 2.1));
      if (distance > 0.001) {
        targetX = (dx / distance) * influence * 0.3;
        targetY = (dy / distance) * influence * 0.22;
      }
    }
    offset.current.x = THREE.MathUtils.damp(offset.current.x, targetX, 8, delta);
    offset.current.y = THREE.MathUtils.damp(offset.current.y, targetY, 8, delta);
    const reserveX =
      layout === 'desktop' ? -Math.abs(spec.position[0]) * 0.8 - 0.65 : spec.position[0];
    const reserveY = layout === 'desktop' ? spec.position[1] + 0.1 : spec.position[1];
    const baseOffsetX = (reserveX - spec.position[0]) * progress;
    const baseOffsetY = (reserveY - spec.position[1]) * progress;
    outer.current.position.x = baseOffsetX + offset.current.x;
    outer.current.position.y = baseOffsetY + offset.current.y;
    inner.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.8 + phase * 8) * 0.06;
    inner.current.rotation.z = reducedMotion
      ? 0
      : Math.sin(time * 0.55 + phase * 6) * 0.08 + influence * 0.45;
    inner.current.rotation.x = reducedMotion ? 0 : Math.cos(time * 0.4 + phase * 5) * 0.05;
    const targetScale = 0.72 + intro.current * 0.28;
    inner.current.scale.setScalar(targetScale * (1 - influence * 0.08));
  });
  return (
    <group position={spec.position} rotation={spec.rotation} scale={spec.scale}>
      <group ref={outer}>
        <group ref={inner}>
          <IngredientShape kind={spec.kind} />
        </group>
      </group>
    </group>
  );
}
function IngredientGroup({
  modeConfig,
  active,
  progress,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  modeConfig: MenuModeConfig;
  active: boolean;
  progress: number;
  reducedMotion: boolean;
  pointerWorld: React.RefObject<THREE.Vector3>;
  layout: 'mobile' | 'desktop';
}): React.ReactElement {
  const root = useRef<THREE.Group | null>(null);
  const visibility = useRef(active ? 1 : 0);
  useFrame((_, delta) => {
    if (!root.current) return;
    const target = active ? 1 : 0;
    visibility.current = reducedMotion
      ? target
      : THREE.MathUtils.damp(visibility.current, target, 4, delta);
    const visible = visibility.current;
    root.current.visible = visible > 0.12;
    root.current.position.x = (1 - visible) * 2.1;
    root.current.position.y = (1 - visible) * -0.1;
    root.current.position.z = (1 - visible) * -0.3;
    root.current.rotation.y = (1 - visible) * 0.32;
    const baseScale = layout === 'mobile' ? 0.62 : 1;
    root.current.scale.setScalar(baseScale * (0.4 + visible * 0.6));
  });
  return (
    <group ref={root}>
      {modeConfig.ingredients.map((spec) => (
        <FloatingIngredient
          key={spec.id}
          spec={spec}
          progress={progress}
          reducedMotion={reducedMotion}
          pointerWorld={pointerWorld}
          layout={layout}
        />
      ))}
    </group>
  );
}
function WaveIngredients({
  mode,
  progress,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  mode: MenuMode;
  progress: number;
  reducedMotion: boolean;
  pointerWorld: React.RefObject<THREE.Vector3>;
  layout: 'mobile' | 'desktop';
}): React.ReactElement {
  return (
    <group>
      {MENU_MODES.map((modeConfig) => (
        <IngredientGroup
          key={modeConfig.id}
          modeConfig={modeConfig}
          active={modeConfig.id === mode}
          progress={progress}
          reducedMotion={reducedMotion}
          pointerWorld={pointerWorld}
          layout={layout}
        />
      ))}
    </group>
  );
}
function ModeLights({ mode }: { mode: MenuModeConfig }): React.ReactElement {
  return (
    <group>
      <ambientLight intensity={0.78} color="#FFF3DF" />
      <directionalLight position={[4.5, 7, 6]} intensity={2.05} color="#FFF1D6" />
      <directionalLight position={[-5, 3.5, -4]} intensity={1.05} color={mode.theme.glow} />
      <directionalLight position={[-4.5, 2.5, 6]} intensity={1.15} color="#FFF4E4" />
      <pointLight
        position={[2.5, 2.2, 2.5]}
        intensity={2.4}
        distance={9}
        color={mode.theme.canColor}
      />
      <spotLight
        position={[0, 6, 3.5]}
        angle={0.7}
        penumbra={0.85}
        intensity={2.8}
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
      layout === 'desktop' ? [0, 1.15, 7.6] : [0, 1.55, 11];
    const reservePosition: [number, number, number] =
      layout === 'desktop' ? [0.3, 1.3, 8] : [0, 1.5, 9.5];
    const heroTarget: [number, number, number] =
      layout === 'desktop' ? [1.3, 1.02, 0] : [0.3, 2.2, 0];
    const reserveTarget: [number, number, number] =
      layout === 'desktop' ? [-0.45, 1.25, 0] : [0, 1.8, 0];
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
  const labelTextures = useCanLabelTextures();
  const stage = useRef<THREE.Group | null>(null);
  const canFloat = useRef<THREE.Group | null>(null);
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
  const lastWheelAt = useRef(0);
  const pointerWorld = useRef(new THREE.Vector3(999, 999, 0));
  const pointerNdc = useMemo(() => new THREE.Vector3(), []);
  const pointerDirection = useMemo(() => new THREE.Vector3(), []);
  const { gl, camera } = useThree();
  const onModeChangeRef = useRef(onModeChange);
  const onServeRef = useRef(onServe);
  const canServeRef = useRef(canServe);
  onModeChangeRef.current = onModeChange;
  onServeRef.current = onServe;
  canServeRef.current = canServe;
  const selectMode = useCallback((nextMode: MenuMode) => {
    if (nextMode === modeRef.current) return;
    targetRotation.current = nearestEquivalent(MODE_ROTATIONS[nextMode], targetRotation.current);
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
      if (!dragging.current) return;
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
      const isServingFlick = canServeRef.current && Math.abs(dragDistance.current) > 560;
      if (isServingFlick) {
        onServeRef.current();
        return;
      }
      const nearest = nearestModeFromRotation(targetRotation.current);
      targetRotation.current = nearestEquivalent(MODE_ROTATIONS[nearest], targetRotation.current);
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
    const time = state.clock.elapsedTime;
    pointerNdc.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera);
    pointerDirection.copy(pointerNdc).sub(camera.position).normalize();
    if (Math.abs(pointerDirection.z) > 0.0001) {
      const distance = -camera.position.z / pointerDirection.z;
      pointerWorld.current.copy(camera.position).add(pointerDirection.multiplyScalar(distance));
    }
    if (stage.current) {
      const heroX = layout === 'desktop' ? 1.85 : 0.45;
      const reserveX = layout === 'desktop' ? -0.9 : 0;
      stage.current.position.x = THREE.MathUtils.damp(
        stage.current.position.x,
        THREE.MathUtils.lerp(heroX, reserveX, p),
        5,
        delta,
      );
    }
    if (canFloat.current) {
      canFloat.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.75) * 0.055;
      canFloat.current.rotation.z = reducedMotion ? -0.11 : -0.11 + Math.sin(time * 0.6) * 0.018;
      canFloat.current.rotation.x = reducedMotion ? 0.045 : 0.045 + Math.cos(time * 0.5) * 0.018;
    }
    if (can.current) {
      const desired = targetRotation.current + (1 - p) * 0.12;
      can.current.rotation.y = reducedMotion
        ? desired
        : THREE.MathUtils.damp(can.current.rotation.y, desired, 4.2, delta);
    }
  });
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    event.stopPropagation();
    dragging.current = true;
    dragStartX.current = event.nativeEvent.clientX;
    dragStartRotation.current = targetRotation.current;
    dragDistance.current = 0;
    gl.domElement.style.cursor = 'grabbing';
    try {
      gl.domElement.setPointerCapture(event.pointerId);
    } catch {
      /* Optional. */
    }
  };
  return (
    <>
      <CameraRig progress={progress} layout={layout} reducedMotion={reducedMotion} />
      <ModeLights mode={modeConfig} />
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.1}
          color="#FFF4DD"
          position={[0, 6, -5]}
          scale={[12, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.35}
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
      <group ref={stage} position={[layout === 'desktop' ? 1.85 : 0.45, 0, 0]}>
        <group ref={canFloat}>
          <group ref={can}>
            <CanModel labelTextures={labelTextures} mode={mode} />
          </group>
        </group>
        <WaveIngredients
          mode={mode}
          progress={progress}
          reducedMotion={reducedMotion}
          pointerWorld={pointerWorld}
          layout={layout}
        />
        <mesh position={[0, 1.3, 0.18]} onPointerDown={handlePointerDown}>
          <cylinderGeometry args={[1.15, 1.15, 3.2, 16, 1, false]} />
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
      camera={{ fov: 30, position: [0, 1.15, 7.6], near: 0.1, far: 80 }}
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
