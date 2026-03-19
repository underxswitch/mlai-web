/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cylinder, Stars, Environment, Box } from '@react-three/drei';
import * as THREE from 'three';

const QuantumParticle = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.2;
      ref.current.rotation.x = t * 0.5;
      ref.current.rotation.z = t * 0.3;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0}
        metalness={0.8}
        distort={0.5}
        speed={3}
      />
    </Sphere>
  );
};

const DataStream = () => {
  const points = useRef<THREE.Group>(null);
  const count = 100;
  
  useFrame((state) => {
    if (points.current) {
      const t = state.clock.getElapsedTime();
      points.current.rotation.y = t * 0.05;
      points.current.children.forEach((child, i) => {
        const speed = 0.2 + (i % 5) * 0.1;
        const offset = i * 0.5;
        child.position.y = Math.sin(t * speed + offset) * 3;
        child.position.x = Math.cos(t * speed + offset) * (4 + Math.sin(t * 0.1) * 2);
        child.position.z = Math.sin(t * speed * 0.5 + offset) * 4;
        
        const s = 0.02 + Math.sin(t * 5 + i) * 0.01;
        child.scale.set(s, s, s);
      });
    }
  });

  return (
    <group ref={points}>
      {[...Array(count)].map((_, i) => (
        <Sphere key={i} args={[1, 8, 8]} position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]}>
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#C5A059" : "#4F46E5"} 
            emissive={i % 2 === 0 ? "#C5A059" : "#4F46E5"} 
            emissiveIntensity={4} 
            transparent 
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  );
};

const MacroscopicWave = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.x = Math.sin(t * 0.2) * 0.2;
       ref.current.rotation.y = t * 0.1;
       ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    }
  });

  return (
    <group>
      <Torus ref={ref} args={[4, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={2} transparent opacity={0.3} wireframe />
      </Torus>
      <Torus args={[4.2, 0.01, 8, 100]} rotation={[Math.PI / 2, 0.5, 0]}>
        <meshStandardMaterial color="#4F46E5" emissive="#4F46E5" emissiveIntensity={1} transparent opacity={0.1} wireframe />
      </Torus>
    </group>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#F9F8F4']} />
        <fog attach="fog" args={['#F9F8F4', 5, 20]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#C5A059" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={5} color="#4F46E5" />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <QuantumParticle position={[0, 0, 0]} color="#1a1a1a" scale={1.8} />
          <MacroscopicWave />
          <DataStream />
        </Float>
        
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
           <QuantumParticle position={[-5, 3, -4]} color="#4F46E5" scale={0.5} />
           <QuantumParticle position={[5, -3, -5]} color="#C5A059" scale={0.6} />
           <QuantumParticle position={[0, 4, -6]} color="#9333EA" scale={0.4} />
           <QuantumParticle position={[-3, -4, -3]} color="#10B981" scale={0.3} />
        </Float>

        <Environment preset="city" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
      </Canvas>
    </div>
  );
};

export const QuantumComputerScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#C5A059" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#4F46E5" />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group rotation={[0, Math.PI / 4, 0]} position={[0, 0.5, 0]}>
            {/* Plates with more detail */}
            {[1.2, 0.6, 0, -0.6, -1.2].map((y, i) => (
              <group key={i} position={[0, y, 0]}>
                <Cylinder args={[1.5 - i * 0.2, 1.5 - i * 0.2, 0.04, 64]}>
                  <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.1} />
                </Cylinder>
                {/* Decorative rim */}
                <Torus args={[1.51 - i * 0.2, 0.01, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
                  <meshStandardMaterial color="#FFF" metalness={1} roughness={0} />
                </Torus>
              </group>
            ))}

            {/* Vertical Support Rods */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * 1.3;
              const z = Math.sin(angle) * 1.3;
              return (
                <Cylinder key={i} args={[0.015, 0.015, 2.5, 16]} position={[x, 0, z]}>
                  <meshStandardMaterial color="#E5E7EB" metalness={0.9} roughness={0.1} />
                </Cylinder>
              );
            })}

            {/* Inner Wiring/Cables */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i / 8) * Math.PI * 2 + 0.2;
              const r = 0.4 + Math.sin(i) * 0.2;
              const x = Math.cos(angle) * r;
              const z = Math.sin(angle) * r;
              return (
                <Cylinder key={`wire-${i}`} args={[0.008, 0.008, 2.4, 8]} position={[x, 0, z]}>
                  <meshStandardMaterial color="#B87333" metalness={1} roughness={0.3} />
                </Cylinder>
              );
            })}

            {/* Cooling Pipes - Blue glowing pipes */}
            {[0, 1, 2].map((i) => {
              const angle = (i / 3) * Math.PI * 2 + Math.PI/6;
              const x = Math.cos(angle) * 0.9;
              const z = Math.sin(angle) * 0.9;
              return (
                <Cylinder key={`pipe-${i}`} args={[0.02, 0.02, 2.4, 16]} position={[x, 0, z]}>
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} transparent opacity={0.6} />
                </Cylinder>
              );
            })}

            {/* Cooling Coils */}
            {[0.3, 0.5, 0.7, 0.9, 1.1].map((y, i) => (
              <Torus key={`coil-${i}`} args={[0.3 + i * 0.1, 0.005, 16, 100]} position={[0, -y, 0]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color="#B87333" metalness={1} roughness={0.2} />
              </Torus>
            ))}
            
            {/* Processor Housing */}
            <group position={[0, -1.4, 0]}>
              <Box args={[0.6, 0.1, 0.6]}>
                <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
              </Box>
              <Box args={[0.4, 0.02, 0.4]} position={[0, 0.06, 0]}>
                <meshStandardMaterial color="#000" metalness={1} roughness={0} emissive="#4F46E5" emissiveIntensity={2} />
              </Box>
              {/* Shimmering Surface */}
              <mesh position={[0, 0.07, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.38, 0.38]} />
                <meshStandardMaterial color="#4F46E5" transparent opacity={0.3} emissive="#4F46E5" emissiveIntensity={1} />
              </mesh>
              {/* Glowing Qubits simulation */}
              <group position={[0, 0.08, 0]}>
                {[-0.1, 0, 0.1].map((x) => 
                  [-0.1, 0, 0.1].map((z) => (
                    <Sphere key={`${x}-${z}`} args={[0.01, 8, 8]} position={[x, 0, z]}>
                      <meshStandardMaterial color="#4F46E5" emissive="#4F46E5" emissiveIntensity={5} />
                    </Sphere>
                  ))
                )}
              </group>
            </group>

            {/* Atmospheric particles around the chandelier */}
            <group>
              {[...Array(40)].map((_, i) => (
                <Sphere key={i} args={[0.008, 8, 8]} position={[Math.random() * 3 - 1.5, Math.random() * 4 - 2, Math.random() * 3 - 1.5]}>
                  <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={2} transparent opacity={0.4} />
                </Sphere>
              ))}
            </group>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}