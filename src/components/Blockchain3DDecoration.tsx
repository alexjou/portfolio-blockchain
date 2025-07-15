
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html } from '@react-three/drei';
import ethereumLogo from '../assets/logoEther.png';
import { useEffect, useState, useRef } from 'react';
export default function Blockchain3DDecoration({ side = "left" }: { side?: "left" | "right" }) {
  // Parâmetros visuais
  const blockSize = 1.2;
  const blockSpacing = 1.2; // quadrado
  const visibleBlocks = 7;
  // Não precisa mais de scrollTop, só scrollOffset para animação
  const [scrollOffset, setScrollOffset] = useState(0);

  // Atualiza posição, offset e direção do scroll
  const [lastScroll, setLastScroll] = useState(window.scrollY);
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollOffset(scrollY / 120);
      setScrollDir(scrollY > lastScroll ? 'down' : scrollY < lastScroll ? 'up' : scrollDir);
      setLastScroll(scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line
  }, [lastScroll, scrollDir]);

  // Animação de leve oscilação
  // Calcula baseX para centralizar e afastar da borda, sem cortar
  const canvasWidth = 10; // largura "virtual" do canvas 3D
  const blockOffset = 1.5; // distância do bloco até a borda
  const baseX = side === 'left' ? -(canvasWidth / 2) + blockSize / 2 + blockOffset : (canvasWidth / 2) - blockSize / 2 - blockOffset;

  function AnimatedBlock({ y, color, highlight, appear, exit, appearTop, exitBottom }: { y: number; color: string; highlight?: boolean; appear?: boolean; exit?: boolean; appearTop?: boolean; exitBottom?: boolean }) {
    const ref = useRef<any>(null);
    useFrame(({ clock }) => {
      if (ref.current) {
        // Entrada: vem da borda do site
        if (appear || appearTop) {
          const targetX = baseX;
          if (Math.abs(ref.current.position.x - targetX) > 0.05) {
            ref.current.position.x += (targetX - ref.current.position.x) * 0.12;
          } else {
            ref.current.position.x = targetX;
          }
        }
        // Saída: vai para fora da tela
        else if (exit || exitBottom) {
          const toX = (side === 'left' ? 8 : -8); // sai para fora
          ref.current.position.x += (toX - ref.current.position.x) * 0.12;
        }
        // Posição normal
        else {
          ref.current.position.x = baseX;
        }
        // Oscilação leve
        ref.current.position.z = Math.cos(clock.getElapsedTime() + y) * 0.05;
        ref.current.scale.set(blockSize, blockSize, blockSize);
      }
    });
    // Entrada: começa na borda, saída: termina fora
    let startX = baseX;
    if (appear || appearTop) startX = (side === 'left' ? -canvasWidth / 2 - 2 : canvasWidth / 2 + 2); // entra da borda
    if (exit || exitBottom) startX = baseX; // sai da posição normal
    return (
      <mesh ref={ref} position={[startX, y, 0]} scale={[blockSize, blockSize, blockSize]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={highlight ? '#7c3aed' : color} metalness={0.7} roughness={0.3} />
      </mesh>
    );
  }

  // Gera blocos da cadeia, todos se movem juntos (efeito esteira)
  const totalBlocks = visibleBlocks + 2; // 1 extra para entrada, 1 para saída
  // Centralizar a cadeia no container
  // Ajuste para garantir que todos os blocos fiquem visíveis
  const containerHeight = (totalBlocks + 1) * blockSpacing * 40; // 40px por unidade
  const baseY = -((totalBlocks - 1) / 2) * blockSpacing;
  const frac = scrollOffset % 1;
  const blocks = Array.from({ length: totalBlocks }, (_, i) => {
    let y = baseY + (i - frac) * blockSpacing;
    let appear = false, exit = false, appearTop = false, exitBottom = false;
    const color = i % 2 === 0 ? '#fbbf24' : '#fde047';
    if (scrollDir === 'down') {
      if (i === totalBlocks - 1 && frac > 0.01 && frac < 0.99) appear = true;
      if (i === 0 && frac > 0.01 && frac < 0.99) exit = true;
    } else {
      if (i === 0 && frac > 0.01 && frac < 0.99) appearTop = true;
      if (i === totalBlocks - 1 && frac > 0.01 && frac < 0.99) exitBottom = true;
    }
    const highlight = scrollDir === 'down' ? i === totalBlocks - 2 : i === 1;
    return (
      <AnimatedBlock
        key={i}
        y={y}
        color={color}
        highlight={highlight}
        appear={appear}
        exit={exit}
        appearTop={appearTop}
        exitBottom={exitBottom}
      />
    );
  });

  // Linhas de conexão
  const lines = Array.from({ length: visibleBlocks - 1 }, (_, i) => {
    const y = baseY + (i + 0.5 - frac) * blockSpacing;
    return (
      <mesh key={i} position={[baseX, y, 0]}>
        <cylinderGeometry args={[0.09, 0.09, blockSpacing, 32]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>
    );
  });

  // Ethereum acompanha o bloco mais recente
  const ethY = baseY + (visibleBlocks - 1 - frac) * blockSpacing + 0.9;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: 0,
        zIndex: 2,
        width: 340,
        height: containerHeight,
        pointerEvents: 'none',
      }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 38 }}>
        <ambientLight intensity={0.7} />
        <Environment preset="night" />
        {/* Blocos animados */}
        {blocks}
        {/* Linhas de conexão */}
        {lines}
        {/* Logo Ethereum acompanha o bloco mais recente */}
        <Html position={[baseX, ethY, 0]} style={{ pointerEvents: 'none' }}>
          <img src={ethereumLogo} alt="Ethereum" style={{ width: 64, height: 64, filter: 'drop-shadow(0 0 16px #7c3aed)' }} />
        </Html>
      </Canvas>
    </div>
  );
}
