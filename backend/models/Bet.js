const mongoose = require('mongoose');

const betSchema = new mongoose.Schema(
  {
    betId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    txSignature: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    walletAddress: {
      type: String,
      required: true,
      index: true
    },
    marketId: {
      type: String,
      required: true,
      index: true
    },
    marketPda: {
      type: String,
      sparse: true,
      index: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0
    },
    betDirection: {
      type: String,
      required: true,
      enum: ['yes', 'no'],
      index: true
    },
    mintAddress: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled', 'settled'],
      default: 'registered',
      index: true
    },
    payoutAmount: {
      type: Number,
      default: null
    },
    claimedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bet', betSchema);
