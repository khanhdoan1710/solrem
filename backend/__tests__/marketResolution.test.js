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
      marketId: '123',
      status: 'active',
      endTime: new Date(Date.now() + 60 * 1000)
    });

    await expect(
      marketResolutionService.resolveMarketManually('123', 'yes')
    ).rejects.toThrow('Market has not expired yet');
  });

  it('marks a market as resolved when the winning pool has bettors', async () => {
    const resolvedAtBeforeCall = new Date();
    Market.findOneAndUpdate.mockResolvedValue({ marketId: '123', outcome: 'yes', status: 'resolved' });

    await marketResolutionService.updateMarketStatus('123', 'yes', {
      status: 'resolved',
      resolutionSource: 'manual',
      resolutionTxId: 'resolve_tx_123'
    });

    expect(Market.findOneAndUpdate).toHaveBeenCalledWith(
      { marketId: '123' },
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

  it('marks a market as refund when the resolved side has no bettors', () => {
    const status = marketResolutionService.getResolutionStatus(
      {
        yesPool: 100,
        noPool: 0
      },
      'no'
    );

    expect(status).toBe('refund');
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
