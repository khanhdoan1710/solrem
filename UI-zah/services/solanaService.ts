/**
 * Solana Service - Real Wallet & Smart Contract Integration
 * Replaces mock wallet with actual Phantom/Solflare connection
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Solana connection
const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const RPC_ENDPOINT =
  NETWORK === 'mainnet'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Program ID from Anchor deployment
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ||
    'SoLrEmPrEdIcTiOnMaRkEtS1111111111111111111',
);

/**
 * Detect available Solana wallet providers
 */
export const detectWalletProviders = () => {
  const providers: { name: string; adapter: any }[] = [];

  // Check for Phantom
  if (
    typeof window !== 'undefined' &&
    (window as any).phantom?.solana?.isPhantom
  ) {
    providers.push({
      name: 'Phantom',
      adapter: (window as any).phantom.solana,
    });
  }

  // Check for Solflare
  if (typeof window !== 'undefined' && (window as any).solflare?.isSolflare) {
    providers.push({ name: 'Solflare', adapter: (window as any).solflare });
  }

  // Check for Backpack
  if (typeof window !== 'undefined' && (window as any).backpack?.isBackpack) {
    providers.push({ name: 'Backpack', adapter: (window as any).backpack });
  }

  return providers;
};

/**
 * Connect to wallet (Phantom, Solflare, etc.)
 */
export const connectWallet = async (
  providerName: 'Phantom' | 'Solflare' | 'Backpack' = 'Phantom',
): Promise<{ publicKey: string; provider: any } | null> => {
  try {
    const providers = detectWalletProviders();
    const selected = providers.find(p => p.name === providerName);

    if (!selected) {
      // Redirect to install page
      if (providerName === 'Phantom') {
        window.open('https://phantom.app/', '_blank');
      } else if (providerName === 'Solflare') {
        window.open('https://solflare.com/', '_blank');
      }
      throw new Error(
        `${providerName} wallet not detected. Please install it.`,
      );
    }

    const resp = await selected.adapter.connect();
    const publicKey = resp.publicKey.toString();

    console.log(`Connected to ${providerName}:`, publicKey);

    return {
      publicKey,
      provider: selected.adapter,
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    return null;
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = async (provider: any): Promise<void> => {
  try {
    await provider.disconnect();
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Disconnect error:', error);
  }
};

/**
 * Get SOL balance for a public key
 */
export const getBalance = async (publicKey: string): Promise<number> => {
  try {
    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

/**
 * Place a bet on a prediction market (calls smart contract)
 */
export const placeBet = async (
  walletPublicKey: string,
  provider: any,
  marketId: string,
  amount: number, // in SOL
  position: 'YES' | 'NO',
): Promise<string | null> => {
  try {
    // TODO: Implement actual program instruction
    // This is a placeholder that shows the structure

    const fromPubkey = new PublicKey(walletPublicKey);
    const toPubkey = PROGRAM_ID; // In reality, this would be a PDA

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Sign and send transaction
    const signed = await provider.signAndSendTransaction(transaction);
    console.log('Bet placed, signature:', signed.signature);

    return signed.signature;
  } catch (error) {
    console.error('Error placing bet:', error);
    return null;
  }
};

/**
 * Claim winnings from a resolved market
 */
export const claimWinnings = async (
  walletPublicKey: string,
  provider: any,
  marketId: string,
): Promise<string | null> => {
  try {
    // TODO: Implement actual program instruction
    console.log('Claiming winnings for market:', marketId);

    // This would call the claim_winnings instruction on the smart contract
    // For now, it's a placeholder

    return 'mock_signature';
  } catch (error) {
    console.error('Error claiming winnings:', error);
    return null;
  }
};

/**
 * Get market data from on-chain program
 */
export const getMarketData = async (marketId: string): Promise<any> => {
  try {
    // TODO: Fetch market account from program
    // This would deserialize the Market struct from Rust
    console.log('Fetching market data:', marketId);

    return null;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = (provider: any): boolean => {
  return provider?.isConnected || false;
};

/**
 * Request airdrop (Devnet only)
 */
export const requestAirdrop = async (publicKey: string): Promise<boolean> => {
  if (NETWORK !== 'devnet') {
    console.error('Airdrops only available on devnet');
    return false;
  }

  try {
    const pubKey = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(
      pubKey,
      2 * LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(signature);
    console.log('Airdrop successful:', signature);
    return true;
  } catch (error) {
    console.error('Airdrop error:', error);
    return false;
  }
};

export default {
  detectWalletProviders,
  connectWallet,
  disconnectWallet,
  getBalance,
  placeBet,
  claimWinnings,
  getMarketData,
  isWalletConnected,
  requestAirdrop,
};
