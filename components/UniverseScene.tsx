import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { Market } from '../types';
import { Planet } from './Planet';
import { Spaceship } from './Spaceship';
import { AsteroidField } from './AsteroidField';

interface UniverseSceneProps {
  markets: Market[];
  onSelectMarket: (market: Market) => void;
  selectedMarketId: string | null;
  onProximityChange: (market: Market | null) => void;
  // Callback to update parent state with ship position for the HUD Map
  onShipMove?: (pos: Vector3) => void;
}

interface SceneContentProps extends UniverseSceneProps {
    onCollision: () => void;
}

// Internal scene component to handle hooks dependent on Canvas context
const SceneContent: React.FC<SceneContentProps> = ({ markets, onSelectMarket, selectedMarketId, onProximityChange, onCollision, onShipMove }) => {
    const [shipPos, setShipPos] = useState(new Vector3(0,0,0));
    const [isWarping, setIsWarping] = useState(false);
    const lastNearestRef = useRef<string | null>(null);

    const handleShipPosition = (pos: Vector3) => {
        setShipPos(pos);
        if (onShipMove) onShipMove(pos);
    };

    const handleWarpToggle = (warping: boolean) => {
        setIsWarping(warping);
    };

    // Check proximity in loop
    useFrame(() => {
        let nearest: Market | null = null;
        let minDist = 25; // Detection radius

        for (const market of markets) {
            const dx = market.coordinates[0] - shipPos.x;
            const dy = market.coordinates[1] - shipPos.y;
            const dz = market.coordinates[2] - shipPos.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = market;
            }
        }

        if (nearest?.id !== lastNearestRef.current) {
            lastNearestRef.current = nearest ? nearest.id : null;
            onProximityChange(nearest);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 10, 30]} />
            
            {/* Improved Lighting for better visibility */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" castShadow />
            <pointLight position={[-50, -50, -50]} intensity={0.8} color="#bc13fe" />
            <pointLight position={[50, 50, 50]} intensity={0.8} color="#00f0ff" />
            
            {/* Stars react to Warp Speed */}
            <Stars 
                radius={200} 
                depth={100} 
                count={isWarping ? 20000 : 10000} 
                factor={isWarping ? 15 : 6} 
                saturation={0.5} 
                fade 
                speed={isWarping ? 20 : 1} 
            />
            
            <AsteroidField shipPosition={shipPos} onCollision={onCollision} />
            
            <Spaceship onPositionChange={handleShipPosition} onWarpToggle={handleWarpToggle} />
            
            {markets.map((market) => {
                const dx = market.coordinates[0] - shipPos.x;
                const dy = market.coordinates[1] - shipPos.y;
                const dz = market.coordinates[2] - shipPos.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                return (
                    <Planet 
                        key={market.id} 
                        market={market} 
                        onSelect={onSelectMarket}
                        isSelected={selectedMarketId === market.id}
                        distanceToShip={dist}
                    />
                );
            })}
        </>
    );
}

export const UniverseScene: React.FC<UniverseSceneProps> = (props) => {
  const [isHit, setIsHit] = useState(false);
  const lastHit = useRef(0);
  
  const handleCollision = () => {
    const now = Date.now();
    // Throttle collision effects to avoid seizure-inducing flashing
    if (now - lastHit.current > 500) {
        lastHit.current = now;
        setIsHit(true);
        setTimeout(() => setIsHit(false), 300);
    }
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-cosmos-dark">
      {/* Collision Overlay */}
      {isHit && (
         <div className="absolute inset-0 z-50 pointer-events-none bg-red-600/30 mix-blend-hard-light animate-pulse border-[20px] border-red-600/60 flex items-center justify-center">
            <div className="bg-black/80 px-8 py-4 rounded border border-red-500 backdrop-blur-md">
                <div className="text-red-500 font-orbitron font-bold text-4xl tracking-widest animate-bounce">
                    IMPACT WARNING
                </div>
                <div className="text-red-300 font-rajdhani text-center mt-2 tracking-wider">HULL INTEGRITY COMPROMISED</div>
            </div>
         </div>
      )}

      <Canvas>
        {/* Set a lighter background color and fog for depth/visibility */}
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 60, 350]} />
        
        <Suspense fallback={null}>
            <SceneContent {...props} onCollision={handleCollision} />
        </Suspense>
      </Canvas>
    </div>
  );
};