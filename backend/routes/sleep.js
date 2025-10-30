const express = require('express');
const SleepRecord = require('../models/SleepRecord');
const User = require('../models/User');
const sleepScoringService = require('../services/sleepScoring');

const router = express.Router();

// Get user's sleep data
router.get('/user/:userId/data', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, offset = 0 } = req.query;
    
    // Get user info
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Get sleep records
    const sleepRecords = await SleepRecord.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    // Calculate total Proof of REM points
    const totalPoints = sleepRecords.reduce((sum, record) => 
      sum + record.scores.dailyProofOfRemScore, 0
    );
    
    res.json({
      success: true,
      totalProofOfRemPoints: totalPoints,
      sleepRecords: sleepRecords.map(record => ({
        _id: record._id,
        date: record.date,
        dailyProofOfRemScore: record.scores.dailyProofOfRemScore,
        remScore: record.scores.remScore,
        deepSleepScore: record.scores.deepSleepScore,
        efficiencyScore: record.scores.efficiencyScore,
        source: record.source,
        syncedAt: record.syncedAt
      }))
    });
  } catch (error) {
    console.error('Sleep data fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sleep data' 
    });
  }
});

// Sync sleep data (placeholder for Garmin integration)
router.post('/sync-sleep', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // For now, create a sample sleep record
    // This will be replaced with actual Garmin API integration
    const sampleSleepData = {
      totalSleepTime: 480, // 8 hours in minutes
      remSleepTime: 120,   // 2 hours REM
      deepSleepTime: 90,   // 1.5 hours deep
      lightSleepTime: 270, // 4.5 hours light
      sleepEfficiency: 85,
      sleepLatency: 15,
      wakeAfterSleepOnset: 10
    };
    
    const scores = sleepScoringService.calculateSleepScore(sampleSleepData);
    
    const sleepRecord = new SleepRecord({
      userId,
      date: new Date(),
      rawData: sampleSleepData,
      scores,
      source: 'garmin',
      sourceId: `sample_${Date.now()}`
    });
    
    await sleepRecord.save();
    
    res.json({
      success: true,
      message: 'Sleep data synced successfully',
      sleepRecord: {
        date: sleepRecord.date,
        dailyProofOfRemScore: sleepRecord.scores.dailyProofOfRemScore,
        remScore: sleepRecord.scores.remScore,
        deepSleepScore: sleepRecord.scores.deepSleepScore,
        efficiencyScore: sleepRecord.scores.efficiencyScore
      }
    });
  } catch (error) {
    console.error('Sleep sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync sleep data' 
    });
  }
});

// Get sleep statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const sleepRecords = await SleepRecord.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    if (sleepRecords.length === 0) {
      return res.json({
        success: true,
        stats: {
          averageScore: 0,
          totalRecords: 0,
          bestScore: 0,
          worstScore: 0,
          averageRemScore: 0,
          averageDeepSleepScore: 0,
          averageEfficiencyScore: 0
        }
      });
    }
    
    const scores = sleepRecords.map(record => record.scores.dailyProofOfRemScore);
    const remScores = sleepRecords.map(record => record.scores.remScore);
    const deepScores = sleepRecords.map(record => record.scores.deepSleepScore);
    const efficiencyScores = sleepRecords.map(record => record.scores.efficiencyScore);
    
    const stats = {
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      totalRecords: sleepRecords.length,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageRemScore: Math.round(remScores.reduce((sum, score) => sum + score, 0) / remScores.length),
      averageDeepSleepScore: Math.round(deepScores.reduce((sum, score) => sum + score, 0) / deepScores.length),
      averageEfficiencyScore: Math.round(efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length)
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Sleep stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sleep statistics' 
    });
  }
});

module.exports = router;
