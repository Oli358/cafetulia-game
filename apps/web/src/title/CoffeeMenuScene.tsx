import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
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
import { createCupLabelTextures } from './cupLabelTexture';

useGLTF.preload('/models/coffee-bean.glb');
useGLTF.preload('/models/cinnamon-stick.glb');
useGLTF.preload('/models/star-anise.glb');
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
export function useCupLabelTextures(): Record<MenuMode, THREE.CanvasTexture> | null {
  const [textures, setTextures] = useState<Record<MenuMode, THREE.CanvasTexture> | null>(null);
  const texturesRef = useRef<Record<MenuMode, THREE.CanvasTexture> | null>(null);
  useEffect(() => {
    let cancelled = false;
    void createCupLabelTextures().then((created) => {
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

function useCupBodyGeometry(): THREE.LatheGeometry {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.48, 0),
      new THREE.Vector2(0.5, 0.02),
      new THREE.Vector2(0.51, 0.08),
      new THREE.Vector2(0.69, 2.34),
      new THREE.Vector2(0.705, 2.42),
      new THREE.Vector2(0.705, 2.44),
      new THREE.Vector2(0, 2.44),
    ];
    return new THREE.LatheGeometry(points, 96);
  }, []);
}

function CoffeeCupModel({
  labelTextures,
  mode,
}: {
  labelTextures: Record<MenuMode, THREE.CanvasTexture> | null;
  mode: MenuMode;
}): React.ReactElement {
  const bodyGeometry = useCupBodyGeometry();
  const lidMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#F7EEDF', roughness: 0.42, metalness: 0.04 }),
    [],
  );
  const lidShade = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#DCCDBA', roughness: 0.55, metalness: 0.03 }),
    [],
  );
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#C05A35', roughness: 0.68, metalness: 0.02 }),
    [],
  );
  const sleeveMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#C79A6B', roughness: 0.92, metalness: 0 }),
    [],
  );
  const sleeveInk = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7A5236', roughness: 0.9, metalness: 0 }),
    [],
  );
  const sipMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3A2A22', roughness: 0.62, metalness: 0 }),
    [],
  );
  const sealMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D9B25F', roughness: 0.38, metalness: 0.25 }),
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
            roughness: 0.6,
            metalness: 0.02,
          });
          return materials;
        },
        {} as Record<MenuMode, THREE.MeshStandardMaterial>,
      ),
    /* The mode at mount only decides the initial opacity; later changes are damped in useFrame and must not recreate the materials. eslint-disable-next-line react-hooks/exhaustive-deps */ [],
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
      lidMaterial.dispose();
      lidShade.dispose();
      bodyMaterial.dispose();
      sleeveMaterial.dispose();
      sleeveInk.dispose();
      sipMaterial.dispose();
      sealMaterial.dispose();
      Object.values(labelMaterials).forEach((material) => material.dispose());
    },
    [
      bodyGeometry,
      lidMaterial,
      lidShade,
      bodyMaterial,
      sleeveMaterial,
      sleeveInk,
      sipMaterial,
      sealMaterial,
      labelMaterials,
    ],
  );

  useFrame((_, delta) => {
    bodyMaterial.color.lerp(bodyTarget, 1 - Math.exp(-2.2 * delta));
    MENU_MODES.forEach((item) => {
      const target = item.id === mode ? 1 : 0;
      const current = opacities.current[item.id];
      const next = THREE.MathUtils.damp(current, target, 1.7, delta);
      opacities.current[item.id] = next;
      const material = labelMaterials[item.id];
      material.opacity = next;
      material.visible = next > 0.002;
    });
  });

  return (
    <group>
      {/* Tapered paper cup with a printed wrap, a cream lid and a kraft sleeve. */}
      <mesh geometry={bodyGeometry} material={bodyMaterial} />
      {MENU_MODES.map((item, index) => (
        <mesh
          key={item.id}
          position={[0, 1.22, 0]}
          rotation={[0, -Math.PI / 3, 0]}
          renderOrder={index + 1}
        >
          <cylinderGeometry args={[0.708, 0.518, 2.2, 96, 1, true]} />
          <primitive object={labelMaterials[item.id]} attach="material" />
        </mesh>
      ))}

      {/* Lid: rim, plate and a small sip tab, like a takeaway coffee cup. */}
      <mesh position={[0, 2.49, 0]} material={lidMaterial}>
        <cylinderGeometry args={[0.74, 0.72, 0.1, 96]} />
      </mesh>
      <mesh position={[0, 2.555, 0]} material={lidMaterial}>
        <cylinderGeometry args={[0.725, 0.725, 0.045, 96]} />
      </mesh>
      <mesh position={[0, 2.58, 0]} rotation={[Math.PI / 2, 0, 0]} material={lidShade}>
        <torusGeometry args={[0.725, 0.012, 6, 96]} />
      </mesh>
      <mesh position={[0, 2.585, 0.53]} material={lidMaterial}>
        <boxGeometry args={[0.3, 0.05, 0.14]} />
      </mesh>
      <mesh position={[0, 2.614, 0.57]} rotation={[Math.PI / 2, 0, 0]} material={sipMaterial}>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 20]} />
      </mesh>

      {/* Kraft heat sleeve: low and short so the printed cup keeps the spotlight. */}
      <mesh position={[0, 0.46, 0]} material={sleeveMaterial}>
        <cylinderGeometry args={[0.583, 0.535, 0.56, 96, 1, true]} />
      </mesh>
      {[0.18, 0.74].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={sleeveInk}>
          <torusGeometry args={[y === 0.18 ? 0.536 : 0.584, 0.006, 4, 96]} />
        </mesh>
      ))}
      <mesh position={[0, 0.47, 0.566]} rotation={[Math.PI / 2, 0, 0]} material={sealMaterial}>
        <cylinderGeometry args={[0.052, 0.052, 0.008, 24]} />
      </mesh>

      {/* Paper seams at the base and under the lid. */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={lidShade}>
        <torusGeometry args={[0.505, 0.008, 5, 96]} />
      </mesh>
      <mesh position={[0, 2.42, 0]} rotation={[Math.PI / 2, 0, 0]} material={lidShade}>
        <torusGeometry args={[0.708, 0.008, 5, 96]} />
      </mesh>
    </group>
  );
}

