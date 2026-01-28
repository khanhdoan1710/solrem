
import { Market, SleepData, Device, UserProfile, ResourceItem } from './types';

export const MOCK_SLEEP_HISTORY: SleepData[] = [
  { date: 'Mon', score: 72, remScore: 65, deepScore: 70, efficiency: 85, durationHours: 6.5, latencyMinutes: 15, wasoMinutes: 45 },
  { date: 'Tue', score: 68, remScore: 60, deepScore: 65, efficiency: 82, durationHours: 6.2, latencyMinutes: 20, wasoMinutes: 50 },
  { date: 'Wed', score: 85, remScore: 88, deepScore: 80, efficiency: 92, durationHours: 7.8, latencyMinutes: 10, wasoMinutes: 20 },
  { date: 'Thu', score: 78, remScore: 75, deepScore: 72, efficiency: 88, durationHours: 7.0, latencyMinutes: 12, wasoMinutes: 30 },
  { date: 'Fri', score: 91, remScore: 94, deepScore: 85, efficiency: 95, durationHours: 8.2, latencyMinutes: 8, wasoMinutes: 15 },
  { date: 'Sat', score: 88, remScore: 85, deepScore: 82, efficiency: 90, durationHours: 7.9, latencyMinutes: 25, wasoMinutes: 25 },
  { date: 'Sun', score: 94, remScore: 96, deepScore: 88, efficiency: 96, durationHours: 8.5, latencyMinutes: 5, wasoMinutes: 10 },
];

export const MOCK_MARKETS: Market[] = [
  {
    id: 'm1',
    question: 'Will you get > 25% REM sleep tonight?',
    description: 'Based on your wearable data. REM sleep is crucial for memory consolidation and emotional regulation.',
    rules: 'Market resolves to YES if the primary connected device reports REM sleep percentage greater than 25.0% for the sleep session ending tomorrow morning.',
    endsAt: new Date(new Date().getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
    poolSize: 145.2,
    liquidity: 4500,
    yesPercent: 45,
    noPercent: 55,
    volume: 1200,
    category: 'Personal'
  },
  {
    id: 'm2',
    question: 'Global Sleep Score > 80 average?',
    description: 'Predicting the average sleep quality of the entire SolREM userbase for tonight.',
    rules: 'Resolves YES if the computed average Sleep Score of all active users (synced within 24h) exceeds 80.0.',
    endsAt: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
    poolSize: 520.5,
    liquidity: 12000,
    yesPercent: 62,
    noPercent: 38,
    volume: 5400,
    category: 'Global'
  },
  {
    id: 'm3',
    question: 'User @sleep_king > 8h duration?',
    description: 'A challenge market on the top ranked user\'s performance.',
    rules: 'Resolves YES if user @sleep_king records a total sleep duration > 8 hours exactly.',
    endsAt: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
    poolSize: 85.1,
    liquidity: 2000,
    yesPercent: 30,
    noPercent: 70,
    volume: 800,
    category: 'Challenge'
  }
];

export const MOCK_DEVICES: Device[] = [
  { id: 'd1', name: 'Garmin Fenix 7', type: 'GARMIN', connected: true, lastSync: new Date(), batteryLevel: 78 },
  { id: 'd2', name: 'Whoop 4.0', type: 'WHOOP', connected: false, lastSync: null },
  { id: 'd3', name: 'CUDIS Ring', type: 'CUDIS', connected: false, lastSync: null },
];

export const USER_PROFILE: UserProfile = {
  username: "SolSleeper",
  bio: "Hacking sleep cycles 🌙 | REM Chaser",
  avatarUrl: "", // Empty string means use default icon
  rank: 42,
  solBalance: 12.45,
  remPoints: 3450,
  streak: 12
};

export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'r1',
    type: 'ARTICLE',
    title: 'The Science of REM: Why Dreaming Matters',
    description: 'Understand how Rapid Eye Movement consolidates memory and regulates emotions.',
    author: 'Dr. Matt Walker',
    duration: '6 min read',
    link: 'https://google.com',
    thumbnailColor: 'from-blue-600 to-indigo-900'
  },
  {
    id: 'r2',
    type: 'VIDEO',
    title: 'Sleep Toolkit: Tools for Perfect Sleep',
    description: 'Key protocols to set your circadian rhythm and improve sleep efficiency.',
    author: 'Huberman Lab',
    duration: '15:20',
    link: 'https://youtube.com',
    thumbnailColor: 'from-gray-900 to-black'
  },
  {
    id: 'r3',
    type: 'PODCAST',
    title: 'Caffeine, Alcohol & Sleep Architecture',
    description: 'How substances affect your sleep stages and what timing works best.',
    author: 'Peter Attia',
    duration: '45:00',
    link: 'https://spotify.com',
    thumbnailColor: 'from-green-900 to-emerald-950'
  },
  {
    id: 'r4',
    type: 'ARTICLE',
    title: 'Temperature Control for Deep Sleep',
    description: 'Why cooling down your body is essential for entering deep sleep stages.',
    author: 'Sleep Foundation',
    duration: '4 min read',
    link: 'https://google.com',
    thumbnailColor: 'from-orange-700 to-red-900'
  }
];
