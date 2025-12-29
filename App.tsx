import React, { useState, useEffect } from 'react';
import { generateMarkets, getRankTitle } from './services/marketService';
import { Market, Quest, UserState } from './types';
import { UniverseScene } from './components/UniverseScene';
import { HUD } from './components/HUD';
import { MarketPanel } from './components/MarketPanel';
import { Rocket, Gamepad2, Scan } from 'lucide-react';
import { Vector3 } from 'three';

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Void Explorer',
    description: 'Fly to and analyze 3 different markets.',
    target: 3,
    progress: 0,
    completed: false,
    reward: 150,
    type: 'explore'
  },
  {
    id: 'q2',
    title: 'Whale Watcher',
    description: 'Find a market with over $500k volume.',
    target: 1,
    progress: 0,
    completed: false,
    reward: 300,
    type: 'explore'
  }
];

export default function App() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [nearestMarket, setNearestMarket] = useState<Market | null>(null);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [shipPosition, setShipPosition] = useState(new Vector3(0,0,0));
  
  const [userState, setUserState] = useState<UserState>({
    level: 1,
    points: 0,
    title: 'Rookie Rover',
    scannedMarkets: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    setTimeout(() => {
      setMarkets(generateMarkets(50)); // More markets for the larger universe
      setIsLoading(false);
    }, 1500);
  }, []);

  // Handle interaction key 'E' or 'Enter' to scan nearby market
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.code === 'KeyE' || e.code === 'Enter') && nearestMarket) {
            handleSelectMarket(nearestMarket);
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nearestMarket]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId) || null;

  const handleSelectMarket = (market: Market) => {
    setSelectedMarketId(market.id);
  };

  const handleClosePanel = () => {
    setSelectedMarketId(null);
  };

  const handleScanMarket = () => {
    if (!selectedMarket || userState.scannedMarkets.includes(selectedMarket.id)) return;

    // 1. Update User State
    const newPoints = userState.points + 50;
    const newTitle = getRankTitle(newPoints);
    const newScanned = [...userState.scannedMarkets, selectedMarket.id];

    setUserState(prev => ({
      ...prev,
      points: newPoints,
      title: newTitle,
      scannedMarkets: newScanned
    }));

    // 2. Update Quests
    setQuests(prevQuests => prevQuests.map(q => {
      if (q.completed) return q;

      let newProgress = q.progress;
      if (q.id === 'q1') {
        newProgress += 1;
      } else if (q.id === 'q2' && selectedMarket.volume > 500000) {
        newProgress = 1;
      }

      return {
        ...q,
        progress: newProgress,
        completed: newProgress >= q.target
      };
    }));
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-cosmos-dark flex flex-col items-center justify-center text-white font-orbitron">
        <Rocket className="w-12 h-12 text-cosmos-cyan animate-bounce mb-4" />
        <div className="text-xl tracking-widest animate-pulse">INITIALIZING WARP DRIVE...</div>
        <div className="text-xs font-rajdhani text-gray-500 mt-2">Connecting to Polymarket Data Relay</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-cosmos-dark">
      <UniverseScene 
        markets={markets} 
        onSelectMarket={handleSelectMarket}
        selectedMarketId={selectedMarketId}
        onProximityChange={setNearestMarket}
        onShipMove={setShipPosition}
      />
      
      <HUD 
        userState={userState} 
        quests={quests} 
        shipPosition={shipPosition}
        markets={markets}
      />
      
      {/* Flight Controls Hint */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-white/70 font-rajdhani">
            <div className="flex items-center gap-2 mb-2 text-cosmos-cyan font-bold uppercase text-xs">
                <Gamepad2 className="w-4 h-4" /> Flight Controls
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <span><kbd className="bg-white/10 px-1 rounded text-white">SPACE</kbd> Thrust</span>
                <span><kbd className="bg-white/10 px-1 rounded text-white">W/X</kbd> Pitch</span>
                <span><kbd className="bg-white/10 px-1 rounded text-white">SHIFT</kbd> Brake</span>
                <span><kbd className="bg-white/10 px-1 rounded text-white">A/D</kbd> Turn</span>
                <span className="col-span-2 mt-1 text-cosmos-purple font-bold"><kbd className="bg-white/10 px-1 rounded text-white">S</kbd> WARP DRIVE</span>
            </div>
        </div>
      </div>

      {/* Proximity Alert */}
      {nearestMarket && !selectedMarket && (
         <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-cosmos-panel border border-cosmos-cyan p-4 rounded-xl flex items-center gap-4 animate-bounce shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <div className="w-10 h-10 rounded-full bg-cosmos-cyan/20 flex items-center justify-center text-cosmos-cyan">
                    <Scan className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-cosmos-cyan font-bold font-orbitron text-sm">TARGET LOCK: {nearestMarket.category}</div>
                    <div className="text-white text-xs font-rajdhani">Press <kbd className="bg-white/20 px-1 rounded">E</kbd> to Access Market Data</div>
                </div>
            </div>
         </div>
      )}
      
      <MarketPanel 
        market={selectedMarket} 
        onClose={handleClosePanel}
        onScan={handleScanMarket}
        isScanned={selectedMarketId ? userState.scannedMarkets.includes(selectedMarketId) : false}
      />
    </div>
  );
}