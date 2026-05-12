
export enum Tab {
  HOME = 'HOME',
  MARKETS = 'MARKETS',
  LEADERBOARD = 'LEADERBOARD',
  DEVICE = 'DEVICE',
  RESOURCES = 'RESOURCES',
  PROFILE = 'PROFILE'
}

export interface SleepData {
  date: string;
  score: number;
  remScore: number;       // 25% weight
  deepScore: number;      // 20% weight
  efficiency: number;     // 20% weight
  durationHours: number;  // 15% weight
  latencyMinutes: number; // 10% weight
  wasoMinutes: number;    // 10% weight
}

export interface Market {
  id: string;
  question: string;
  description: string; // New: Detailed context
  rules: string;       // New: Resolution rules
  endsAt: Date;
  poolSize: number; // in SOL
  liquidity: number; // New: Market liquidity
  yesPercent: number;
  noPercent: number;
  volume: number;
  category: 'Personal' | 'Global' | 'Challenge';
}

export interface UserBet {
  marketId: string;
  amount: number;
  position: 'YES' | 'NO';
  entryPrice: number; // New: Price when bought
  potentialPayout: number;
  status: 'OPEN' | 'WON' | 'LOST';
}

export interface Device {
  id: string;
  name: string;
  type: 'GARMIN' | 'WHOOP' | 'CUDIS';
  connected: boolean;
  lastSync: Date | null;
  batteryLevel?: number;
}

export interface UserProfile {
  username: string;
  bio: string;
  avatarUrl: string;
  rank: number;
  solBalance: number;
  remPoints: number;
  streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  accuracy: number;
  streak: number;
  marketsWon: number;
  walletAddress?: string;
}

export interface ResourceItem {
  id: string;
  type: 'ARTICLE' | 'VIDEO' | 'PODCAST';
  title: string;
  description: string;
  author: string;
  duration: string; // e.g., "5 min read" or "15:30"
  link: string;
  thumbnailColor: string; // Tailwind class for placeholder gradient
}
