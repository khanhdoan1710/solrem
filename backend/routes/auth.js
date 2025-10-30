const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register-user', async (req, res) => {
  try {
    const userId = uuidv4();
    
    const user = new User({
      userId,
      totalProofOfRemPoints: 0
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      userId,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register user' 
    });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        userId: user.userId,
        totalProofOfRemPoints: user.totalProofOfRemPoints,
        garminConnected: user.garminConnected,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user profile' 
    });
  }
});

// Update user preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    const user = await User.findOneAndUpdate(
      { userId },
      { preferences },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update preferences' 
    });
  }
});

module.exports = router;
