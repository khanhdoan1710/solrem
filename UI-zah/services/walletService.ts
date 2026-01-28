/**
 * Wallet Service - Real Solana Wallet Integration
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Initialize Solana connection
export const connection = new Connection(RPC_URL, 'confirmed');

/**
 * Get SOL Balance
 */
export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

/**
 * Airdrop SOL (Devnet only)
 */
export const airdropSol = async (
  publicKey: PublicKey,
  amount: number = 1,
): Promise<string | null> => {
  try {
    if (NETWORK !== 'devnet') {
      throw new Error('Airdrops only available on devnet');
    }

    console.log(`Requesting airdrop of ${amount} SOL...`);
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL,
    );

    await connection.confirmTransaction(signature);
    console.log('Airdrop confirmed:', signature);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    return null;
  }
};

/**
 * Send SOL Transaction
 */
export const sendTransaction = async (
  transaction: Transaction,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  publicKey: PublicKey,
): Promise<string> => {
  try {
    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    // Sign transaction
    const signed = await signTransaction(transaction);

    // Send and confirm
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    console.log('Transaction confirmed:', signature);
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

/**
 * Create Simple Transfer Transaction
 */
export const createTransferTransaction = (
  from: PublicKey,
  to: PublicKey,
  amount: number,
): Transaction => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );
  return transaction;
};

/**
 * Shorten wallet address for display
 */
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Validate Solana address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export default {
  connection,
  getBalance,
  airdropSol,
  sendTransaction,
  createTransferTransaction,
  shortenAddress,
  isValidAddress,
};
