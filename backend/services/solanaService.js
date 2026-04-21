const { Connection, PublicKey } = require('@solana/web3.js');

class SolanaService {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.programId = new PublicKey('DPpLopPcTtciAXf8BNgC1sPzCpHsbedEttFrNysRsWf9');
  }

  /**
   * User-owned flows are expected to be signed by the client wallet.
   */
  async createMarket() {
    throw new Error('createMarket must be submitted and signed by the client wallet');
  }

  async placeBet() {
    throw new Error('placeBet must be submitted and signed by the client wallet');
  }

  async claimWinnings() {
    throw new Error('claimWinnings must be submitted and signed by the client wallet');
  }

  /**
   * Resolve a prediction market with backend authority.
   * This remains a stub until backend signer wiring is implemented.
   */
  async resolveMarket(marketId, outcome) {
    try {
      console.log('Resolving market on Solana with backend authority:', {
        marketId,
        outcome
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      return `resolve_tx_${Date.now()}`;
    } catch (error) {
      console.error('Failed to resolve market on Solana:', error);
      throw error;
    }
  }

  /**
   * Get transaction status from the Solana RPC.
   */
  async getTransactionStatus(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      if (status.value?.err) {
        return 'failed';
      }

      if (
        status.value?.confirmationStatus === 'confirmed' ||
        status.value?.confirmationStatus === 'finalized'
      ) {
        return 'confirmed';
      }

      return 'pending';
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return 'failed';
    }
  }
}

module.exports = new SolanaService();
