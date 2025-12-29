import React from 'react';
import { Vector3 } from 'three';
import { Market } from '../types';

interface MiniMapProps {
  shipPosition: Vector3;
  markets: Market[];
}

export const MiniMap: React.FC<MiniMapProps> = ({ shipPosition, markets }) => {
  const mapSize = 160;
  const range = 200; // How far the radar sees
  
  // Transform 3D world coord to 2D map coord (0 to 100%)
  const getMapCoord = (val: number, centerVal: number) => {
    const relative = val - centerVal;
    // Normalize to -1 to 1 based on range
    const normalized = relative / range;
    // Map to 0 to 100%
    return 50 + (normalized * 50);
  };

  return (
    <div 
        className="relative bg-cosmos-dark/80 backdrop-blur-md border border-cosmos-cyan/30 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden"
        style={{ width: mapSize, height: mapSize }}
    >
      {/* Radar Grid Lines */}
      <div className="absolute inset-0 border border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      
      {/* Ship Marker (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white transform -translate-y-1"></div>
      </div>

      {/* Markets */}
      {markets.map(market => {
        const x = getMapCoord(market.coordinates[0], shipPosition.x);
        const y = getMapCoord(market.coordinates[2], shipPosition.z); // Map Z to Y axis 2D
        
        // Hide if out of radar bounds
        if (x < 0 || x > 100 || y < 0 || y > 100) return null;

        return (
            <div 
                key={market.id}
                className="absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                    backgroundColor: market.color,
                    boxShadow: `0 0 4px ${market.color}`
                }}
            />
        );
      })}
      
      <div className="absolute bottom-2 w-full text-center text-[8px] text-cosmos-cyan font-orbitron animate-pulse">
        RADAR ACTIVE
      </div>
    </div>
  );
};