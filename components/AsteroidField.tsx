import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, InstancedMesh, Object3D } from 'three';

interface AsteroidFieldProps {
  shipPosition: Vector3;
  onCollision: () => void;
}

export const AsteroidField: React.FC<AsteroidFieldProps> = ({ shipPosition, onCollision }) => {
  const count = 500;
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  
  // Generate random asteroid data
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Create a donut/disk shape distribution for the asteroid field to make it navigable
      const radius = 30 + Math.random() * 200;
      const angle = Math.random() * Math.PI * 2;
      const heightSpread = 50;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * heightSpread;

      const scale = Math.random() * 2 + 0.5;
      
      temp.push({
        position: new Vector3(x, y, z),
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        scale
      });
    }
    return temp;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    asteroids.forEach((data, i) => {
      dummy.position.copy(data.position);
      dummy.rotation.set(...data.rotation);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroids, dummy]);

  useFrame(() => {
    // Collision detection
    // Threshold = ship radius (~1.5) + average asteroid radius (~0.8 * scale)
    const collisionThreshold = 3.0; 
    const thresholdSq = collisionThreshold * collisionThreshold;

    // We scan all asteroids. For 500 items, this is cheap enough.
    for (let i = 0; i < count; i++) {
       if (shipPosition.distanceToSquared(asteroids[i].position) < thresholdSq * asteroids[i].scale) {
          onCollision();
          break;
       }
    }
    
    // Slowly rotate the whole field for dynamism
    if (meshRef.current) {
        meshRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#706d6b" 
        roughness={0.9} 
        metalness={0.2}
        flatShading={true}
      />
    </instancedMesh>
  );
};