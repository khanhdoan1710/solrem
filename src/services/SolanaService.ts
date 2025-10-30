import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export interface WalletInfo {
  publicKey: PublicKey;
  connected: boolean;
}

export interface MarketData {
  marketId: string;
  creator: string;
  description: string;
  endTime: number;
  totalPool: number;
  yesPool: number;
  noPool: number;
  status: 'active' | 'resolved' | 'cancelled';
  outcome?: 'yes' | 'no';
}

export interface BetData {
  marketId: string;
  bettor: string;
  amount: number;
  direction: 'yes' | 'no';
  createdAt: number;
}

class SolanaService {
  private connection: Connection;
  private wallet: WalletInfo | null = null;
  private programId: PublicKey;

  constructor() {
    // Use devnet for development
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.programId = new PublicKey('SoLrEmPrEdIcTiOnMaRkEtS1111111111111111111');
  }

  /**
   * Connect to a Solana wallet
   */
  async connectWallet(): Promise<WalletInfo> {
    try {
      // In a real implementation, this would integrate with wallet adapters
      // For now, we'll simulate wallet connection
      const mockPublicKey = new PublicKey('11111111111111111111111111111112');
      
      this.wallet = {
        publicKey: mockPublicKey,
        connected: true
      };

      return this.wallet;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.wallet = null;
  }

  /**
   * Get current wallet info
   */
  getWallet(): WalletInfo | null {
    return this.wallet;
  }

  /**
   * Get SOL balance
   */
  async getBalance(): Promise<number> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(mintAddress: string): Promise<number> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const mint = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(mint, this.wallet.publicKey);
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  /**
   * Create a new prediction market
   */
  async createMarket(
    description: string,
    endTime: number,
    creatorStake: number,
    mintAddress: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Generate unique market ID
      const marketId = Math.floor(Math.random() * 1000000);
      
      // In a real implementation, this would call the smart contract
      // For now, we'll simulate the transaction
      console.log('Creating market:', {
        marketId,
        description,
        endTime,
        creatorStake,
        mintAddress
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return `market_${marketId}`;
    } catch (error) {
      console.error('Failed to create market:', error);
      throw new Error('Failed to create market');
    }
  }

  /**
   * Place a bet on a prediction market
   */
  async placeBet(
    marketId: string,
    amount: number,
    direction: 'yes' | 'no',
    mintAddress: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would call the smart contract
      console.log('Placing bet:', {
        marketId,
        amount,
        direction,
        mintAddress
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return `bet_${Date.now()}`;
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw new Error('Failed to place bet');
    }
  }

  /**
   * Resolve a prediction market
   */
  async resolveMarket(marketId: string, outcome: 'yes' | 'no'): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would call the smart contract
      console.log('Resolving market:', {
        marketId,
        outcome
      });

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return `resolve_${Date.now()}`;
    } catch (error) {
      console.error('Failed to resolve market:', error);
      throw new Error('Failed to resolve market');
    }
  }

  /**
   * Claim winnings from a resolved market
   */
  async claimWinnings(marketId: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would call the smart contract
      console.log('Claiming winnings for market:', marketId);

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return `claim_${Date.now()}`;
    } catch (error) {
      console.error('Failed to claim winnings:', error);
      throw new Error('Failed to claim winnings');
    }
  }

  /**
   * Get active prediction markets
   */
  async getActiveMarkets(): Promise<MarketData[]> {
    try {
      // In a real implementation, this would query the blockchain
      // For now, return mock data
      return [
        {
          marketId: 'market_1',
          creator: 'SleepTracker123',
          description: 'Will I get 8+ hours of sleep tonight?',
          endTime: Date.now() + 86400000, // 24 hours from now
          totalPool: 2.5,
          yesPool: 1.2,
          noPool: 1.3,
          status: 'active'
        },
        {
          marketId: 'market_2',
          creator: 'DreamCatcher',
          description: 'Will my REM sleep be above 20%?',
          endTime: Date.now() + 172800000, // 48 hours from now
          totalPool: 1.8,
          yesPool: 0.8,
          noPool: 1.0,
          status: 'active'
        }
      ];
    } catch (error) {
      console.error('Failed to get active markets:', error);
      return [];
    }
  }

  /**
   * Get user's bets
   */
  async getUserBets(): Promise<BetData[]> {
    if (!this.wallet) {
      return [];
    }

    try {
      // In a real implementation, this would query the blockchain
      // For now, return mock data
      return [
        {
          marketId: 'market_1',
          bettor: this.wallet.publicKey.toString(),
          amount: 0.5,
          direction: 'yes',
          createdAt: Date.now() - 3600000 // 1 hour ago
        }
      ];
    } catch (error) {
      console.error('Failed to get user bets:', error);
      return [];
    }
  }

  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would use the wallet adapter
      // For now, simulate transaction signing
      console.log('Signing transaction:', transaction);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return `tx_${Date.now()}`;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      if (status.value?.err) {
        return 'failed';
      }
      if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
        return 'confirmed';
      }
      return 'pending';
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return 'failed';
    }
  }
}

export default new SolanaService();
