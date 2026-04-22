const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Market = require('../models/Market');
const Bet = require('../models/Bet');
const marketResolutionService = require('../services/marketResolution');

const router = express.Router();

const DEFAULT_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const VALID_OUTCOMES = new Set(['yes', 'no']);
const VALID_BET_DIRECTIONS = new Set(['yes', 'no']);
const U64_STRING_PATTERN = /^\d+$/;

function parsePositiveInteger(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

function sendError(res, status, error) {
  return res.status(status).json({
    success: false,
    error
  });
}

function hasMissingValue(value) {
  return value === undefined || value === null || value === '';
}

function normalizeDirection(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function validateMarketIdentifier(marketId) {
  return typeof marketId === 'string' && U64_STRING_PATTERN.test(marketId);
}

// Get all active prediction markets
router.get('/active', async (req, res) => {
  try {
    const markets = await Market.find({
      status: 'active',
      endTime: { $gt: new Date() }
    })
      .sort({ endTime: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        markets
      }
    });
  } catch (error) {
    console.error('Markets fetch error:', error);
    sendError(res, 500, 'Failed to fetch prediction markets');
  }
});

// Get user's bets
router.get('/user/:userId/bets', async (req, res) => {
  try {
    const { userId } = req.params;
    const bets = await Bet.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        bets
      }
    });
  } catch (error) {
    console.error('User bets error:', error);
    sendError(res, 500, 'Failed to fetch user bets');
  }
});

// Get resolution history
router.get('/history/resolved', async (req, res) => {
  try {
    const limit = parsePositiveInteger(req.query.limit, 50);
    const history = await marketResolutionService.getResolutionHistory(limit);

    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    console.error('Resolution history error:', error);
    sendError(res, 500, 'Failed to fetch resolution history');
  }
});

// Persist a market after the client has created it on-chain.
// This also mirrors the creator's automatic YES bet from the contract.
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      creatorWallet,
      marketId,
      marketPda,
      txSignature,
      description,
      marketType,
      targetValue,
      endTime,
      mintAddress,
      creatorStake
    } = req.body;

    const normalizedCreatorStake = Number(creatorStake);
    const normalizedMarketId = String(marketId || '').trim();
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const requiredFields = [
      ['userId', userId],
      ['creatorWallet', creatorWallet],
      ['marketId', normalizedMarketId],
      ['marketPda', marketPda],
      ['txSignature', txSignature],
      ['description', normalizedDescription],
      ['marketType', marketType],
      ['targetValue', targetValue],
      ['endTime', endTime]
    ];

    const missingFields = requiredFields
      .filter(([, value]) => hasMissingValue(value))
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return sendError(
        res,
        400,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    if (!validateMarketIdentifier(normalizedMarketId)) {
      return sendError(res, 400, 'marketId must be a numeric string compatible with u64');
    }

    if (normalizedDescription.length > 200) {
      return sendError(res, 400, 'description must be 200 characters or fewer');
    }

    if (Number.isNaN(normalizedCreatorStake) || normalizedCreatorStake <= 0) {
      return sendError(res, 400, 'creatorStake must be greater than zero');
    }

    const parsedEndTime = new Date(endTime);
    if (Number.isNaN(parsedEndTime.getTime())) {
      return sendError(res, 400, 'endTime must be a valid date');
    }

    if (parsedEndTime <= new Date()) {
      return sendError(res, 400, 'endTime must be in the future');
    }

    const existingMarket = await Market.findOne({
      $or: [
        { marketId: normalizedMarketId },
        { marketPda },
        { txSignature }
      ]
    }).lean();

    if (existingMarket) {
      return res.json({
        success: true,
        data: {
          market: existingMarket,
          alreadyPersisted: true
        }
      });
    }

    const market = await Market.create({
      marketId: normalizedMarketId,
      marketPda,
      txSignature,
      creatorUserId: userId,
      creatorWallet,
      description: normalizedDescription,
      marketType,
      targetValue,
      endTime: parsedEndTime,
      mintAddress: mintAddress || DEFAULT_MINT_ADDRESS,
      creatorStake: normalizedCreatorStake,
      totalPool: normalizedCreatorStake,
      yesPool: normalizedCreatorStake,
      noPool: 0,
      status: 'active'
    });

    const creatorBet = await Bet.create({
      betId: uuidv4(),
      txSignature,
      userId,
      walletAddress: creatorWallet,
      marketId: normalizedMarketId,
      marketPda,
      betAmount: normalizedCreatorStake,
      betDirection: 'yes',
      mintAddress: mintAddress || DEFAULT_MINT_ADDRESS,
      status: 'registered'
    });

    res.status(201).json({
      success: true,
      data: {
        market,
        creatorBet
      }
    });
  } catch (error) {
    console.error('Market persistence error:', error);

    if (error.code === 11000) {
      return sendError(res, 409, 'Market or creator bet has already been mirrored');
    }

    sendError(res, 500, 'Failed to persist prediction market');
  }
});

