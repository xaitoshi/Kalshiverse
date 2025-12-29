import React from 'react';
import { UserState, Quest, Market } from '../types';
import { Trophy, Rocket, Target, CheckCircle2, Circle } from 'lucide-react';
import { Vector3 } from 'three';
import { MiniMap } from './MiniMap';

interface HUDProps {
  userState: UserState;
  quests: Quest[];
  shipPosition: Vector3;
  markets: Market[];
}

export const HUD: React.FC<HUDProps> = ({ userState, quests, shipPosition, markets }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4">
      
      {/* Top Bar: Profile & Quests */}
      <div className="flex justify-between items-start w-full">
          {/* Profile Card */}
          <div className="pointer-events-auto bg-cosmos-panel backdrop-blur-md border border-white/10 rounded-xl p-4 w-64 shadow-lg shadow-cosmos-cyan/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmos-cyan to-cosmos-purple flex items-center justify-center">
                <Rocket className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-white text-sm tracking-wide">COMMANDER</h2>
                <div className="text-cosmos-cyan text-xs font-rajdhani font-bold uppercase">{userState.title}</div>
              </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-rajdhani text-gray-300">
                    <span>Level {userState.level}</span>
                    <span>{userState.points} XP</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-cosmos-cyan h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(userState.points % 500) / 5}%` }}
                    ></div>
                </div>
            </div>
          </div>

          {/* Quest Log */}
          <div className="pointer-events-auto bg-cosmos-panel backdrop-blur-md border border-white/10 rounded-xl p-4 w-72 shadow-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <Target className="text-cosmos-purple w-5 h-5" />
              <h3 className="font-orbitron text-sm font-bold text-white">ACTIVE MISSIONS</h3>
            </div>
            
            <div className="space-y-3">
              {quests.map(quest => (
                <div key={quest.id} className={`bg-black/40 p-2 rounded border ${quest.completed ? 'border-cosmos-green/50' : 'border-transparent'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold font-rajdhani ${quest.completed ? 'text-cosmos-green' : 'text-gray-200'}`}>
                        {quest.title}
                    </span>
                    {quest.completed ? 
                        <CheckCircle2 className="w-4 h-4 text-cosmos-green" /> : 
                        <Circle className="w-4 h-4 text-gray-600" />
                    }
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{quest.description}</p>
                  
                  {!quest.completed && (
                      <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div 
                            className="bg-cosmos-purple h-full transition-all duration-500"
                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                        ></div>
                      </div>
                  )}
                  {quest.completed && <div className="text-[10px] text-cosmos-cyan text-right">Reward Collected</div>}
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Bottom Right: MiniMap */}
      <div className="self-end pointer-events-auto mt-auto">
         <MiniMap shipPosition={shipPosition} markets={markets} />
      </div>
    </div>
  );
};