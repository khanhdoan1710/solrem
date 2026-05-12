const mongoose = require('mongoose');
const Market = require('../models/Market');
const Bet = require('../models/Bet');
const SleepRecord = require('../models/SleepRecord');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solrem';
const DEMO_MARKET_IDS = ['9000001', '9000002', '9000003'];
const DEMO_USER_ID = 'demo-user-prediction-market';
const DEMO_MINT = 'So11111111111111111111111111111111111111112';

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function sleepRecord({ date, totalSleepTime, remSleepTime, deepSleepTime, sleepEfficiency, sleepLatency }) {
  return {
    userId: DEMO_USER_ID,
    date,
    rawData: {
      totalSleepTime,
      remSleepTime,
      deepSleepTime,
      lightSleepTime: Math.max(totalSleepTime - remSleepTime - deepSleepTime, 0),
      awakeTime: 20,
      sleepEfficiency,
      sleepLatency,
      wakeAfterSleepOnset: 10,
      sleepStages: []
    },
    scores: {
      dailyProofOfRemScore: 88,
      remScore: 85,
      deepSleepScore: 82,
      efficiencyScore: sleepEfficiency,
      consistencyScore: 80,
      overallSleepQuality: 86
    },
    source: 'manual',
    sourceId: `prediction-market-demo-${date.getTime()}`
  };
}

function marketBase({ marketId, description, targetValue, endTime, totalPool, yesPool, noPool }) {
  return {
    marketId,
    marketPda: `demo-market-pda-${marketId}`,
    txSignature: `demo-create-tx-${marketId}`,
    creatorUserId: DEMO_USER_ID,
    creatorWallet: `demo-creator-wallet-${marketId}`,
    description,
    marketType: 'sleep-duration',
    targetValue,
    endTime,
    mintAddress: DEMO_MINT,
    creatorStake: 100,
    totalPool,
    yesPool,
    noPool,
    status: 'active',
    outcome: null,
    resolutionSource: null,
    resolutionTxId: null,
    resolvedAt: null
  };
}

function betBase({ betId, txSignature, walletAddress, marketId, amount, direction, userId = DEMO_USER_ID }) {
  return {
    betId,
    txSignature,
    userId,
    walletAddress,
    marketId,
    marketPda: `demo-market-pda-${marketId}`,
    betAmount: amount,
    betDirection: direction,
    mintAddress: DEMO_MINT,
    status: 'registered',
    payoutAmount: null,
    claimedAt: null
  };
}

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await Market.deleteMany({ marketId: { $in: DEMO_MARKET_IDS } });
  await Bet.deleteMany({ marketId: { $in: DEMO_MARKET_IDS } });
  await SleepRecord.deleteMany({
    userId: DEMO_USER_ID,
    sourceId: /^prediction-market-demo-/
  });

  const activeEndTime = hoursFromNow(24);
  const resolvedEndTime = hoursFromNow(-2);
  const refundEndTime = hoursFromNow(-3);

  const markets = await Market.insertMany([
    marketBase({
      marketId: '9000001',
      description: 'Demo: Will I sleep at least 8 hours tonight?',
      targetValue: 8,
      endTime: activeEndTime,
      totalPool: 150,
      yesPool: 100,
      noPool: 50
    }),
    marketBase({
      marketId: '9000002',
      description: 'Demo: Did I sleep at least 7.5 hours last night?',
      targetValue: 7.5,
      endTime: resolvedEndTime,
      totalPool: 175,
      yesPool: 125,
      noPool: 50
    }),
    marketBase({
      marketId: '9000003',
      description: 'Demo: Did I sleep at least 9 hours last night?',
      targetValue: 9,
      endTime: refundEndTime,
      totalPool: 125,
      yesPool: 125,
      noPool: 0
    })
  ]);

  await Bet.insertMany([
    betBase({
      betId: 'demo-bet-9000001-creator',
      txSignature: 'demo-create-tx-9000001',
      walletAddress: 'demo-creator-wallet-9000001',
      marketId: '9000001',
      amount: 100,
      direction: 'yes'
    }),
    betBase({
      betId: 'demo-bet-9000001-no',
      txSignature: 'demo-bet-tx-9000001-no',
      walletAddress: 'demo-bettor-wallet-9000001-no',
      marketId: '9000001',
      amount: 50,
      direction: 'no',
      userId: 'demo-user-no-bettor'
    }),
    betBase({
      betId: 'demo-bet-9000002-creator',
      txSignature: 'demo-create-tx-9000002',
      walletAddress: 'demo-creator-wallet-9000002',
      marketId: '9000002',
      amount: 100,
      direction: 'yes'
    }),
    betBase({
      betId: 'demo-bet-9000002-yes-winner',
      txSignature: 'demo-bet-tx-9000002-yes-winner',
      walletAddress: 'demo-winning-wallet-9000002',
      marketId: '9000002',
      amount: 25,
      direction: 'yes',
      userId: 'demo-winning-user-9000002'
    }),
    betBase({
      betId: 'demo-bet-9000002-no',
      txSignature: 'demo-bet-tx-9000002-no',
      walletAddress: 'demo-losing-wallet-9000002',
      marketId: '9000002',
      amount: 50,
      direction: 'no',
      userId: 'demo-losing-user-9000002'
    }),
    betBase({
      betId: 'demo-bet-9000003-creator',
      txSignature: 'demo-create-tx-9000003',
      walletAddress: 'demo-creator-wallet-9000003',
      marketId: '9000003',
      amount: 100,
      direction: 'yes'
    }),
    betBase({
      betId: 'demo-bet-9000003-yes',
      txSignature: 'demo-bet-tx-9000003-yes',
      walletAddress: 'demo-bettor-wallet-9000003-yes',
      marketId: '9000003',
      amount: 25,
      direction: 'yes',
      userId: 'demo-user-yes-bettor-9000003'
    })
  ]);

  await SleepRecord.insertMany([
    sleepRecord({
      date: new Date(resolvedEndTime.getTime() - 60 * 60 * 1000),
      totalSleepTime: 480,
      remSleepTime: 110,
      deepSleepTime: 95,
      sleepEfficiency: 91,
      sleepLatency: 12
    }),
    sleepRecord({
      date: new Date(refundEndTime.getTime() - 60 * 60 * 1000),
      totalSleepTime: 390,
      remSleepTime: 70,
      deepSleepTime: 60,
      sleepEfficiency: 78,
      sleepLatency: 25
    })
  ]);

  console.log('Seeded prediction market demo data.');
  console.log(`Markets: ${markets.map(market => market.marketId).join(', ')}`);
  console.log('Active demo market: 9000001');
  console.log('Resolvable demo market: 9000002 -> yes/resolved');
  console.log('Refund demo market: 9000003 -> no/refund');
}

seed()
  .catch(error => {
    console.error('Failed to seed prediction market demo data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
