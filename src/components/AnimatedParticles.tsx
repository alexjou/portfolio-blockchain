import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Object3D, Vector3, InstancedMesh, Mesh } from 'three';

// Componente para criar partículas com animação
export function AnimatedParticles({ count = 50, radius = 10 }: { count?: number; radius?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const position = new Vector3(
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius
      );

      const speed = 0.01 + Math.random() * 0.04;
      const offset = Math.random() * Math.PI * 2;
      const scale = 0.05 + Math.random() * 0.1;
      const color = i % 3 === 0
        ? '#ad2962'
        : i % 3 === 1
          ? '#ff9a3c'
          : '#4477ee';

      temp.push({ position, speed, offset, scale, color });
    }
    return temp;
  }, [count, radius]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      const { position, speed, offset, scale } = particle;

      // Movimento baseado em seno e cosseno para criar um efeito fluido
      dummy.position.set(
        position.x + Math.sin(time * speed + offset) * 1.5,
        position.y + Math.cos(time * speed + offset) * 1.5,
        position.z + Math.sin(time * speed * 0.5 + offset) * 1.5
      );

      // Pulsar o tamanho
      const pulseScale = scale * (0.8 + Math.sin(time * 2 + i) * 0.2);
      dummy.scale.set(pulseScale, pulseScale, pulseScale);

      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });

    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.7}
        emissive="#ffffff"
        emissiveIntensity={0.5}
      />
    </instancedMesh>
  );
}

// Componente para criar uma partícula de dados fluindo em uma conexão
export function DataFlowParticle({ startPoint, endPoint, color, speed = 0.5, size = 0.05 }: {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  color: string;
  speed?: number;
  size?: number;
}) {
  const mesh = useRef<Mesh>(null);
  const startVec = useMemo(() => new Vector3(...startPoint), [startPoint]);
  const endVec = useMemo(() => new Vector3(...endPoint), [endPoint]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const t = (time * speed) % 1;

    // Curva de ease-in-out para movimento mais natural
    const progress = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    mesh.current?.position.lerpVectors(startVec, endVec, progress);

    // Pulsar conforme flui
    const scale = size * (0.8 + Math.sin(time * 10) * 0.2);
    mesh.current?.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Fluxo de dados em uma conexão com várias partículas
export function DataFlow({ startPoint, endPoint, color, count = 5, speed = 0.5, size = 0.05 }: {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  color: string;
  count?: number;
  speed?: number;
  size?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DataFlowParticle
          key={`flow-${i}`}
          startPoint={startPoint}
          endPoint={endPoint}
          color={color}
          speed={speed / count}
          size={size}
        />
      ))}
    </>
  );
}