function OrangePeel(): React.ReactElement {
  return (
    <group rotation={[0.5, 0.2, 0.35]}>
      <mesh rotation={[0.2, 0.4, 0.1]} scale={[1, 1, 0.58]}>
        <torusGeometry args={[0.27, 0.078, 8, 28, Math.PI * 1.35]} />
        <meshStandardMaterial color="#D9772E" roughness={0.62} />
      </mesh>
      <mesh rotation={[0.5, 0.1, -0.2]} position={[0.02, 0.02, 0.03]} scale={[1, 1, 0.45]}>
        <torusGeometry args={[0.235, 0.044, 6, 24, Math.PI * 1.15]} />
        <meshStandardMaterial color="#F2A24D" roughness={0.52} />
      </mesh>
      <mesh rotation={[0.8, 0.2, -0.3]} position={[-0.01, 0.0, 0.035]} scale={[1, 1, 0.38]}>
        <torusGeometry args={[0.255, 0.026, 5, 24, Math.PI * 1.2]} />
        <meshStandardMaterial color="#B8512F" roughness={0.7} />
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
            key={`outer-${index}`}
            position={[Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0]}
            rotation={[0, 0, angle]}
            scale={[1, 0.42, 0.25]}
          >
            <sphereGeometry args={[0.13, 12, 9]} />
            <meshStandardMaterial color="#FFF8EC" roughness={0.78} />
          </mesh>
        );
      })}
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * TWO_PI + 0.35;
        return (
          <mesh
            key={`inner-${index}`}
            position={[Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0.018]}
            rotation={[0, 0, angle]}
            scale={[0.72, 0.3, 0.2]}
          >
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#FFF8EC" roughness={0.78} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.035]}>
        <sphereGeometry args={[0.06, 14, 10]} />
        <meshStandardMaterial color="#E5B93C" roughness={0.52} metalness={0.04} />
      </mesh>
      <mesh position={[0, -0.12, -0.02]} rotation={[0.08, 0, 0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
        <meshStandardMaterial color="#5C7A4B" roughness={0.8} />
      </mesh>
      <mesh position={[0.055, -0.18, 0.01]} rotation={[0.2, 0.3, -0.5]} scale={[1, 0.35, 0.5]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#5C7A4B" roughness={0.78} />
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
  const chunkGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.18, -0.08);
    shape.lineTo(-0.06, -0.18);
    shape.lineTo(0.12, -0.15);
    shape.lineTo(0.2, -0.02);
    shape.lineTo(0.12, 0.16);
    shape.lineTo(-0.08, 0.15);
    shape.lineTo(-0.19, 0.04);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.02,
      bevelSegments: 3,
      curveSegments: 3,
    });
    geometry.center();
    return geometry;
  }, []);

  useEffect(() => () => chunkGeometry.dispose(), [chunkGeometry]);

  return (
    <group>
      <mesh geometry={chunkGeometry} scale={[1.05, 1.05, 0.95]}>
        <meshStandardMaterial color="#4A2A18" roughness={0.34} metalness={0.05} />
      </mesh>
      <mesh
        geometry={chunkGeometry}
        position={[0.17, -0.08, 0.03]}
        rotation={[0.25, 0.5, 0.2]}
        scale={0.48}
      >
        <meshStandardMaterial color="#3B2118" roughness={0.4} metalness={0.04} />
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
type IngredientModels = {
  bean: THREE.Group;
  cinnamon: THREE.Group;
  anise: THREE.Group;
};

function useIngredientModels(): IngredientModels {
  const bean = useGLTF('/models/coffee-bean.glb').scene;
  const cinnamon = useGLTF('/models/cinnamon-stick.glb').scene;
  const anise = useGLTF('/models/star-anise.glb').scene;
  return useMemo(() => ({ bean, cinnamon, anise }), [bean, cinnamon, anise]);
}

/**
 * Low-poly Poly by Google models (CC BY 4.0) for the three ingredients that
 * benefit most from a real silhouette. Each instance gets its own materials so
 * the mode crossfade can fade whole worlds independently.
 */
function MainIngredientModel({
  source,
  targetSize,
  rotation,
}: {
  source: THREE.Group;
  targetSize: number;
  rotation: [number, number, number];
}): React.ReactElement {
  const clone = useMemo(() => {
    const copy = source.clone(true);
    copy.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const cloned = materials.map((material) => {
        const copyMaterial = material.clone();
        if (copyMaterial instanceof THREE.MeshStandardMaterial) {
          copyMaterial.roughness = Math.max(0.42, copyMaterial.roughness);
          copyMaterial.metalness = 0.02;
        }
        return copyMaterial;
      });
      if (Array.isArray(mesh.material)) {
        mesh.material = cloned;
      } else if (cloned[0]) {
        mesh.material = cloned[0];
      }
    });
    const box = new THREE.Box3().setFromObject(copy);
    const size = box.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z, 0.001);
    copy.scale.multiplyScalar(targetSize / largest);
    const scaledBox = new THREE.Box3().setFromObject(copy);
    copy.position.sub(scaledBox.getCenter(new THREE.Vector3()));
    return copy;
  }, [source, targetSize]);

  useEffect(
    () => () => {
      clone.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
      });
    },
    [clone],
  );

  return (
    <group rotation={rotation}>
      <primitive object={clone} />
    </group>
  );
}

