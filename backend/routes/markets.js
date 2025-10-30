const express = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
const solanaService = require('../services/solanaService');
const marketResolutionService = require('../services/marketResolution');

const router = express.Router();

// Placeholder for prediction market routes
// These will be implemented in Phase 3-4

// Get all active prediction markets
router.get('/active', async (req, res) => {
  try {
    // In a real implementation, this would query the blockchain
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

// Create a new prediction market
router.post('/create', async (req, res) => {
  try {
    const { userId, description, endTime, creatorStake, mintAddress } = req.body;
    
    if (!description || !endTime || !creatorStake) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: description, endTime, creatorStake'
      });
    }

    const marketId = await solanaService.createMarket(
      description,
      endTime,
      creatorStake,
      mintAddress || 'So11111111111111111111111111111111111111112'
    );
    
    res.json({
      success: true,
      message: 'Market created successfully',
      marketId
    });
  } catch (error) {
    console.error('Market creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create prediction market' 
    });
  }
});

// Place a bet on a prediction market
router.post('/bet', async (req, res) => {
  try {
    const { userId, marketId, betAmount, betDirection, mintAddress } = req.body;
    
    if (!marketId || !betAmount || !betDirection) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: marketId, betAmount, betDirection'
      });
    }

    const txId = await solanaService.placeBet(
      marketId,
      betAmount,
      betDirection,
      mintAddress || 'So11111111111111111111111111111111111111112'
    );
    
    res.json({
      success: true,
      message: 'Bet placed successfully',
      transactionId: txId
    });
  } catch (error) {
    console.error('Bet placement error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to place bet' 
    });
  }
});

// Resolve a prediction market
router.post('/resolve', async (req, res) => {
  try {
    const { marketId, outcome, userId } = req.body;
    
    if (!marketId || !outcome) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: marketId, outcome'
      });
    }

    const txId = await solanaService.resolveMarket(marketId, outcome);
    
    res.json({
      success: true,
      message: 'Market resolved successfully',
      transactionId: txId
    });
  } catch (error) {
    console.error('Market resolution error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resolve market' 
    });
  }
});

// Get market details
router.get('/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;
    
    const marketData = await solanaService.getMarketData(marketId);
    
    res.json({
      success: true,
      market: marketData
    });
  } catch (error) {
    console.error('Market details error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch market details' 
    });
  }
});

// Get user's bets
router.get('/user/:userId/bets', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userBets = await solanaService.getUserBets(userId);
    
    res.json({
      success: true,
      bets: userBets
    });
  } catch (error) {
    console.error('User bets error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user bets' 
    });
  }
});

// Get resolution history
router.get('/history/resolved', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const history = await marketResolutionService.getResolutionHistory(parseInt(limit));
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Resolution history error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resolution history' 
    });
  }
});

module.exports = router;
