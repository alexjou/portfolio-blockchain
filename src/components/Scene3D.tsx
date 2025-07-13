import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Text, Html, Line, OrbitControls, Edges } from '@react-three/drei';
import { Vector3, Mesh } from 'three';
import { AnimatedParticles, DataFlow } from './AnimatedParticles';

function FloatingText({ position, text, fontSize = 0.2, color = "white" }: { position: Vector3; text: string; fontSize?: number; color?: string }) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      maxWidth={2}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

// Componente para um bloco de contrato animado
function ContractBlock({ position, color, label, address, scale = [1, 1, 0.2] }: {
  position: [number, number, number];
  color: string;
  label: string;
  address?: string;
  scale?: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Efeito de flutuação suave
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.03;
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.03;

      // Leve efeito de pulso no tamanho
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.03;
      meshRef.current.scale.x = scale[0] * pulse;
      meshRef.current.scale.y = scale[1] * pulse;
      meshRef.current.scale.z = scale[2];
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
        <Edges color="#ffffff" threshold={15} scale={1.02} />
      </mesh>

      <Text
        position={[0, 0, 0.15]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {address && (
        <Text
          position={[0, -0.35, 0.15]}
          fontSize={0.12}
          color="#ffcc00"
          anchorX="center"
          anchorY="middle"
        >
          {address}
        </Text>
      )}
    </group>
  );
}

// Componente para criar uma linha de conexão entre contratos
function Connection({ start, end, color, width = 0.02 }: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  width?: number;
}) {
  const points = useMemo(() => [new Vector3(...start), new Vector3(...end)], [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      dashed={false}
    />
  );
}

export default function Scene3D() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="max-w-full w-full md:w-[900px] lg:w-[1000px] h-[60vw] max-h-[80vh] min-h-[350px] z-10 rounded-lg overflow-hidden bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-indigo-950">

        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#181c2f']} />
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={1.0}
            panSpeed={0.8}
            rotateSpeed={0.7}
            minDistance={2}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 5 / 6}
            dampingFactor={0.1}
            enableDamping={true}
          />

          <Float
            speed={1}
            rotationIntensity={0.2}
            floatIntensity={0.5}
          >
            {/* Título do diagrama */}
            <FloatingText
              position={new Vector3(0, 3.5, 0)}
              text="Interação entre Contratos ETH-KIPU"
              fontSize={0.35}
              color="#ff9a3c"
            />

            <Html position={[0, 2.8, 0]}>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ad2962',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '16px'
              }}>
                Na hora do deploy, informar o endereço do contrato (0xffa7..cdd7)
              </div>
            </Html>

            <FloatingText
              position={new Vector3(0, 2.2, 0)}
              text="O contrato Cliente precisa do endereço do Cofre para interagir com ele"
              fontSize={0.18}
              color="#ffffff"
            />            {/* Cliente (Bloco Verde) */}
            <ContractBlock
              position={[-4, 1.5, 0]}
              color="#008800"
              label="Cliente"
              address="Deployed at 0xffa7..cfff"
              scale={[1.5, 1.2, 0.2]}
            />

            {/* ICofre (Bloco Azul Claro) */}
            <ContractBlock
              position={[-4, 0, 0]}
              color="#88cccc"
              label="ICofre (Interface)"
              scale={[1.5, 1.2, 0.2]}
            />

            {/* Cofre (Bloco Laranja) */}
            <ContractBlock
              position={[-4, -1.5, 0]}
              color="#dd7744"
              label="Cofre"
              address="Deployed at 0xffa7..cdd7"
              scale={[1.5, 1.2, 0.2]}
            />

            {/* Indicadores de deploy no lado esquerdo */}
            <Html position={[-4, 1.9, 0]}>
              <div style={{
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#00ff00',
                padding: '3px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                transform: 'translateY(-100%)'
              }}>
                Deployed at 0xffa7..cfff
              </div>
            </Html>

            <Html position={[-4, -1.1, 0]}>
              <div style={{
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#ff5500',
                padding: '3px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                transform: 'translateY(-100%)'
              }}>
                Deployed at 0xffa7..cdd7
              </div>
            </Html>

            {/* dApp (Usuário com MetaMask) */}
            <group position={[3, 1.5, 0]}>
              <Html>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginLeft: '20px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>dApp</div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'url(https://metamask.io/images/metamask-fox.svg) no-repeat center center',
                    backgroundSize: 'contain',
                    marginTop: '10px'
                  }}></div>
                </div>
              </Html>
            </group>

            {/* dApp Baixo */}
            <group position={[3, -1.5, 0]}>
              <Html>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginLeft: '20px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>dApp</div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'url(https://metamask.io/images/metamask-fox.svg) no-repeat center center',
                    backgroundSize: 'contain',
                    marginTop: '10px'
                  }}></div>
                </div>
              </Html>
            </group>          {/* Coluna central: Cliente, cinza, Cofre, cinza, Cliente (escada diagonal) */}
            {[
              { color: '#008800', label: 'Cliente', address: '0xffac..d7f0' },
              { color: '#cccccc', label: '', address: undefined },
              { color: '#dd7744', label: 'Cofre', address: '0xffa7..cdd7' },
              { color: '#cccccc', label: '', address: undefined },
              { color: '#008800', label: 'Cliente', address: '0xffa7..cfff' },
            ].map((block, i) => (
              <ContractBlock
                key={`central-block-z-${i}`}
                position={[i * 0.5, -i * 0.35, -2 + i * 1]}
                color={block.color}
                label={block.label}
                address={block.address}
                scale={[1.1, 0.8, 0.13]}
              />
            ))}

            {/* Linhas curvas azuis conectando Clientes ao Cofre (escada diagonal) */}
            {/* Cliente superior para Cofre */}
            <Line
              points={[
                [0, 0, -2], // Cliente superior
                [1, 0.5, -1], // ponto de controle acima
                [1.5, 0.5, 0], // ponto de controle acima
                [1.0, -0.7, 0], // Cofre
              ].map(([x, y, z]) => new Vector3(x, y, z))}
              color="#4477ee"
              lineWidth={0.04}
              dashed={false}
            />
            {/* Cliente inferior para Cofre */}
            <Line
              points={[
                [2.0, -1.4, 2], // Cliente inferior
                [1.5, -1.2, 1], // ponto de controle abaixo
                [1.2, -1.0, 0], // ponto de controle abaixo
                [1.0, -0.7, 0], // Cofre
              ].map(([x, y, z]) => new Vector3(x, y, z))}
              color="#4477ee"
              lineWidth={0.04}
              dashed={false}
            />

            {/* Conexões principais entre os contratos */}
            <Connection start={[-3.2, 1.5, 0]} end={[-1.2, 1.5, 0]} color="#ffffff" width={0.03} />
            <Connection start={[-3.2, 0, 0]} end={[-1.2, 0, 0]} color="#88ccff" width={0.03} />
            <Connection start={[-3.2, -1.5, 0]} end={[-1.2, -1.5, 0]} color="#ffffff" width={0.03} />

            <Connection start={[1.2, 1.5, 0]} end={[2.2, 1.5, 0]} color="#ffffff" width={0.03} />
            <Connection start={[1.2, -1.5, 0]} end={[2.2, -1.5, 0]} color="#ffffff" width={0.03} />

            {/* Conexões dinâmicas entre camadas de blocos */}
            {[-0.3, -0.15, 0, 0.15, 0.3].map((offsetZ, i) => {
              const offsetX = Math.sin(i * 0.8) * 0.15;
              const offsetY = Math.cos(i * 0.5) * 0.05;
              return (
                <Connection
                  key={`conn-top-${i}`}
                  start={[0 + offsetX, 1.0 + offsetY, offsetZ]}
                  end={[0, 0.4, offsetZ * 0.5]}
                  color={i === 2 ? "#ffaa00" : "#4477ee"}
                  width={i === 2 ? 0.04 : 0.02}
                />
              );
            })}

            {[-0.3, -0.15, 0, 0.15, 0.3].map((offsetZ, i) => {
              const offsetX = Math.sin(i * 0.8) * 0.15;
              const offsetY = Math.cos(i * 0.5) * 0.05;
              return (
                <Connection
                  key={`conn-bottom-${i}`}
                  start={[0, -0.4, offsetZ * 0.5]}
                  end={[0 + offsetX, -1.0 + offsetY, offsetZ]}
                  color={i === 2 ? "#ffaa00" : "#ff7700"}
                  width={i === 2 ? 0.04 : 0.02}
                />
              );
            })}

            {/* Conexão do Cliente para o Cofre (explicando a interação direta) */}
            <Connection start={[-3.0, 1.2, 0]} end={[-3.0, -1.2, 0]} color="#ff5500" width={0.02} />

            {/* Explicação da relação cliente-cofre */}
            <Html position={[-4.5, 0, 0]}>
              <div style={{
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#ff5500',
                padding: '5px',
                borderRadius: '3px',
                fontSize: '12px',
                width: '100px',
                textAlign: 'center'
              }}>
                Depende do<br />endereço
              </div>
            </Html>

            {/* Indicadores de deployment */}
            <Html position={[-1.5, 1.5, 0]}>
              <div style={{
                position: 'absolute',
                color: '#00ff00',
                fontSize: '12px',
                fontWeight: 'bold',
                width: '150px',
                textAlign: 'center'
              }}>
                Deployed at 0xffa7..cfff
              </div>
            </Html>

            <Html position={[-1.5, -1.5, 0]}>
              <div style={{
                position: 'absolute',
                color: '#ff5500',
                fontSize: '12px',
                fontWeight: 'bold',
                width: '150px',
                textAlign: 'center'
              }}>
                Deployed at 0xffa7..cdd7
              </div>
            </Html>

            {/* Tabela de Endereços */}
            <group position={[4, -0.2, 0]}>
              <mesh scale={[2, 1.5, 0.1]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#ffcc00" opacity={0.3} transparent />
              </mesh>

              <FloatingText
                position={new Vector3(0, 0.6, 0.1)}
                text="Endereços dos contratos"
                fontSize={0.15}
                color="#ffffff"
              />

              <FloatingText
                position={new Vector3(-0.6, 0.2, 0.1)}
                text="0xffa7..cff7"
                fontSize={0.12}
                color="#ffffff"
              />

              <FloatingText
                position={new Vector3(0.6, 0.2, 0.1)}
                text="58670"
                fontSize={0.12}
                color="#ffffff"
              />

              <FloatingText
                position={new Vector3(-0.6, -0.2, 0.1)}
                text="0xffac..d7f0"
                fontSize={0.12}
                color="#ffffff"
              />

              <FloatingText
                position={new Vector3(0.6, -0.2, 0.1)}
                text="95800"
                fontSize={0.12}
                color="#ffffff"
              />
            </group>

            {/* Explicação do diagrama */}
            <Html position={[4, 1.5, 0]}>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ff9a3c',
                color: 'white',
                width: '180px',
                fontSize: '12px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#ff9a3c' }}>Como funciona:</p>
                <p style={{ margin: '0 0 5px 0' }}>1. O contrato Cliente precisa conhecer o endereço do Cofre</p>
                <p style={{ margin: '0 0 5px 0' }}>2. A interface ICofre define as funções do Cofre</p>
                <p style={{ margin: '0 0 5px 0' }}>3. dApps interagem com os contratos através de suas interfaces</p>
              </div>
            </Html>

            {/* Sistema de partículas animadas */}
            <AnimatedParticles count={60} radius={10} />

            {/* Fluxo de dados da camada cliente para interface */}
            <DataFlow
              startPoint={[0, 1.0, 0]}
              endPoint={[0, 0.4, 0]}
              color="#4477ee"
              count={5}
              speed={0.5}
              size={0.04}
            />

            {/* Fluxo de dados da interface para cofre */}
            <DataFlow
              startPoint={[0, -0.4, 0]}
              endPoint={[0, -1.0, 0]}
              color="#ff7700"
              count={5}
              speed={0.6}
              size={0.04}
            />

            {/* Fluxo de dados entre clientes e dApps */}
            <DataFlow
              startPoint={[1.0, 1.5, 0]}
              endPoint={[2.5, 1.5, 0]}
              color="#ffffff"
              count={3}
              speed={0.4}
              size={0.03}
            />

            {/* Fluxo de dados entre cofres e dApps */}
            <DataFlow
              startPoint={[1.0, -1.5, 0]}
              endPoint={[2.5, -1.5, 0]}
              color="#ffffff"
              count={3}
              speed={0.4}
              size={0.03}
            />
          </Float>

          <Environment preset="night" />

          {/* Efeito de luz pulsante */}
          <pointLight
            position={[0, 0, 5]}
            intensity={2}
            color="#4477ee"
            distance={10}
            decay={2}
          />
          <pointLight
            position={[-5, -2, 2]}
            intensity={1.5}
            color="#ff9a3c"
            distance={8}
            decay={2}
          />
        </Canvas>
      </div>
    </div>
  );
}
