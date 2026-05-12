const express = require('express');
const request = require('supertest');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-bet-id')
}));

jest.mock('../models/Market', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn()
}));

jest.mock('../models/Bet', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../services/marketResolution', () => ({
  getResolutionHistory: jest.fn(),
  resolveMarketManually: jest.fn()
}));

const Market = require('../models/Market');
const Bet = require('../models/Bet');
const marketResolutionService = require('../services/marketResolution');
const marketsRouter = require('../routes/markets');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/markets', marketsRouter);
  return app;
}

function leanQuery(value) {
  return {
    lean: jest.fn().mockResolvedValue(value)
  };
}

function sortedLeanQuery(value) {
  return {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value)
  };
}

describe('markets routes', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  it('routes resolution history before marketId details', async () => {
    const history = [{ marketId: '42', status: 'resolved' }];
    marketResolutionService.getResolutionHistory.mockResolvedValue(history);

    const response = await request(app)
      .get('/api/markets/history/resolved?limit=1')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: { history }
    });
    expect(marketResolutionService.getResolutionHistory).toHaveBeenCalledWith(1);
    expect(Market.findOne).not.toHaveBeenCalled();
  });

  it('persists a created market and mirrors the creator yes bet', async () => {
    const endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const market = { marketId: '123', status: 'active' };
    const creatorBet = { betId: 'generated-bet-id', betDirection: 'yes' };

    Market.findOne.mockReturnValue(leanQuery(null));
    Market.create.mockResolvedValue(market);
    Bet.create.mockResolvedValue(creatorBet);

    const response = await request(app)
      .post('/api/markets/create')
      .send({
        userId: 'user-1',
        creatorWallet: 'creator-wallet',
        marketId: '123',
        marketPda: 'market-pda',
        txSignature: 'create-tx',
        description: 'Sleep at least 8 hours',
        marketType: 'sleep-duration',
        targetValue: 8,
        endTime,
        creatorStake: 100
      })
      .expect(201);

    expect(Market.create).toHaveBeenCalledWith(expect.objectContaining({
      marketId: '123',
      creatorStake: 100,
      totalPool: 100,
      yesPool: 100,
      noPool: 0,
      status: 'active'
    }));
    expect(Bet.create).toHaveBeenCalledWith(expect.objectContaining({
      betId: 'generated-bet-id',
      walletAddress: 'creator-wallet',
      marketId: '123',
      betAmount: 100,
      betDirection: 'yes',
      status: 'registered'
    }));
    expect(response.body).toEqual({
      success: true,
      data: {
        market,
        creatorBet
      }
    });
  });

  it('rejects market creation when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/markets/create')
      .send({
        userId: 'user-1',
        marketId: '123'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Missing required fields');
    expect(Market.create).not.toHaveBeenCalled();
    expect(Bet.create).not.toHaveBeenCalled();
  });

  it('does not increment pools when a mirrored bet already exists', async () => {
    const existingBet = {
      betId: 'existing-bet',
      marketId: '123',
      walletAddress: 'bettor-wallet'
    };

    Market.findOne.mockResolvedValue({
      marketId: '123',
      marketPda: 'market-pda',
      status: 'active',
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      mintAddress: 'mint'
    });
    Bet.findOne.mockReturnValue(leanQuery(existingBet));

    const response = await request(app)
      .post('/api/markets/bet')
      .send({
        userId: 'user-2',
        walletAddress: 'bettor-wallet',
        marketId: '123',
        marketPda: 'market-pda',
        txSignature: 'bet-tx',
        betAmount: 50,
        betDirection: 'YES'
      })
      .expect(200);

    expect(Bet.create).not.toHaveBeenCalled();
    expect(Market.findOneAndUpdate).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      success: true,
      data: {
        bet: existingBet,
        alreadyPersisted: true
      }
    });
  });

  it('rejects bets when the market is expired', async () => {
    Market.findOne.mockResolvedValue({
      marketId: '123',
      marketPda: 'market-pda',
      status: 'active',
      endTime: new Date(Date.now() - 60 * 1000),
      mintAddress: 'mint'
    });

    const response = await request(app)
      .post('/api/markets/bet')
      .send({
        userId: 'user-2',
        walletAddress: 'bettor-wallet',
        marketId: '123',
        marketPda: 'market-pda',
        txSignature: 'bet-tx',
        betAmount: 50,
        betDirection: 'yes'
      })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: 'Market is no longer active'
    });
    expect(Bet.create).not.toHaveBeenCalled();
    expect(Market.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('marks claims as refunded when the market resolved to refund', async () => {
    const bet = {
      marketId: '123',
      walletAddress: 'bettor-wallet',
      userId: 'user-2',
      claimedAt: null,
      save: jest.fn().mockResolvedValue()
    };

    Market.findOne.mockReturnValue(leanQuery({
      marketId: '123',
      status: 'refund'
    }));
    Bet.findOne.mockResolvedValue(bet);

    const response = await request(app)
      .post('/api/markets/claim')
      .send({
        userId: 'user-2',
        walletAddress: 'bettor-wallet',
        marketId: '123',
        claimTxSignature: 'claim-tx',
        payoutAmount: 50
      })
      .expect(200);

    expect(bet.status).toBe('refunded');
    expect(bet.claimTxSignature).toBe('claim-tx');
    expect(bet.payoutAmount).toBe(50);
    expect(bet.claimedAt).toBeInstanceOf(Date);
    expect(bet.save).toHaveBeenCalledTimes(1);
    expect(response.body.success).toBe(true);
    expect(response.body.data.bet).toEqual(expect.objectContaining({
      status: 'refunded',
      claimTxSignature: 'claim-tx',
      payoutAmount: 50
    }));
  });

  it('returns active markets from Mongo with the standard response shape', async () => {
    const markets = [{ marketId: '123', status: 'active' }];
    Market.find.mockReturnValue(sortedLeanQuery(markets));

    const response = await request(app)
      .get('/api/markets/active')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: { markets }
    });
  });

  it('rejects manual resolution with an invalid outcome', async () => {
    const response = await request(app)
      .post('/api/markets/resolve')
      .send({
        marketId: '123',
        outcome: 'maybe'
      })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: 'outcome must be yes or no'
    });
    expect(marketResolutionService.resolveMarketManually).not.toHaveBeenCalled();
  });
});
