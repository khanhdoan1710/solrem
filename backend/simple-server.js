const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple user registration
app.post('/api/register-user', async (req, res) => {
  try {
    const userId = `user_${Date.now()}`;
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

// Get user data
app.get('/api/user/:userId/data', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock sleep data
    const mockData = {
      success: true,
      totalProofOfRemPoints: 1250,
      garminConnected: false,
      sleepRecords: [
        {
          _id: 'record_1',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          dailyProofOfRemScore: 85,
          remScore: 88,
          deepSleepScore: 82,
          efficiencyScore: 90,
          source: 'mock'
        },
        {
          _id: 'record_2',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          dailyProofOfRemScore: 78,
          remScore: 75,
          deepSleepScore: 80,
          efficiencyScore: 85,
          source: 'mock'
        }
      ]
    };
    
    res.json(mockData);
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user data' 
    });
  }
});

// Sync sleep data (mock)
app.post('/api/sync-sleep', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Mock sleep data
    const mockSleepData = {
      success: true,
      message: 'Sleep data synced successfully',
      sleepRecord: {
        date: new Date().toISOString(),
        dailyProofOfRemScore: Math.floor(Math.random() * 30) + 70, // 70-100
        remScore: Math.floor(Math.random() * 30) + 70,
        deepSleepScore: Math.floor(Math.random() * 30) + 70,
        efficiencyScore: Math.floor(Math.random() * 30) + 70
      }
    };
    
    res.json(mockSleepData);
  } catch (error) {
    console.error('Sleep sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync sleep data' 
    });
  }
});

// Get sleep stats
app.get('/api/sleep/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const mockStats = {
      success: true,
      stats: {
        averageScore: 82,
        totalRecords: 7,
        bestScore: 95,
        worstScore: 65,
        averageRemScore: 80,
        averageDeepSleepScore: 78,
        averageEfficiencyScore: 85
      }
    };
    
    res.json(mockStats);
  } catch (error) {
    console.error('Sleep stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sleep statistics' 
    });
  }
});

// Mock prediction markets
app.get('/api/markets/active', async (req, res) => {
  try {
    const markets = [
      {
        marketId: 'market_1',
        creator: 'SleepTracker123',
        description: 'Will I get 8+ hours of sleep tonight?',
        endTime: Date.now() + 86400000, // 24 hours from now
        totalPool: 2.5,
        yesPool: 1.2,
        noPool: 1.3,
        status: 'active'
      },
      {
        marketId: 'market_2',
        creator: 'DreamCatcher',
        description: 'Will my REM sleep be above 20%?',
        endTime: Date.now() + 172800000, // 48 hours from now
        totalPool: 1.8,
        yesPool: 0.8,
        noPool: 1.0,
        status: 'active'
      }
    ];

    res.json({
      success: true,
      markets
    });
  } catch (error) {
    console.error('Markets fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch prediction markets' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 SolREM Backend server running on port ${PORT}`);
  console.log(`📱 Ready for hackathon testing!`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
