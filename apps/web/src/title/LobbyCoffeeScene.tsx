import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import { Bean, CanModel, CupWithSteam, useCanLabelTexture } from './CoffeeMenuScene';

export type LobbyCoffeeSceneProps = {
  reducedMotion: boolean;
};

const BEAN_POSITIONS: Array<[number, number, number]> = [
  [1.12, 0.085, 0.92],
  [-1.18, 0.085, 0.78],
  [0.82, 0.085, -1.12],
  [-0.94, 0.085, -0.88],
  [1.55, 0.085, -0.22],
  [-1.62, 0.085, 0.18],
];

function TableAndProps({
  reducedMotion,
  canRef,
  onCanPointerDown,
  beanRefs,
  onBeanPointerDown,
}: {
  reducedMotion: boolean;
  canRef: React.RefObject<THREE.Group | null>;
  onCanPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  beanRefs: React.RefObject<Array<THREE.Group | null>>;
  onBeanPointerDown: (index: number) => void;
}): React.ReactElement {
  const labelTexture = useCanLabelTexture();

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6B4128',
        roughness: 0.7,
        metalness: 0.02,
      }),
    [],
  );
  const clothMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF8EC',
        roughness: 0.82,
        metalness: 0.01,
      }),
    [],
  );
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C8A12A',
        roughness: 0.36,
        metalness: 0.72,
      }),
    [],
  );

  useEffect(
    () => () => {
      woodMaterial.dispose();
      clothMaterial.dispose();
      brassMaterial.dispose();
    },
    [woodMaterial, clothMaterial, brassMaterial],
  );

  return (
    <group>
      {/* Pedestal table */}
      <mesh position={[0, -1.32, 0]} material={woodMaterial}>
        <cylinderGeometry args={[0.82, 0.9, 0.14, 48]} />
      </mesh>
      <mesh position={[0, -0.72, 0]} material={woodMaterial}>
        <cylinderGeometry args={[0.34, 0.42, 1.1, 40]} />
      </mesh>
      <mesh position={[0, -0.09, 0]} material={woodMaterial}>
        <cylinderGeometry args={[2.15, 2.1, 0.18, 72]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={clothMaterial}>
        <cylinderGeometry args={[1.98, 1.98, 0.05, 72]} />
      </mesh>
      <mesh position={[0, 0.048, 0]} rotation={[Math.PI / 2, 0, 0]} material={brassMaterial}>
        <torusGeometry args={[1.7, 0.012, 6, 72]} />
      </mesh>

      {/* Coffee tin */}
      <group ref={canRef} position={[0, 0.06, 0]}>
        <CanModel labelTexture={labelTexture} active={false} reducedMotion={reducedMotion} />
      </group>

      {/* Porcelain cup */}
      <CupWithSteam
        reducedMotion={reducedMotion}
        position={[1.28, 0.1, 0.55]}
        scale={0.82}
      />

      {/* Loose beans: click/tap to make them hop */}
      {BEAN_POSITIONS.map((position, index) => (
        <group
          key={index}
          ref={(node) => {
            if (beanRefs.current) beanRefs.current[index] = node;
          }}
          position={position}
          scale={0.92}
          onPointerDown={(event) => {
            event.stopPropagation();
            onBeanPointerDown(index);
          }}
        >
          <Bean />
        </group>
      ))}

      {/* Invisible can drag surface */}
      <mesh position={[0, 1.15, 0.18]} onPointerDown={onCanPointerDown}>
        <cylinderGeometry args={[1.05, 1.05, 3, 16, 1, false]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LobbySceneContent({
  reducedMotion,
}: LobbyCoffeeSceneProps): React.ReactElement {
  const can = useRef<THREE.Group | null>(null);
  const beanRefs = useRef<Array<THREE.Group | null>>([]);
  const beanVelocities = useRef<number[]>(BEAN_POSITIONS.map(() => 0));
  const targetRotation = useRef(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const { gl } = useThree();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - dragStartX.current;
      targetRotation.current = dragStartRotation.current + dx * 0.012;
      dragStartRotation.current = targetRotation.current;
      dragStartX.current = event.clientX;
    };
    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      gl.domElement.style.cursor = '';
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (can.current) {
      can.current.rotation.y = reducedMotion
        ? targetRotation.current
        : THREE.MathUtils.damp(can.current.rotation.y, targetRotation.current, 7, delta);
      if (!dragging.current && !reducedMotion) {
        // A barely-there idle turn keeps the still life alive without
        // stealing focus from the room controls.
        targetRotation.current += delta * 0.035;
      }
    }

    beanRefs.current.forEach((bean, index) => {
      if (!bean) return;
      const velocity = beanVelocities.current[index] ?? 0;
      if (velocity === 0) return;
      const baseY = BEAN_POSITIONS[index]?.[1] ?? 0.085;
      bean.position.y += velocity * delta;
      bean.rotation.x += velocity * delta * 1.8;
      beanVelocities.current[index] = velocity - 9.8 * delta;
      if (bean.position.y <= baseY && velocity < 0) {
        bean.position.y = baseY;
        bean.rotation.x = 0;
        beanVelocities.current[index] = 0;
      }
    });
  });

  const handleCanPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    dragging.current = true;
    dragStartX.current = event.nativeEvent.clientX;
    dragStartRotation.current = targetRotation.current;
    gl.domElement.style.cursor = 'grabbing';
    try {
      gl.domElement.setPointerCapture(event.pointerId);
    } catch {
      // Optional.
    }
  };

  const handleBeanPointerDown = (index: number) => {
    soundEngine.unlock();
    soundEngine.playSfx('uiToggle');
    beanVelocities.current[index] = 2.4;
  };

  return (
    <>
      <ambientLight intensity={0.62} color="#FFF3DF" />
      <directionalLight position={[4, 7, 5]} intensity={2.1} color="#FFF1D6" />
      <directionalLight position={[-5, 3, -3]} intensity={0.75} color="#E9B590" />
      <spotLight position={[0, 6, 4]} angle={0.7} penumbra={0.85} intensity={2.6} color="#FFD9A0" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} color="#FFF4DD" position={[0, 5, -4]} scale={[10, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#FFD6A0" position={[-5, 2, 3]} rotation-y={Math.PI / 2} scale={[5, 5, 1]} />
      </Environment>

      <group position={[0, -0.05, 0]}>
        <TableAndProps
          reducedMotion={reducedMotion}
          canRef={can}
          onCanPointerDown={handleCanPointerDown}
          beanRefs={beanRefs}
          onBeanPointerDown={handleBeanPointerDown}
        />
      </group>

      <ContactShadows
        position={[0, -1.38, 0]}
        opacity={0.38}
        scale={7}
        blur={2.5}
        far={3}
        resolution={256}
        color="#2B1710"
        frames={1}
      />
      <CameraRig />
    </>
  );
}

function CameraRig(): null {
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(0, 0.95, 0));

  useFrame(() => {
    camera.position.set(0, 2.75, 5.9);
    camera.lookAt(target.current);
  });

  return null;
}

export default function LobbyCoffeeScene({
  reducedMotion,
}: LobbyCoffeeSceneProps): React.ReactElement {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 30, position: [0, 2.75, 5.9], near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
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
      <LobbySceneContent reducedMotion={reducedMotion} />
    </Canvas>
  );
}
