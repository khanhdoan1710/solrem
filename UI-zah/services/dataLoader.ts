/**
 * Data Loader
 * Uses rich mock datasets when mock mode is enabled or live data is unavailable.
 */

import type {
  Device,
  LeaderboardEntry,
  Market,
  SleepData,
  UserBet,
  UserProfile,
} from '../types';
import {
  MOCK_DEVICES,
  MOCK_LEADERBOARD,
  MOCK_MARKETS,
  MOCK_RESOURCES,
  MOCK_SLEEP_HISTORY,
  MOCK_USER_BETS,
  USER_PROFILE,
} from '../constants.mock';
import * as supabaseService from './supabaseService';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const cloneProfile = (profile: UserProfile): UserProfile => ({ ...profile });

const fallbackProfile = (walletAddress?: string): UserProfile => ({
  ...USER_PROFILE,
  username: walletAddress
    ? `${USER_PROFILE.username}_${walletAddress.slice(0, 4).toUpperCase()}`
    : USER_PROFILE.username,
});

const mapUserBet = (bet: any): UserBet => ({
  marketId: bet.market_id ?? bet.marketId,
  amount: Number(bet.amount),
  position: bet.position,
  entryPrice: Number(bet.entry_price ?? bet.entryPrice),
  potentialPayout: Number(bet.potential_payout ?? bet.potentialPayout),
  status: bet.status ?? 'OPEN',
});

const mapLeaderboardEntry = (entry: any, index: number): LeaderboardEntry => ({
  rank: Number(entry.rank ?? index + 1),
  username: String(entry.username ?? `USER_${index + 1}`).toUpperCase(),
  points: Number(entry.total_rem_points ?? entry.points ?? 0),
  accuracy: Number((96.8 - index * 0.45).toFixed(1)),
  streak: Math.max(8, 34 - index * 2),
  marketsWon: Math.max(22, 96 - index * 6),
  walletAddress: entry.wallet_address ?? entry.walletAddress,
});

/**
 * Get Sleep History
 */
export const getSleepHistory = async (
  walletAddress?: string,
): Promise<SleepData[]> => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return USE_MOCK_DATA ? MOCK_SLEEP_HISTORY : [];
  }

  if (USE_MOCK_DATA) {
    return MOCK_SLEEP_HISTORY;
  }

  console.log('🔌 Fetching sleep data from Supabase');
  const data = await supabaseService.getSleepHistory(walletAddress, 10);
  return data.length > 0 ? [...data].reverse() : MOCK_SLEEP_HISTORY;
};

/**
 * Get Active Markets
 */
export const getActiveMarkets = async (): Promise<Market[]> => {
  if (USE_MOCK_DATA) {
    return MOCK_MARKETS;
  }

  console.log('🔌 Fetching markets from Supabase');
  const data = await supabaseService.getActiveMarkets();
  return data.length > 0 ? data : MOCK_MARKETS;
};

/**
 * Get User Devices
 */
export const getUserDevices = async (
  walletAddress?: string,
): Promise<Device[]> => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return USE_MOCK_DATA ? MOCK_DEVICES : [];
  }

  if (USE_MOCK_DATA) {
    return MOCK_DEVICES;
  }

  console.log('🔌 Fetching devices from Supabase');
  const data = await supabaseService.getUserDevices(walletAddress);
  return data.length > 0 ? data : MOCK_DEVICES;
};

/**
 * Get User Profile
 */
export const getUserProfile = async (
  walletAddress?: string,
): Promise<UserProfile | null> => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return USE_MOCK_DATA ? fallbackProfile() : null;
  }

  if (USE_MOCK_DATA) {
    return fallbackProfile(walletAddress);
  }

  console.log('🔌 Fetching user profile from Supabase');
  const data = await supabaseService.getUserByWallet(walletAddress);

  if (data) {
    return cloneProfile(data);
  }

  console.log('🆕 Creating new user profile');
  const newUser = await supabaseService.createUser(walletAddress);
  return newUser ? cloneProfile(newUser) : fallbackProfile(walletAddress);
};

/**
 * Get Resources
 */
export const getResources = () => {
  return MOCK_RESOURCES;
};

/**
 * Toggle Device Connection
 */
export const toggleDevice = async (
  deviceId: string,
  connected: boolean,
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log(`🧪 Mock toggle device ${deviceId} to ${connected}`);
    return true;
  }

  console.log(`🔌 Toggling device ${deviceId} to ${connected}`);
  return await supabaseService.toggleDeviceConnection(deviceId, connected);
};

/**
 * Update User Profile
 */
export const updateProfile = async (
  walletAddress: string,
  updates: { username?: string; bio?: string; avatar_url?: string },
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log('🧪 Mock update profile', updates);
    return true;
  }

  console.log('🔌 Updating user profile');
  return await supabaseService.updateUserProfile(walletAddress, updates);
};

/**
 * Place Bet
 */
export const placeBet = async (
  walletAddress: string,
  marketId: string,
  amount: number,
  position: 'YES' | 'NO',
  entryPrice: number,
  potentialPayout: number,
  transactionSignature?: string,
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log('🧪 Mock place bet', {
      walletAddress,
      marketId,
      amount,
      position,
      entryPrice,
      potentialPayout,
      transactionSignature,
    });
    return true;
  }

  if (!transactionSignature) {
    console.error('❌ Transaction signature required');
    return false;
  }

  console.log('🔌 Placing bet via Supabase with tx:', transactionSignature);
  const result = await supabaseService.placeBet(
    walletAddress,
    marketId,
    amount,
    position,
    entryPrice,
    potentialPayout,
    transactionSignature,
  );

  console.log('🔌 Supabase bet result:', result ? '✅ Success' : '❌ Failed');
  return result;
};

/**
 * Get User Bets
 */
export const getUserBets = async (walletAddress?: string): Promise<UserBet[]> => {
  if (!walletAddress) {
    console.warn('⚠️ No wallet address provided');
    return USE_MOCK_DATA ? MOCK_USER_BETS : [];
  }

  if (USE_MOCK_DATA) {
    return MOCK_USER_BETS;
  }

  console.log('🔌 Fetching user bets from Supabase');
  const data = await supabaseService.getUserBets(walletAddress);
  const bets = data.map(mapUserBet);
  return bets.length > 0 ? bets : MOCK_USER_BETS;
};

/**
 * Get Leaderboard
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (USE_MOCK_DATA) {
    return MOCK_LEADERBOARD;
  }

  console.log('🔌 Fetching leaderboard from Supabase');
  const data = await supabaseService.getLeaderboard(12);
  const leaderboard = data.map(mapLeaderboardEntry);
  return leaderboard.length > 0 ? leaderboard : MOCK_LEADERBOARD;
};

/**
 * Health Check
 */
export const checkConnection = async (): Promise<{
  supabase: boolean;
  mode: 'live' | 'mock';
}> => {
  if (USE_MOCK_DATA) {
    return { supabase: false, mode: 'mock' };
  }

  const isConnected = await supabaseService.checkSupabaseConnection();
  return { supabase: isConnected, mode: 'live' };
};

export default {
  getSleepHistory,
  getActiveMarkets,
  getUserDevices,
  getUserProfile,
  getResources,
  toggleDevice,
  updateProfile,
  placeBet,
  getUserBets,
  getLeaderboard,
  checkConnection,
};
