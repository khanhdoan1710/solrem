/**
 * Sleep Scoring Algorithm based on research studies
 * Combines multiple sleep quality metrics into a comprehensive score
 */

class SleepScoringService {
  /**
   * Calculate comprehensive sleep score based on research-backed metrics
   * @param {Object} sleepData - Raw sleep data from wearable
   * @returns {Object} Calculated scores
   */
  calculateSleepScore(sleepData) {
    const {
      totalSleepTime,
      remSleepTime,
      deepSleepTime,
      lightSleepTime,
      sleepEfficiency,
      sleepLatency,
      wakeAfterSleepOnset
    } = sleepData;

    // Convert minutes to hours for calculations
    const totalHours = totalSleepTime / 60;
    const remHours = remSleepTime / 60;
    const deepHours = deepSleepTime / 60;
    const lightHours = lightSleepTime / 60;

    // Calculate individual component scores (0-100)
    const remScore = this.calculateRemScore(remHours, totalHours);
    const deepSleepScore = this.calculateDeepSleepScore(deepHours, totalHours);
    const efficiencyScore = this.calculateEfficiencyScore(sleepEfficiency);
    const durationScore = this.calculateDurationScore(totalHours);
    const latencyScore = this.calculateLatencyScore(sleepLatency);
    const wakeScore = this.calculateWakeScore(wakeAfterSleepOnset);

    // Weighted composite score
    const dailyProofOfRemScore = Math.round(
      (remScore * 0.25) +           // REM sleep is most important for SolREM
      (deepSleepScore * 0.20) +     // Deep sleep quality
      (efficiencyScore * 0.20) +    // Sleep efficiency
      (durationScore * 0.15) +      // Sleep duration
      (latencyScore * 0.10) +       // Time to fall asleep
      (wakeScore * 0.10)            // Wake after sleep onset
    );

    return {
      dailyProofOfRemScore: Math.max(0, Math.min(100, dailyProofOfRemScore)),
      remScore: Math.round(remScore),
      deepSleepScore: Math.round(deepSleepScore),
      efficiencyScore: Math.round(efficiencyScore),
      overallSleepQuality: Math.round(dailyProofOfRemScore)
    };
  }

  /**
   * Calculate REM sleep score (0-100)
   * Optimal REM: 20-25% of total sleep time
   */
  calculateRemScore(remHours, totalHours) {
    if (totalHours === 0) return 0;
    
    const remPercentage = (remHours / totalHours) * 100;
    
    // Optimal range: 20-25%
    if (remPercentage >= 20 && remPercentage <= 25) {
      return 100;
    }
    
    // Penalty for deviation from optimal range
    if (remPercentage < 20) {
      return Math.max(0, (remPercentage / 20) * 100);
    }
    
    if (remPercentage > 25) {
      return Math.max(0, 100 - ((remPercentage - 25) * 4));
    }
    
    return 0;
  }

  /**
   * Calculate deep sleep score (0-100)
   * Optimal deep sleep: 15-20% of total sleep time
   */
  calculateDeepSleepScore(deepHours, totalHours) {
    if (totalHours === 0) return 0;
    
    const deepPercentage = (deepHours / totalHours) * 100;
    
    // Optimal range: 15-20%
    if (deepPercentage >= 15 && deepPercentage <= 20) {
      return 100;
    }
    
    // Penalty for deviation
    if (deepPercentage < 15) {
      return Math.max(0, (deepPercentage / 15) * 100);
    }
    
    if (deepPercentage > 20) {
      return Math.max(0, 100 - ((deepPercentage - 20) * 3));
    }
    
    return 0;
  }

  /**
   * Calculate sleep efficiency score (0-100)
   * Optimal efficiency: 85% or higher
   */
  calculateEfficiencyScore(efficiency) {
    if (efficiency >= 85) return 100;
    if (efficiency >= 80) return 80;
    if (efficiency >= 75) return 60;
    if (efficiency >= 70) return 40;
    return Math.max(0, (efficiency / 70) * 40);
  }

  /**
   * Calculate sleep duration score (0-100)
   * Optimal duration: 7-9 hours
   */
  calculateDurationScore(totalHours) {
    if (totalHours >= 7 && totalHours <= 9) {
      return 100;
    }
    
    if (totalHours >= 6 && totalHours < 7) {
      return 80 - ((7 - totalHours) * 20);
    }
    
    if (totalHours > 9 && totalHours <= 10) {
      return 100 - ((totalHours - 9) * 20);
    }
    
    if (totalHours < 6) {
      return Math.max(0, (totalHours / 6) * 60);
    }
    
    if (totalHours > 10) {
      return Math.max(0, 100 - ((totalHours - 10) * 10));
    }
    
    return 0;
  }

  /**
   * Calculate sleep latency score (0-100)
   * Optimal latency: 10-20 minutes
   */
  calculateLatencyScore(latencyMinutes) {
    if (latencyMinutes >= 10 && latencyMinutes <= 20) {
      return 100;
    }
    
    if (latencyMinutes < 10) {
      return Math.max(0, (latencyMinutes / 10) * 100);
    }
    
    if (latencyMinutes > 20) {
      return Math.max(0, 100 - ((latencyMinutes - 20) * 2));
    }
    
    return 0;
  }

  /**
   * Calculate wake after sleep onset score (0-100)
   * Optimal: minimal wake time
   */
  calculateWakeScore(wakeMinutes) {
    if (wakeMinutes <= 5) return 100;
    if (wakeMinutes <= 10) return 80;
    if (wakeMinutes <= 20) return 60;
    if (wakeMinutes <= 30) return 40;
    return Math.max(0, 40 - ((wakeMinutes - 30) * 1));
  }

  /**
   * Calculate consistency score based on historical data
   * @param {Array} historicalRecords - Array of previous sleep records
   * @returns {number} Consistency score (0-100)
   */
  calculateConsistencyScore(historicalRecords) {
    if (historicalRecords.length < 7) return 50; // Not enough data
    
    const recentRecords = historicalRecords.slice(-7); // Last 7 days
    const scores = recentRecords.map(record => record.scores.dailyProofOfRemScore);
    
    // Calculate standard deviation
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to consistency score (lower deviation = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
    return Math.round(consistencyScore);
  }
}

module.exports = new SleepScoringService();
