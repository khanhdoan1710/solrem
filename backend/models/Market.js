const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema(
  {
    marketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    marketPda: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    txSignature: {
      type: String,
      sparse: true,
      index: true
    },
    creatorUserId: {
      type: String,
      required: true,
      index: true
    },
    creatorWallet: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    marketType: {
      type: String,
      required: true,
      enum: [
        'sleep-duration',
        'rem-percentage',
        'deep-sleep',
        'sleep-efficiency',
        'wake-time',
        'sleep-latency'
      ],
      index: true
    },
    targetValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    endTime: {
      type: Date,
      required: true,
      index: true
    },
    mintAddress: {
      type: String,
      required: true,
      index: true
    },
    creatorStake: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPool: {
      type: Number,
      default: 0,
      min: 0
    },
    yesPool: {
      type: Number,
      default: 0,
      min: 0
    },
    noPool: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
      index: true
    },
    outcome: {
      type: String,
      default: null
    },
    resolutionSource: {
      type: String,
      default: null
    },
    resolutionTxId: {
      type: String,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Market', marketSchema);
