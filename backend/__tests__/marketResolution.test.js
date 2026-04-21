jest.mock('../models/Market', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn()
}));

jest.mock('../models/SleepRecord', () => ({
  find: jest.fn()
}));

jest.mock('../services/solanaService', () => ({
  resolveMarket: jest.fn(),
  getTransactionStatus: jest.fn()
}));

const Market = require('../models/Market');
const marketResolutionService = require('../services/marketResolution');

describe('marketResolutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects manual resolution before the market expires', async () => {
    Market.findOne.mockResolvedValue({
      marketId: 'market_123',
      status: 'active',
      endTime: new Date(Date.now() + 60 * 1000)
    });

    await expect(
      marketResolutionService.resolveMarketManually('market_123', 'yes')
    ).rejects.toThrow('Market has not expired yet');
  });

  it('updates market status with resolution metadata', async () => {
    const resolvedAtBeforeCall = new Date();
    Market.findOneAndUpdate.mockResolvedValue({ marketId: 'market_123', outcome: 'yes' });

    await marketResolutionService.updateMarketStatus('market_123', 'yes', {
      resolutionSource: 'manual',
      resolutionTxId: 'resolve_tx_123'
    });

    expect(Market.findOneAndUpdate).toHaveBeenCalledWith(
      { marketId: 'market_123' },
      expect.objectContaining({
        status: 'resolved',
        outcome: 'yes',
        resolutionSource: 'manual',
        resolutionTxId: 'resolve_tx_123',
        resolvedAt: expect.any(Date)
      }),
      { new: true }
    );

    const updatePayload = Market.findOneAndUpdate.mock.calls[0][1];
    expect(updatePayload.resolvedAt.getTime()).toBeGreaterThanOrEqual(
      resolvedAtBeforeCall.getTime()
    );
  });

  it('returns no when rem percentage cannot be computed', () => {
    const outcome = marketResolutionService.resolveRemPercentage(
      { targetValue: 20 },
      {
        rawData: {
          totalSleepTime: 0,
          remSleepTime: 0
        }
      }
    );

    expect(outcome).toBe('no');
  });
});