// Persist a bet after the client has placed it on-chain.
router.post('/bet', async (req, res) => {
  try {
    const {
      userId,
      walletAddress,
      marketId,
      marketPda,
      betId,
      txSignature,
      betAmount,
      betDirection,
      mintAddress
    } = req.body;

    const normalizedBetAmount = Number(betAmount);
    const normalizedMarketId = String(marketId || '').trim();
    const direction = normalizeDirection(betDirection);
    const requiredFields = [
      ['userId', userId],
      ['walletAddress', walletAddress],
      ['marketId', normalizedMarketId],
      ['txSignature', txSignature],
      ['betAmount', betAmount],
      ['betDirection', betDirection]
    ];

    const missingFields = requiredFields
      .filter(([, value]) => hasMissingValue(value))
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return sendError(
        res,
        400,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    if (!validateMarketIdentifier(normalizedMarketId)) {
      return sendError(res, 400, 'marketId must be a numeric string compatible with u64');
    }

    if (Number.isNaN(normalizedBetAmount) || normalizedBetAmount <= 0) {
      return sendError(res, 400, 'betAmount must be a positive number');
    }

    if (!VALID_BET_DIRECTIONS.has(direction)) {
      return sendError(res, 400, 'betDirection must be yes or no');
    }

    const market = await Market.findOne({ marketId: normalizedMarketId });
    if (!market) {
      return sendError(res, 404, 'Market not found');
    }

    if (market.status !== 'active' || market.endTime <= new Date()) {
      return sendError(res, 400, 'Market is no longer active');
    }

    if (marketPda && market.marketPda && marketPda !== market.marketPda) {
      return sendError(res, 400, 'marketPda does not match the stored market');
    }

    const existingBet = await Bet.findOne({
      $or: [
        { txSignature },
        { marketId: normalizedMarketId, walletAddress }
      ]
    }).lean();

    if (existingBet) {
      return res.json({
        success: true,
        data: {
          bet: existingBet,
          alreadyPersisted: true
        }
      });
    }

    const persistedBet = await Bet.create({
      betId: betId || uuidv4(),
      txSignature,
      userId,
      walletAddress,
      marketId: normalizedMarketId,
      marketPda: market.marketPda || marketPda || undefined,
      betAmount: normalizedBetAmount,
      betDirection: direction,
      mintAddress: mintAddress || market.mintAddress || DEFAULT_MINT_ADDRESS,
      status: 'registered'
    });

    const poolUpdate = direction === 'yes'
      ? { totalPool: normalizedBetAmount, yesPool: normalizedBetAmount }
      : { totalPool: normalizedBetAmount, noPool: normalizedBetAmount };

    const updatedMarket = await Market.findOneAndUpdate(
      { marketId: market.marketId },
      { $inc: poolUpdate },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: {
        bet: persistedBet,
        market: updatedMarket
      }
    });
  } catch (error) {
    console.error('Bet persistence error:', error);

    if (error.code === 11000) {
      return sendError(res, 409, 'A mirrored bet already exists for this market and wallet');
    }

    sendError(res, 500, 'Failed to persist bet');
  }
});

// Resolve a prediction market using backend authority
router.post('/resolve', async (req, res) => {
  try {
    const { marketId, outcome } = req.body;

    if (!marketId || !outcome) {
      return sendError(res, 400, 'Missing required fields: marketId, outcome');
    }

    const normalizedOutcome = normalizeDirection(outcome);
    const normalizedMarketId = String(marketId).trim();

    if (!validateMarketIdentifier(normalizedMarketId)) {
      return sendError(res, 400, 'marketId must be a numeric string compatible with u64');
    }

    if (!VALID_OUTCOMES.has(normalizedOutcome)) {
      return sendError(res, 400, 'outcome must be yes or no');
    }

    const resolvedMarket = await marketResolutionService.resolveMarketManually(
      normalizedMarketId,
      normalizedOutcome
    );

    res.json({
      success: true,
      data: {
        market: resolvedMarket
      }
    });
  } catch (error) {
    console.error('Market resolution error:', error);

    if (
      error.message === 'Market not found' ||
      error.message === 'Resolved market not found'
    ) {
      return sendError(res, 404, error.message);
    }

    if (
      error.message === 'Market is not active' ||
      error.message === 'Market has not expired yet'
    ) {
      return sendError(res, 400, error.message);
    }

    sendError(res, 500, 'Failed to resolve market');
  }
});

// Get market details
router.get('/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;
    const normalizedMarketId = String(marketId || '').trim();

    if (!validateMarketIdentifier(normalizedMarketId)) {
      return sendError(res, 400, 'marketId must be a numeric string compatible with u64');
    }

    const market = await Market.findOne({ marketId: normalizedMarketId }).lean();

    if (!market) {
      return sendError(res, 404, 'Market not found');
    }

    res.json({
      success: true,
      data: {
        market
      }
    });
  } catch (error) {
    console.error('Market details error:', error);
    sendError(res, 500, 'Failed to fetch market details');
  }
});

module.exports = router;
