const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get user data (for dashboard)
router.get('/:userId/data', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Get recent sleep records for the user
    const SleepRecord = require('../models/SleepRecord');
    const sleepRecords = await SleepRecord.find({ userId })
      .sort({ date: -1 })
      .limit(10);
    
    // Calculate total Proof of REM points
    const totalPoints = sleepRecords.reduce((sum, record) => 
      sum + record.scores.dailyProofOfRemScore, 0
    );
    
    res.json({
      success: true,
      totalProofOfRemPoints: totalPoints,
      garminConnected: user.garminConnected,
      sleepRecords: sleepRecords.map(record => ({
        _id: record._id,
        date: record.date,
        dailyProofOfRemScore: record.scores.dailyProofOfRemScore,
        source: record.source
      }))
    });
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user data' 
    });
  }
});

module.exports = router;
