const { v4: uuidv4 } = require('uuid');
const Market = require('../models/Market');
const Bet = require('../models/Bet');

const DEFAULT_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';

class MarketMirrorService {
  findExistingMarketMirror({ marketId, marketPda, txSignature }) {
    return Market.findOne({
      $or: [
        { marketId },
        { marketPda },
        { txSignature }
      ]
    }).lean();
  }

  async mirrorCreatedMarket({
    userId,
    creatorWallet,
    marketId,
    marketPda,
    txSignature,
    description,
    marketType,
    targetValue,
    endTime,
    mintAddress,
    creatorStake
  }) {
    const resolvedMintAddress = mintAddress || DEFAULT_MINT_ADDRESS;

    const market = await Market.create({
      marketId,
      marketPda,
      txSignature,
      creatorUserId: userId,
      creatorWallet,
      description,
      marketType,
      targetValue,
      endTime,
      mintAddress: resolvedMintAddress,
      creatorStake,
      totalPool: creatorStake,
      yesPool: creatorStake,
      noPool: 0,
      status: 'active'
    });

    const creatorBet = await Bet.create({
      betId: uuidv4(),
      txSignature,
      userId,
      walletAddress: creatorWallet,
      marketId,
      marketPda,
      betAmount: creatorStake,
      betDirection: 'yes',
      mintAddress: resolvedMintAddress,
      status: 'registered'
    });

    return {
      market,
      creatorBet
    };
  }

  findExistingBetMirror({ marketId, walletAddress, txSignature }) {
    return Bet.findOne({
      $or: [
        { txSignature },
        { claimTxSignature: txSignature },
        { marketId, walletAddress }
      ]
    }).lean();
  }

  async mirrorPlacedBet({
    userId,
    walletAddress,
    market,
    marketId,
    marketPda,
    betId,
    txSignature,
    betAmount,
    betDirection,
    mintAddress
  }) {
    const persistedBet = await Bet.create({
      betId: betId || uuidv4(),
      txSignature,
      userId,
      walletAddress,
      marketId,
      marketPda: market.marketPda || marketPda || undefined,
      betAmount,
      betDirection,
      mintAddress: mintAddress || market.mintAddress || DEFAULT_MINT_ADDRESS,
      status: 'registered'
    });

    const poolUpdate = betDirection === 'yes'
      ? { totalPool: betAmount, yesPool: betAmount }
      : { totalPool: betAmount, noPool: betAmount };

    const updatedMarket = await Market.findOneAndUpdate(
      { marketId: market.marketId },
      { $inc: poolUpdate },
      { new: true }
    );

    return {
      bet: persistedBet,
      market: updatedMarket
    };
  }

  async mirrorClaim({ market, bet, claimTxSignature, payoutAmount }) {
    bet.status = market.status === 'refund' ? 'refunded' : 'settled';
    bet.claimTxSignature = claimTxSignature;
    bet.payoutAmount = payoutAmount;
    bet.claimedAt = new Date();
    await bet.save();

    return bet;
  }
}

module.exports = new MarketMirrorService();
