const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const SleepRecord = require('../models/SleepRecord');
const sleepScoringService = require('../services/sleepScoring');

const router = express.Router();

// Garmin OAuth configuration
const GARMIN_CLIENT_ID = process.env.GARMIN_CLIENT_ID;
const GARMIN_CLIENT_SECRET = process.env.GARMIN_CLIENT_SECRET;
const GARMIN_REDIRECT_URI = process.env.GARMIN_REDIRECT_URI;

// Initiate Garmin OAuth flow
router.get('/auth', (req, res) => {
  const authUrl = `https://connect.garmin.com/oauthConfirm?oauth_consumer_key=${GARMIN_CLIENT_ID}&oauth_callback=${encodeURIComponent(GARMIN_REDIRECT_URI)}`;
  
  res.json({
    success: true,
    authUrl,
    message: 'Redirect user to this URL to authorize Garmin access'
  });
});

// Handle Garmin OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { oauth_token, oauth_verifier, userId } = req.query;
    
    if (!oauth_token || !oauth_verifier || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing OAuth parameters'
      });
    }
    
    // Exchange OAuth token for access token
    const tokenResponse = await axios.post('https://connectapi.garmin.com/oauth-service/oauth/access_token', {
      oauth_consumer_key: GARMIN_CLIENT_ID,
      oauth_token,
      oauth_verifier,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: Math.random().toString(36).substring(7)
    });
    
    // Update user with Garmin connection
    await User.findOneAndUpdate(
      { userId },
      {
        garminConnected: true,
        garminAccessToken: tokenResponse.data.oauth_token,
        garminRefreshToken: tokenResponse.data.oauth_token_secret
      }
    );
    
    res.json({
      success: true,
      message: 'Garmin connected successfully'
    });
  } catch (error) {
    console.error('Garmin OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect Garmin account'
    });
  }
});

// Fetch sleep data from Garmin
router.post('/sync-sleep/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user || !user.garminConnected) {
      return res.status(400).json({
        success: false,
        error: 'Garmin not connected'
      });
    }
    
    // For now, simulate Garmin API call
    // In production, this would make actual API calls to Garmin
    const garminSleepData = await fetchGarminSleepData(user.garminAccessToken);
    
    // Process and score the sleep data
    const scores = sleepScoringService.calculateSleepScore(garminSleepData);
    
    // Save sleep record
    const sleepRecord = new SleepRecord({
      userId,
      date: new Date(),
      rawData: garminSleepData,
      scores,
      source: 'garmin',
      sourceId: `garmin_${Date.now()}`
    });
    
    await sleepRecord.save();
    
    res.json({
      success: true,
      message: 'Garmin sleep data synced successfully',
      sleepRecord: {
        date: sleepRecord.date,
        dailyProofOfRemScore: sleepRecord.scores.dailyProofOfRemScore,
        remScore: sleepRecord.scores.remScore,
        deepSleepScore: sleepRecord.scores.deepSleepScore,
        efficiencyScore: sleepRecord.scores.efficiencyScore
      }
    });
  } catch (error) {
    console.error('Garmin sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync Garmin sleep data'
    });
  }
});

// Helper function to fetch sleep data from Garmin API
async function fetchGarminSleepData(accessToken) {
  // This is a placeholder implementation
  // In production, you would make actual API calls to Garmin's endpoints
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return sample data that mimics Garmin's sleep data structure
  return {
    totalSleepTime: Math.floor(Math.random() * 120) + 420, // 7-9 hours
    remSleepTime: Math.floor(Math.random() * 60) + 90,     // 1.5-2.5 hours
    deepSleepTime: Math.floor(Math.random() * 40) + 70,    // 1-2 hours
    lightSleepTime: Math.floor(Math.random() * 120) + 200, // 3-5 hours
    sleepEfficiency: Math.floor(Math.random() * 20) + 75,  // 75-95%
    sleepLatency: Math.floor(Math.random() * 30) + 5,      // 5-35 minutes
    wakeAfterSleepOnset: Math.floor(Math.random() * 20) + 5 // 5-25 minutes
  };
}

module.exports = router;
