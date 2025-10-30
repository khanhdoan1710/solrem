const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  garminConnected: {
    type: Boolean,
    default: false
  },
  garminAccessToken: String,
  garminRefreshToken: String,
  garminTokenExpiry: Date,
  totalProofOfRemPoints: {
    type: Number,
    default: 0
  },
  preferences: {
    sleepGoal: {
      type: Number,
      default: 8 // hours
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Update lastActive on save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
