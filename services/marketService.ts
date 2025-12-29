import { Market, MarketCategory } from '../types';

const CATEGORIES: MarketCategory[] = ['BTC', 'ETH', 'SOL', 'DEFI', 'NFT', 'POLITICS', 'SPORTS'];

const COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#14F195',
  DEFI: '#E91E63',
  NFT: '#9C27B0',
  POLITICS: '#FFD700', // Gold
  SPORTS: '#FF4500'    // OrangeRed
};

// Helper to check if a position is too close to existing positions
const isTooClose = (pos: [number, number, number], existingPositions: [number, number, number][], minDistance: number) => {
  return existingPositions.some(existing => {
    const dx = pos[0] - existing[0];
    const dy = pos[1] - existing[1];
    const dz = pos[2] - existing[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return dist < minDistance;
  });
};

const generateRandomPosition = (radius: number): [number, number, number] => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return [x, y, z];
};

export const generateMarkets = (count: number): Market[] => {
  const markets: Market[] = [];
  const existingPositions: [number, number, number][] = [];

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const volume = Math.floor(Math.random() * 1000000) + 5000;
    const yesPrice = Math.random();
    
    // Significantly increase the scale for spaceship exploration
    // Clusters are now far apart "Galaxies"
    let basePos = [0, 0, 0];
    if (category === 'BTC') basePos = [100, 0, 0];
    if (category === 'ETH') basePos = [-80, 40, 40];
    if (category === 'SOL') basePos = [0, -100, 50];
    if (category === 'DEFI') basePos = [60, -60, -60];
    if (category === 'NFT') basePos = [-50, 80, -30];
    // New Sectors
    if (category === 'POLITICS') basePos = [0, 150, 0]; // "High" court
    if (category === 'SPORTS') basePos = [120, -50, 100]; // Arena sector
    
    let coordinates: [number, number, number];
    let attempts = 0;
    
    // Try to find a non-overlapping position
    do {
      const jitter = generateRandomPosition(40); // Large spread within galaxy
      coordinates = [
        basePos[0] + jitter[0],
        basePos[1] + jitter[1],
        basePos[2] + jitter[2]
      ];
      attempts++;
    } while (isTooClose(coordinates, existingPositions, 15) && attempts < 50);

    existingPositions.push(coordinates);

    // Dynamic question generation based on category
    let question = `Will ${category} index hit target?`;
    if (category === 'POLITICS') {
        const candidates = ['Candidate A', 'Candidate B', 'The Incumbent'];
        question = `Will ${candidates[Math.floor(Math.random()*3)]} win the election?`;
    } else if (category === 'SPORTS') {
        const teams = ['Lions', 'Eagles', 'Sharks', 'Dragons'];
        question = `Will the ${teams[Math.floor(Math.random()*4)]} win the championship?`;
    } else {
        question = `Will ${category} hit $${(Math.random() * 5000 + 100).toFixed(2)} by Q4?`;
    }

    markets.push({
      id: `mkt-${i}`,
      question: question,
      category,
      volume,
      yesPrice,
      endDate: new Date(Date.now() + Math.random() * 10000000000).toLocaleDateString(),
      description: `Market regarding ${category.toLowerCase()} outcomes. Resolves based on official data sources.`,
      coordinates,
      color: COLORS[category]
    });
  }
  return markets;
};

export const getRankTitle = (points: number): string => {
  if (points < 100) return "Rookie Rover";
  if (points < 500) return "Star Cadet";
  if (points < 1000) return "Galactic Voyager";
  return "Cosmic Oracle";
};