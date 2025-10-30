const SleepRecord = require('../models/SleepRecord');
const SolanaService = require('./solanaService');

class MarketResolutionService {
  /**
   * Automatically resolve markets based on sleep data
   */
  async resolveMarkets() {
    try {
      console.log('Starting automatic market resolution...');
      
      // Get all active markets that have expired
      const expiredMarkets = await this.getExpiredMarkets();
      
      for (const market of expiredMarkets) {
        await this.resolveMarket(market);
      }
      
      console.log(`Resolved ${expiredMarkets.length} markets`);
    } catch (error) {
      console.error('Error in market resolution:', error);
    }
  }

  /**
   * Get markets that have expired and need resolution
   */
  async getExpiredMarkets() {
    // In a real implementation, this would query the blockchain
    // For now, return mock expired markets
    const now = Date.now();
    return [
      {
        marketId: 'market_1',
        creator: 'SleepTracker123',
        description: 'Will I get 8+ hours of sleep tonight?',
        endTime: now - 3600000, // 1 hour ago
        targetValue: 8,
        marketType: 'sleep-duration',
        userId: 'user_123'
      }
    ];
  }

  /**
   * Resolve a specific market based on sleep data
   */
  async resolveMarket(market) {
    try {
      console.log(`Resolving market: ${market.marketId}`);
      
      // Get sleep data for the market period
      const sleepData = await this.getSleepDataForMarket(market);
      
      if (!sleepData) {
        console.log(`No sleep data found for market ${market.marketId}`);
        return;
      }

      // Determine outcome based on market type and sleep data
      const outcome = this.determineOutcome(market, sleepData);
      
      if (outcome) {
        // Resolve market on blockchain
        await this.resolveMarketOnBlockchain(market.marketId, outcome);
        
        // Update market status in database
        await this.updateMarketStatus(market.marketId, outcome);
        
        console.log(`Market ${market.marketId} resolved as: ${outcome}`);
      }
    } catch (error) {
      console.error(`Error resolving market ${market.marketId}:`, error);
    }
  }

  /**
   * Get sleep data for the market period
   */
  async getSleepDataForMarket(market) {
    try {
      // Calculate the date range for the market
      const endDate = new Date(market.endTime);
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

      // Get sleep records for the user in the market period
      const sleepRecords = await SleepRecord.find({
        userId: market.userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      if (sleepRecords.length === 0) {
        return null;
      }

      // Return the most recent sleep record
      return sleepRecords[0];
    } catch (error) {
      console.error('Error getting sleep data for market:', error);
      return null;
    }
  }

  /**
   * Determine market outcome based on sleep data
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

  /**
   * Resolve sleep duration market
   */
  resolveSleepDuration(market, sleepData) {
    const targetHours = parseFloat(market.targetValue);
    const actualHours = sleepData.rawData.totalSleepTime / 60; // Convert minutes to hours
    
    return actualHours >= targetHours ? 'yes' : 'no';
  }

  /**
   * Resolve REM percentage market
   */
  resolveRemPercentage(market, sleepData) {
    const targetPercentage = parseFloat(market.targetValue);
    const totalSleepTime = sleepData.rawData.totalSleepTime;
    const remTime = sleepData.rawData.remSleepTime;
    const actualPercentage = (remTime / totalSleepTime) * 100;
    
    return actualPercentage >= targetPercentage ? 'yes' : 'no';
  }

  /**
   * Resolve deep sleep market
   */
  resolveDeepSleep(market, sleepData) {
    const targetHours = parseFloat(market.targetValue);
    const actualHours = sleepData.rawData.deepSleepTime / 60; // Convert minutes to hours
    
    return actualHours >= targetHours ? 'yes' : 'no';
  }

  /**
   * Resolve sleep efficiency market
   */
  resolveSleepEfficiency(market, sleepData) {
    const targetEfficiency = parseFloat(market.targetValue);
    const actualEfficiency = sleepData.rawData.sleepEfficiency;
    
    return actualEfficiency >= targetEfficiency ? 'yes' : 'no';
  }

  /**
   * Resolve wake time market
   */
  resolveWakeTime(market, sleepData) {
    const targetTime = market.targetValue; // Format: "07:00"
    const [targetHour, targetMinute] = targetTime.split(':').map(Number);
    const targetMinutes = targetHour * 60 + targetMinute;
    
    // Calculate actual wake time from sleep data
    // This would need to be implemented based on how wake time is stored
    const actualWakeTime = this.calculateWakeTime(sleepData);
    
    return actualWakeTime <= targetMinutes ? 'yes' : 'no';
  }

  /**
   * Resolve sleep latency market
   */
  resolveSleepLatency(market, sleepData) {
    const targetMinutes = parseFloat(market.targetValue);
    const actualMinutes = sleepData.rawData.sleepLatency;
    
    return actualMinutes <= targetMinutes ? 'yes' : 'no';
  }

  /**
   * Calculate wake time from sleep data
   */
  calculateWakeTime(sleepData) {
    // This is a simplified calculation
    // In a real implementation, you'd need to calculate based on sleep stages
    const totalSleepTime = sleepData.rawData.totalSleepTime;
    const sleepLatency = sleepData.rawData.sleepLatency;
    
    // Assume sleep started at a reasonable time (e.g., 11 PM)
    const sleepStartTime = 23 * 60; // 11 PM in minutes
    const wakeTime = sleepStartTime + sleepLatency + totalSleepTime;
    
    // Convert to minutes from midnight
    return wakeTime % (24 * 60);
  }

  /**
   * Resolve market on blockchain
   */
  async resolveMarketOnBlockchain(marketId, outcome) {
    try {
      // In a real implementation, this would call the Solana smart contract
      console.log(`Resolving market ${marketId} on blockchain as: ${outcome}`);
      
      // Mock blockchain resolution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `resolve_tx_${Date.now()}`;
    } catch (error) {
      console.error('Error resolving market on blockchain:', error);
      throw error;
    }
  }

  /**
   * Update market status in database
   */
  async updateMarketStatus(marketId, outcome) {
    try {
      // In a real implementation, this would update a markets collection
      console.log(`Updating market ${marketId} status to resolved with outcome: ${outcome}`);
      
      // Mock database update
      return true;
    } catch (error) {
      console.error('Error updating market status:', error);
      throw error;
    }
  }

  /**
   * Get market resolution history
   */
  async getResolutionHistory(limit = 50) {
    try {
      // In a real implementation, this would query resolved markets
      return [
        {
          marketId: 'market_1',
          description: 'Will I get 8+ hours of sleep tonight?',
          outcome: 'yes',
          resolvedAt: new Date(),
          totalPool: 2.5,
          winningPool: 1.2
        }
      ];
    } catch (error) {
      console.error('Error getting resolution history:', error);
      return [];
    }
  }
}

module.exports = new MarketResolutionService();
