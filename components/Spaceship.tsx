import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Euler, Group, MathUtils } from 'three';
import { Cone, Cylinder } from '@react-three/drei';

interface SpaceshipProps {
  onPositionChange: (pos: Vector3) => void;
  onWarpToggle: (isWarping: boolean) => void;
}

export const Spaceship: React.FC<SpaceshipProps> = ({ onPositionChange, onWarpToggle }) => {
  const shipRef = useRef<Group>(null);
  const velocity = useRef(new Vector3(0, 0, 0));
  const speed = useRef(0);
  const isWarping = useRef(false);
  const { camera } = useThree();

  // Controls state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!shipRef.current) return;

    // --- Physics / Movement ---
    const rotationSpeed = 2.0 * delta;
    
    // Warp Logic
    const warpActive = keys.current['KeyS'];
    
    if (warpActive !== isWarping.current) {
        isWarping.current = warpActive;
        onWarpToggle(warpActive);
    }

    // Physics parameters based on warp state
    const acceleration = warpActive ? 150.0 * delta : 20.0 * delta;
    const friction = warpActive ? 1.0 * delta : 2.0 * delta;
    const maxSpeed = warpActive ? 300.0 : 30.0;

    // Rotation (Yaw/Pitch)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) shipRef.current.rotation.y += rotationSpeed;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) shipRef.current.rotation.y -= rotationSpeed;
    if (keys.current['KeyW'] || keys.current['ArrowUp']) shipRef.current.rotation.x += rotationSpeed * 0.5;
    
    // Pitch Down mapped to X or ArrowDown (S is now Warp)
    if (keys.current['KeyX'] || keys.current['ArrowDown']) shipRef.current.rotation.x -= rotationSpeed * 0.5;

    // Thrust
    // Space is standard thrust, S is WARP thrust
    if (keys.current['Space'] || warpActive) {
      speed.current = Math.min(speed.current + acceleration, maxSpeed);
    } else if (keys.current['ShiftLeft']) {
       speed.current = Math.max(speed.current - acceleration * 2, 0);
    } else {
       // Auto-cruise or drag
       speed.current = Math.max(speed.current - friction, 0);
    }

    // Calculate forward vector
    const direction = new Vector3(0, 0, -1);
    direction.applyQuaternion(shipRef.current.quaternion);
    
    // Apply velocity
    velocity.current.copy(direction).multiplyScalar(speed.current * delta);
    shipRef.current.position.add(velocity.current);

    // Notify parent of position for collision detection
    onPositionChange(shipRef.current.position.clone());

    // --- Camera Follow Logic ---
    // Target position behind and above the ship
    // If warping, pull camera back further for speed effect
    const zOffset = warpActive ? 40 : 20;
    const yOffset = warpActive ? 12 : 8;
    
    const relativeCameraOffset = new Vector3(0, yOffset, zOffset);
    const cameraOffset = relativeCameraOffset.applyMatrix4(shipRef.current.matrixWorld);
    
    // Smoothly interpolate camera position
    // Stiffer spring when warping
    const lerpFactor = warpActive ? 0.05 : 0.1;
    camera.position.lerp(cameraOffset, lerpFactor);
    
    // Dynamic FOV for warp effect
    const targetFOV = warpActive ? 110 : 75;
    camera.fov = MathUtils.lerp(camera.fov, targetFOV, 0.05);
    camera.updateProjectionMatrix();
    
    // Look at the ship (or slightly in front)
    const lookAtTarget = shipRef.current.position.clone().add(direction.multiplyScalar(10));
    camera.lookAt(lookAtTarget);
  });

  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Ship Body - Brighter material */}
      <Cone args={[1, 4, 4]} rotation={[Math.PI / 2, 0, 0]}>
         <meshStandardMaterial 
            color="#e2e8f0" 
            metalness={0.6} 
            roughness={0.3} 
            emissive="#2d3748"
            emissiveIntensity={0.2}
         />
      </Cone>
      
      {/* Cockpit */}
      <mesh position={[0, 0.5, -0.5]}>
         <boxGeometry args={[0.8, 0.6, 1.5]} />
         <meshStandardMaterial 
            color="#00f0ff" 
            emissive="#00f0ff" 
            emissiveIntensity={0.6} 
            transparent 
            opacity={0.9} 
         />
      </mesh>
      
      {/* Wings - Brighter */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[4, 0.1, 1.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Engines */}
      <group position={[0, 0, 1.8]}>
        <Cylinder args={[0.3, 0.5, 1, 8]} position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <meshStandardMaterial color="#475569" />
        </Cylinder>
        <Cylinder args={[0.3, 0.5, 1, 8]} position={[1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <meshStandardMaterial color="#475569" />
        </Cylinder>
        
        {/* Engine Glow */}
        {speed.current > 0.1 && (
            <>
                <mesh position={[-1, 0, 0.6]}>
                    <sphereGeometry args={[isWarping.current ? 0.5 : 0.25]} />
                    <meshBasicMaterial color={isWarping.current ? "#00ffff" : "#d946ef"} />
                </mesh>
                <mesh position={[1, 0, 0.6]}>
                    <sphereGeometry args={[isWarping.current ? 0.5 : 0.25]} />
                    <meshBasicMaterial color={isWarping.current ? "#00ffff" : "#d946ef"} />
                </mesh>
            </>
        )}
      </group>
    </group>
  );
};