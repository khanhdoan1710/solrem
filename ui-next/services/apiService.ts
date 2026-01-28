/**
 * API Service - Connect UI-zah with Express Backend
 * Replaces mock data with real API calls
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Types matching backend responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SleepRecordResponse {
  _id: string;
  userId: string;
  date: string;
  scores: {
    dailyProofOfRemScore: number;
    remScore: number;
    deepSleepScore: number;
    efficiencyScore: number;
  };
  rawData: {
    totalSleepTime: number;
    remSleepTime: number;
    deepSleepTime: number;
    lightSleepTime: number;
    sleepEfficiency: number;
    sleepLatency: number;
    wakeAfterSleepOnset: number;
  };
}

interface UserDataResponse {
  userId: string;
  totalProofOfRemPoints: number;
  sleepRecords: SleepRecordResponse[];
  garminConnected: boolean;
}

interface MarketResponse {
  _id: string;
  marketId: string;
  description: string;
  endTime: string;
  creatorStake: number;
  totalPool: number;
  yesPool: number;
  noPool: number;
  status: 'active' | 'resolved' | 'cancelled';
}

/**
 * Fetch user's sleep data and points from backend
 */
export const fetchUserData = async (
  userId: string,
): Promise<UserDataResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep/user/${userId}/data`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error (fetchUserData):', error);
    return null;
  }
};

/**
 * Sync sleep data from Garmin for a user
 */
export const syncGarminSleep = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/garmin/sync-sleep/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) throw new Error('Failed to sync Garmin data');
    return true;
  } catch (error) {
    console.error('API Error (syncGarminSleep):', error);
    return false;
  }
};

/**
 * Get active prediction markets from backend
 */
export const fetchActiveMarkets = async (): Promise<MarketResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/markets/active`);
    if (!response.ok) throw new Error('Failed to fetch markets');
    const data = await response.json();
    return data.markets || [];
  } catch (error) {
    console.error('API Error (fetchActiveMarkets):', error);
    return [];
  }
};

/**
 * Get user sleep statistics
 */
export const fetchSleepStats = async (userId: string, days: number = 7) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sleep/stats/${userId}?days=${days}`,
    );
    if (!response.ok) throw new Error('Failed to fetch sleep stats');
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('API Error (fetchSleepStats):', error);
    return null;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (
  userId: string,
  email?: string,
  walletAddress?: string,
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, walletAddress }),
    });
    if (!response.ok) throw new Error('Failed to register user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error (registerUser):', error);
    return null;
  }
};

/**
 * Get user profile
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('API Error (fetchUserProfile):', error);
    return null;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: any,
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/preferences/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return true;
  } catch (error) {
    console.error('API Error (updateUserPreferences):', error);
    return false;
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend is not reachable:', error);
    return false;
  }
};

export default {
  fetchUserData,
  syncGarminSleep,
  fetchActiveMarkets,
  fetchSleepStats,
  registerUser,
  fetchUserProfile,
  updateUserPreferences,
  checkBackendHealth,
};
