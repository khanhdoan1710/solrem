const Market = require('../models/Market');
const SleepRecord = require('../models/SleepRecord');
const solanaService = require('./solanaService');

class MarketResolutionService {
  /**
   * Automatically resolve markets based on sleep data.
   */
  async resolveMarkets() {
    try {
      console.log('Starting automatic market resolution...');

      const expiredMarkets = await this.getExpiredMarkets();
      let resolvedCount = 0;

      for (const market of expiredMarkets) {
        const resolvedMarket = await this.resolveMarket(market);
        if (resolvedMarket) {
          resolvedCount += 1;
        }
      }

      console.log(`Resolved ${resolvedCount} of ${expiredMarkets.length} expired markets`);
    } catch (error) {
      console.error('Error in market resolution:', error);
    }
  }

  /**
   * Get markets that have expired and still need resolution.
   */
  async getExpiredMarkets() {
    return Market.find({
      status: 'active',
      endTime: { $lte: new Date() },
      resolvedAt: null,
      outcome: null
    }).sort({ endTime: 1, createdAt: 1 });
  }

  /**
   * Resolve a specific market from stored sleep data.
   */
  async resolveMarket(market) {
    try {
      console.log(`Resolving market: ${market.marketId}`);

      const sleepData = await this.getSleepDataForMarket(market);
      if (!sleepData) {
        console.log(`No sleep data found for market ${market.marketId}`);
        return null;
      }

      const outcome = this.determineOutcome(market, sleepData);
      if (!outcome) {
        console.log(`Unable to determine outcome for market ${market.marketId}`);
        return null;
      }

      return this.finalizeResolution(market, outcome, {
        resolutionSource: 'sleep-record'
      });
    } catch (error) {
      console.error(`Error resolving market ${market.marketId}:`, error);
      return null;
    }
  }

  /**
   * Resolve a specific market manually using backend authority.
   */
  async resolveMarketManually(marketId, outcome) {
    const market = await Market.findOne({ marketId });
    if (!market) {
      throw new Error('Market not found');
    }

    if (market.status !== 'active') {
      throw new Error('Market is not active');
    }

    if (market.endTime > new Date()) {
      throw new Error('Market has not expired yet');
    }

    return this.finalizeResolution(market, outcome, {
      resolutionSource: 'manual'
    });
  }

  async finalizeResolution(market, outcome, metadata = {}) {
    const resolutionStatus = this.getResolutionStatus(market, outcome);
    const txId = await this.resolveMarketOnBlockchain(market, outcome);
    const resolvedMarket = await this.updateMarketStatus(market.marketId, outcome, {
      status: resolutionStatus,
      resolutionSource: metadata.resolutionSource || 'sleep-record',
      resolutionTxId: txId
    });

    console.log(`Market ${market.marketId} resolved as: ${outcome} with status ${resolutionStatus}`);
    return resolvedMarket;
  }

  getResolutionStatus(market, outcome) {
    const winningPool = outcome === 'yes' ? market.yesPool : market.noPool;
    return winningPool > 0 ? 'resolved' : 'refund';
  }

  /**
   * Get sleep data for the market period.
   */
  async getSleepDataForMarket(market) {
    try {
      const endDate = new Date(market.endTime);
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      const userId = market.creatorUserId || market.userId;

      if (!userId) {
        return null;
      }

      const sleepRecords = await SleepRecord.find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      if (sleepRecords.length === 0) {
        return null;
      }

      return sleepRecords[0];
    } catch (error) {
      console.error('Error getting sleep data for market:', error);
      return null;
    }
  }

  /**
   * Determine market outcome based on sleep data.
   */
  determineOutcome(market, sleepData) {
    switch (market.marketType) {
      case 'sleep-duration':
        return this.resolveSleepDuration(market, sleepData);
      case 'rem-percentage':
        return this.resolveRemPercentage(market, sleepData);
      case 'deep-sleep':
        return this.resolveDeepSleep(market, sleepData);
      case 'sleep-efficiency':
        return this.resolveSleepEfficiency(market, sleepData);
      case 'wake-time':
        return this.resolveWakeTime(market, sleepData);
      case 'sleep-latency':
        return this.resolveSleepLatency(market, sleepData);
      default:
        return null;
    }
  }

  resolveSleepDuration(market, sleepData) {
    const targetHours = parseFloat(market.targetValue);
    const actualHours = sleepData.rawData.totalSleepTime / 60;
    return actualHours >= targetHours ? 'yes' : 'no';
  }

  resolveRemPercentage(market, sleepData) {
    const targetPercentage = parseFloat(market.targetValue);
    const totalSleepTime = sleepData.rawData.totalSleepTime;
    const remTime = sleepData.rawData.remSleepTime;

    if (!totalSleepTime) {
      return 'no';
    }

    const actualPercentage = (remTime / totalSleepTime) * 100;
    return actualPercentage >= targetPercentage ? 'yes' : 'no';
  }

  resolveDeepSleep(market, sleepData) {
    const targetHours = parseFloat(market.targetValue);
    const actualHours = sleepData.rawData.deepSleepTime / 60;
    return actualHours >= targetHours ? 'yes' : 'no';
  }

  resolveSleepEfficiency(market, sleepData) {
    const targetEfficiency = parseFloat(market.targetValue);
    const actualEfficiency = sleepData.rawData.sleepEfficiency;
    return actualEfficiency >= targetEfficiency ? 'yes' : 'no';
  }

  resolveWakeTime(market, sleepData) {
    const targetTime = market.targetValue;
    const [targetHour, targetMinute] = String(targetTime).split(':').map(Number);
    const targetMinutes = targetHour * 60 + targetMinute;
    const actualWakeTime = this.calculateWakeTime(sleepData);
    return actualWakeTime <= targetMinutes ? 'yes' : 'no';
  }

  resolveSleepLatency(market, sleepData) {
    const targetMinutes = parseFloat(market.targetValue);
    const actualMinutes = sleepData.rawData.sleepLatency;
    return actualMinutes <= targetMinutes ? 'yes' : 'no';
  }

  calculateWakeTime(sleepData) {
    const totalSleepTime = sleepData.rawData.totalSleepTime;
    const sleepLatency = sleepData.rawData.sleepLatency;
    const sleepStartTime = 23 * 60;
    const wakeTime = sleepStartTime + sleepLatency + totalSleepTime;
    return wakeTime % (24 * 60);
  }

  /**
   * Resolve market on blockchain with backend authority.
   */
  async resolveMarketOnBlockchain(market, outcome) {
    try {
      return await solanaService.resolveMarket({
        marketId: market.marketId,
        marketPda: market.marketPda || null,
        outcome
      });
    } catch (error) {
      console.error('Error resolving market on blockchain:', error);
      throw error;
    }
  }

  /**
   * Update market status in MongoDB after successful resolution.
   */
  async updateMarketStatus(marketId, outcome, metadata = {}) {
    try {
      return await Market.findOneAndUpdate(
        { marketId },
        {
          status: metadata.status || 'resolved',
          outcome,
          resolutionSource: metadata.resolutionSource || 'sleep-record',
          resolutionTxId: metadata.resolutionTxId || null,
          resolvedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating market status:', error);
      throw error;
    }
  }

  /**
   * Get market resolution history from MongoDB.
   */
  async getResolutionHistory(limit = 50) {
    try {
      return await Market.find({
        status: { $in: ['resolved', 'refund'] }
      })
        .sort({ resolvedAt: -1, updatedAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting resolution history:', error);
      return [];
    }
  }
}

module.exports = new MarketResolutionService();