function IngredientShape({
  kind,
  models,
}: {
  kind: IngredientSpec['kind'];
  models: IngredientModels;
}): React.ReactElement {
  switch (kind) {
    case 'bean':
      return (
        <MainIngredientModel
          source={models.bean}
          targetSize={0.46}
          rotation={[Math.PI / 2, 0, 0]}
        />
      );
    case 'cinnamon':
      return (
        <MainIngredientModel
          source={models.cinnamon}
          targetSize={1.02}
          rotation={[Math.PI / 2, 0, 0]}
        />
      );
    case 'anise':
      return (
        <MainIngredientModel
          source={models.anise}
          targetSize={0.56}
          rotation={[Math.PI / 2, 0, 0]}
        />
      );
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
    case 'cocoa':
    default:
      return <CocoaNib />;
  }
}
function FloatingIngredient({
  spec,
  models,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  spec: IngredientSpec;
  models: IngredientModels;
  reducedMotion: boolean;
  pointerWorld: React.RefObject<THREE.Vector3>;
  layout: 'mobile' | 'desktop';
}): React.ReactElement {
  const outer = useRef<THREE.Group | null>(null);
  const inner = useRef<THREE.Group | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const world = useMemo(() => new THREE.Vector3(), []);
  const phase = useMemo(() => {
    let hash = 0;
    for (const char of spec.id) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
    return hash / 1000;
  }, [spec.id]);
  useFrame((state, delta) => {
    if (!outer.current || !inner.current) return;
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
    outer.current.position.x = offset.current.x;
    outer.current.position.y = offset.current.y;
    inner.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.8 + phase * 8) * 0.06;
    inner.current.rotation.z = reducedMotion
      ? 0
      : Math.sin(time * 0.55 + phase * 6) * 0.08 + influence * 0.45;
    inner.current.rotation.x = reducedMotion ? 0 : Math.cos(time * 0.4 + phase * 5) * 0.05;
    inner.current.scale.setScalar(1 - influence * 0.08);
  });
  return (
    <group position={spec.position} rotation={spec.rotation} scale={spec.scale}>
      <group ref={outer}>
        <group ref={inner}>
          <IngredientShape kind={spec.kind} models={models} />
        </group>
      </group>
    </group>
  );
}
function IngredientGroup({
  modeConfig,
  active,
  progress,
  models,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  modeConfig: MenuModeConfig;
  active: boolean;
  progress: number;
  models: IngredientModels;
  reducedMotion: boolean;
  pointerWorld: React.RefObject<THREE.Vector3>;
  layout: 'mobile' | 'desktop';
}): React.ReactElement {
  const root = useRef<THREE.Group | null>(null);
  const flow = useRef(active ? 0 : -1);
  const previousActive = useRef(active);
  const reveal = useRef(0);
  const materials = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const collected: THREE.Material[] = [];
    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const childMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      childMaterials.forEach((material) => {
        material.transparent = true;
        material.opacity = 0;
        material.depthWrite = false;
        material.needsUpdate = true;
        collected.push(material);
      });
    });
    materials.current = collected;
    // Only the mount matters here: opacity is animated in useFrame afterwards.
  }, []);

  useEffect(() => {
    if (active && !previousActive.current) {
      // Enter from above, unless it is still leaving: then let it turn around
      // smoothly instead of teleporting across the cup.
      flow.current = flow.current <= -0.9 ? 1 : Math.min(flow.current, 0);
    }
    previousActive.current = active;
  }, [active]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const targetReveal = THREE.MathUtils.smoothstep(progress, 0.45, 0.88);
    reveal.current = reducedMotion
      ? targetReveal
      : THREE.MathUtils.damp(reveal.current, targetReveal, 3.4, delta);
    const targetFlow = active ? 0 : -1;
    flow.current = reducedMotion
      ? targetFlow
      : THREE.MathUtils.damp(flow.current, targetFlow, 1.8, delta);

    const currentFlow = flow.current;
    const currentReveal = reveal.current;
    // The whole set travels vertically: it drops in from above and leaves
    // downwards like a slow current, never sideways.
    const y = currentFlow * 3.2 + (1 - currentReveal) * 1.15;
    const opacity = Math.max(0, 1 - Math.abs(currentFlow)) * currentReveal;
    root.current.visible = opacity > 0.004;
    root.current.position.set(0, y, 0);
    root.current.rotation.x = currentFlow * 0.16;
    root.current.scale.setScalar(layout === 'mobile' ? 0.62 : 1);
    materials.current.forEach((material) => {
      material.opacity = opacity;
      material.depthWrite = opacity > 0.98;
    });
  });
  return (
    <group ref={root}>
      {modeConfig.ingredients.map((spec) => (
        <FloatingIngredient
          key={spec.id}
          spec={spec}
          models={models}
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
  models,
  reducedMotion,
  pointerWorld,
  layout,
}: {
  mode: MenuMode;
  progress: number;
  models: IngredientModels;
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
          models={models}
          reducedMotion={reducedMotion}
          pointerWorld={pointerWorld}
          layout={layout}
        />
      ))}
    </group>
  );
}
function ModeLights({ mode }: { mode: MenuModeConfig }): React.ReactElement {
  const glowLight = useRef<THREE.DirectionalLight | null>(null);
  const accentLight = useRef<THREE.PointLight | null>(null);
  const spotLight = useRef<THREE.SpotLight | null>(null);
  const glowTarget = useMemo(() => new THREE.Color(mode.theme.glow), [mode]);
  const accentTarget = useMemo(() => new THREE.Color(mode.theme.canColor), [mode]);

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-1.8 * delta);
    glowLight.current?.color.lerp(glowTarget, blend);
    accentLight.current?.color.lerp(accentTarget, blend);
    spotLight.current?.color.lerp(glowTarget, blend);
  });

  return (
    <group>
      <ambientLight intensity={0.78} color="#FFF3DF" />
      <directionalLight position={[4.5, 7, 6]} intensity={2.05} color="#FFF1D6" />
      <directionalLight
        ref={glowLight}
        position={[-5, 3.5, -4]}
        intensity={1.05}
        color={mode.theme.glow}
      />
      <directionalLight position={[-4.5, 2.5, 6]} intensity={1.15} color="#FFF4E4" />
      <pointLight
        ref={accentLight}
        position={[2.5, 2.2, 2.5]}
        intensity={2.4}
        distance={9}
        color={mode.theme.canColor}
      />
      <spotLight
        ref={spotLight}
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
  const viewportWidth = useThree((state) => state.size.width);
  const compact = layout === 'desktop' && viewportWidth < 1100;
  const smooth = useRef(0);
  const target = useRef(new THREE.Vector3());
  useFrame((_, delta) => {
    smooth.current = reducedMotion
      ? progress
      : THREE.MathUtils.damp(smooth.current, progress, 5, delta);
    const p = smooth.current;
    const heroPosition: [number, number, number] =
      layout === 'desktop' ? [0, 1.35, 8.2] : [0, 1.2, 9.8];
    const reservePosition: [number, number, number] =
      layout === 'desktop'
        ? compact
          ? [0.2, 1.35, 9.2]
          : [0.2, 1.25, 7.9]
        : [0, 1.45, 9.6];
    const heroTarget: [number, number, number] =
      layout === 'desktop' ? [0, 1.35, 0] : [0, 1.2, 0];
    const reserveTarget: [number, number, number] =
      layout === 'desktop'
        ? compact
          ? [1, 1.1, 0]
          : [1, 0.95, 0]
        : [0.2, 1.45, 0];
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
  const labelTextures = useCupLabelTextures();
  const ingredientModels = useIngredientModels();
  const stage = useRef<THREE.Group | null>(null);
  const cupFloat = useRef<THREE.Group | null>(null);
  const cup = useRef<THREE.Group | null>(null);
  const targetRotation = useRef(MODE_ROTATIONS[mode]);
  const smoothProgress = useRef(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const lastMode = useRef<MenuMode>(mode);
  const modeRef = useRef<MenuMode>(mode);
  const servingRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const dragDistance = useRef(0);
  const lastWheelAt = useRef(0);
  const menuOpenedAt = useRef(0);
  const menuWasOpen = useRef(false);
  const pointerWorld = useRef(new THREE.Vector3(999, 999, 0));
  const pointerNdc = useMemo(() => new THREE.Vector3(), []);
  const pointerDirection = useMemo(() => new THREE.Vector3(), []);
  const { gl, camera } = useThree();
  const viewportWidth = useThree((state) => state.size.width);
  const compact = layout === 'desktop' && viewportWidth < 1100;
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
      // Ignore the tail of the scroll gesture that opens the menu: a single
      // notch must reveal the card without also switching worlds.
      if (progressRef.current < 0.985) return;
      if (performance.now() - menuOpenedAt.current < 900) return;
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
    const menuOpen = progress >= 0.985;
    if (menuOpen && !menuWasOpen.current) menuOpenedAt.current = performance.now();
    menuWasOpen.current = menuOpen;
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
      const heroX = 0;
      const reserveX = layout === 'desktop' ? (compact ? 1.2 : 1.15) : 0.35;
      const heroY = layout === 'desktop' ? -1.82 : -1.57;
      const reserveY = layout === 'desktop' ? (compact ? -0.85 : -0.55) : -0.35;
      stage.current.position.x = THREE.MathUtils.damp(
        stage.current.position.x,
        THREE.MathUtils.lerp(heroX, reserveX, p),
        5,
        delta,
      );
      stage.current.position.y = THREE.MathUtils.damp(
        stage.current.position.y,
        THREE.MathUtils.lerp(heroY, reserveY, p),
        5,
        delta,
      );
    }
    if (cupFloat.current) {
      cupFloat.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.75) * 0.055;
      cupFloat.current.rotation.z = reducedMotion ? -0.085 : -0.085 + Math.sin(time * 0.6) * 0.016;
      cupFloat.current.rotation.x = reducedMotion ? 0.04 : 0.04 + Math.cos(time * 0.5) * 0.016;
    }
    if (cup.current) {
      // One full, gradual turn as the page moves from the poster to the menu.
      const scrollSpin = (1 - p) * TWO_PI;
      const desired = targetRotation.current + scrollSpin + (1 - p) * 0.12;
      cup.current.rotation.y = reducedMotion
        ? desired
        : THREE.MathUtils.damp(cup.current.rotation.y, desired, 3, delta);
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
      <group ref={stage} position={[0, layout === 'desktop' ? -1.82 : -1.57, 0]}>
        <group ref={cupFloat}>
          <group ref={cup} scale={layout === 'desktop' ? 1.12 : 1}>
            <CoffeeCupModel labelTextures={labelTextures} mode={mode} />
          </group>
        </group>
        <WaveIngredients
          mode={mode}
          progress={progress}
          models={ingredientModels}
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
      camera={{ fov: 30, position: [0, 1.35, 8.2], near: 0.1, far: 80 }}
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
