const mongoose = require('mongoose');

const sleepRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Raw sleep data from wearable
  rawData: {
    totalSleepTime: Number, // minutes
    remSleepTime: Number, // minutes
    deepSleepTime: Number, // minutes
    lightSleepTime: Number, // minutes
    awakeTime: Number, // minutes
    sleepEfficiency: Number, // percentage
    sleepLatency: Number, // minutes to fall asleep
    wakeAfterSleepOnset: Number, // minutes awake during sleep
    sleepStages: [{
      stage: String, // 'REM', 'DEEP', 'LIGHT', 'AWAKE'
      startTime: Date,
      endTime: Date,
      duration: Number // minutes
    }]
  },
  // Calculated scores
  scores: {
    dailyProofOfRemScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    remScore: Number, // 0-100
    deepSleepScore: Number, // 0-100
    efficiencyScore: Number, // 0-100
    consistencyScore: Number, // 0-100
    overallSleepQuality: Number // 0-100
  },
  // Source information
  source: {
    type: String,
    enum: ['garmin', 'cudis', 'whoop', 'manual'],
    required: true
  },
  sourceId: String, // ID from the source system
  syncedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
sleepRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('SleepRecord', sleepRecordSchema);
