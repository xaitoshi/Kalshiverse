import React from 'react';
import { Market } from '../types';
import { X, TrendingUp, Users, Activity } from 'lucide-react';

interface MarketPanelProps {
  market: Market | null;
  onClose: () => void;
  onScan: () => void;
  isScanned: boolean;
}

export const MarketPanel: React.FC<MarketPanelProps> = ({ market, onClose, onScan, isScanned }) => {
  if (!market) return null;

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = 100 - yesPercent;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-cosmos-dark/95 border-l border-white/10 backdrop-blur-xl z-20 transform transition-transform duration-300 p-6 flex flex-col font-rajdhani">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="mt-8 flex-1">
        <div className="inline-block px-2 py-1 bg-white/10 rounded text-[10px] font-bold tracking-wider mb-2 text-cosmos-cyan border border-cosmos-cyan/30">
            {market.category} GALAXY
        </div>
        
        <h2 className="text-2xl font-bold font-orbitron text-white leading-tight mb-4">
            {market.question}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-3 rounded border border-white/5">
                <div className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3" /> Volume
                </div>
                <div className="text-lg font-bold">${market.volume.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 p-3 rounded border border-white/5">
                <div className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3" /> Ends
                </div>
                <div className="text-lg font-bold">{market.endDate}</div>
            </div>
        </div>

        {/* Prediction Bar */}
        <div className="mb-6">
            <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-cosmos-green">YES {yesPercent}%</span>
                <span className="text-cosmos-red">NO {noPercent}%</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
                <div 
                    className="bg-cosmos-green h-full shadow-[0_0_15px_rgba(10,255,104,0.5)]" 
                    style={{ width: `${yesPercent}%` }}
                ></div>
                <div 
                    className="bg-cosmos-red h-full shadow-[0_0_15px_rgba(255,42,42,0.5)]" 
                    style={{ width: `${noPercent}%` }}
                ></div>
            </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-4 mb-6">
            {market.description}
        </p>

        {/* Action Button */}
        <button
            onClick={onScan}
            disabled={isScanned}
            className={`w-full py-4 rounded-lg font-orbitron font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2
                ${isScanned 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cosmos-purple to-cosmos-cyan hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] text-white'
                }
            `}
        >
            {isScanned ? (
                <>Scan Complete</>
            ) : (
                <>
                    <TrendingUp className="w-4 h-4" /> Analyze & Collect Data
                </>
            )}
        </button>

        {isScanned && (
             <div className="mt-4 text-center text-xs text-cosmos-cyan animate-pulse">
                +50 Prophecy Points Collected!
             </div>
        )}
      </div>
      
      <div className="text-center text-[10px] text-gray-500">
        Data provided by Intergalactic Oracle (Simulated)
      </div>
    </div>
  );
};