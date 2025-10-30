import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolremPredictionMarkets } from "../target/types/solrem_prediction_markets";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
} from "@solana/spl-token";
import { expect } from "chai";

describe("solrem-prediction-markets", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolremPredictionMarkets as Program<SolremPredictionMarkets>;
  const provider = anchor.getProvider();

  // Test accounts
  let creator: Keypair;
  let bettor1: Keypair;
  let bettor2: Keypair;
  let mint: Keypair;
  let marketId: number;

  before(async () => {
    // Create test keypairs
    creator = Keypair.generate();
    bettor1 = Keypair.generate();
    bettor2 = Keypair.generate();
    mint = Keypair.generate();
    marketId = Math.floor(Math.random() * 1000000);

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(bettor1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(bettor2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    // Create mint
    const mintRent = await getMinimumBalanceForRentExemptMint(provider.connection);
    const mintTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: creator.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        6, // decimals
        creator.publicKey,
        creator.publicKey
      )
    );

    await provider.sendAndConfirm(mintTx, [creator, mint]);

    // Create token accounts and mint tokens
    const creatorTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      creator.publicKey
    );

    const bettor1TokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      bettor1.publicKey
    );

    const bettor2TokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      bettor2.publicKey
    );

    // Create associated token accounts
    const createTokenAccountsTx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        creator.publicKey,
        creatorTokenAccount,
        creator.publicKey,
        mint.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        creator.publicKey,
        bettor1TokenAccount,
        bettor1.publicKey,
        mint.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        creator.publicKey,
        bettor2TokenAccount,
        bettor2.publicKey,
        mint.publicKey
      )
    );

    await provider.sendAndConfirm(createTokenAccountsTx, [creator]);

    // Mint tokens to accounts
    const mintAmount = 1000 * 10**6; // 1000 tokens
    const mintTokensTx = new anchor.web3.Transaction().add(
      createMintToInstruction(
        mint.publicKey,
        creatorTokenAccount,
        creator.publicKey,
        mintAmount
      ),
      createMintToInstruction(
        mint.publicKey,
        bettor1TokenAccount,
        creator.publicKey,
        mintAmount
      ),
      createMintToInstruction(
        mint.publicKey,
        bettor2TokenAccount,
        creator.publicKey,
        mintAmount
      )
    );

    await provider.sendAndConfirm(mintTokensTx, [creator]);
  });

  it("Creates a prediction market", async () => {
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(marketId.toString().padStart(8, '0'))],
      program.programId
    );

    const marketTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      marketPda
    );

    const creatorStake = 100 * 10**6; // 100 tokens

    const tx = await program.methods
      .createMarket(
        new anchor.BN(marketId),
        "Will I get 8+ hours of sleep tonight?",
        new anchor.BN(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
        new anchor.BN(creatorStake)
      )
      .accounts({
        market: marketPda,
        creator: creator.publicKey,
        creatorTokenAccount: await getAssociatedTokenAddress(mint.publicKey, creator.publicKey),
        marketTokenAccount: marketTokenAccount,
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("Market creation transaction:", tx);

    // Verify market was created
    const marketAccount = await program.account.market.fetch(marketPda);
    expect(marketAccount.marketId.toString()).to.equal(marketId.toString());
    expect(marketAccount.creator.toString()).to.equal(creator.publicKey.toString());
    expect(marketAccount.description).to.equal("Will I get 8+ hours of sleep tonight?");
    expect(marketAccount.creatorStake.toString()).to.equal(creatorStake.toString());
    expect(marketAccount.totalPool.toString()).to.equal(creatorStake.toString());
  });

  it("Places bets on the market", async () => {
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(marketId.toString().padStart(8, '0'))],
      program.programId
    );

    const [bet1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor1.publicKey.toBuffer()],
      program.programId
    );

    const [bet2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor2.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = 50 * 10**6; // 50 tokens

    // Place bet 1 (YES)
    const tx1 = await program.methods
      .placeBet(
        new anchor.BN(betAmount),
        { yes: {} }
      )
      .accounts({
        market: marketPda,
        bet: bet1Pda,
        bettor: bettor1.publicKey,
        bettorTokenAccount: await getAssociatedTokenAddress(mint.publicKey, bettor1.publicKey),
        marketTokenAccount: await getAssociatedTokenAddress(mint.publicKey, marketPda),
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor1])
      .rpc();

    console.log("Bet 1 transaction:", tx1);

    // Place bet 2 (NO)
    const tx2 = await program.methods
      .placeBet(
        new anchor.BN(betAmount),
        { no: {} }
      )
      .accounts({
        market: marketPda,
        bet: bet2Pda,
        bettor: bettor2.publicKey,
        bettorTokenAccount: await getAssociatedTokenAddress(mint.publicKey, bettor2.publicKey),
        marketTokenAccount: await getAssociatedTokenAddress(mint.publicKey, marketPda),
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor2])
      .rpc();

    console.log("Bet 2 transaction:", tx2);

    // Verify market state
    const marketAccount = await program.account.market.fetch(marketPda);
    expect(marketAccount.yesPool.toString()).to.equal(betAmount.toString());
    expect(marketAccount.noPool.toString()).to.equal(betAmount.toString());
    expect(marketAccount.totalPool.toString()).to.equal((100 * 10**6 + 2 * betAmount).toString());
  });

  it("Resolves the market", async () => {
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(marketId.toString().padStart(8, '0'))],
      program.programId
    );

    const tx = await program.methods
      .resolveMarket({ yes: {} })
      .accounts({
        market: marketPda,
        resolver: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    console.log("Market resolution transaction:", tx);

    // Verify market was resolved
    const marketAccount = await program.account.market.fetch(marketPda);
    expect(marketAccount.status).to.deep.equal({ resolved: {} });
    expect(marketAccount.outcome).to.deep.equal({ yes: {} });
  });

  it("Claims winnings", async () => {
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(marketId.toString().padStart(8, '0'))],
      program.programId
    );

    const [betPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor1.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .claimWinnings()
      .accounts({
        market: marketPda,
        bet: betPda,
        bettor: bettor1.publicKey,
        bettorTokenAccount: await getAssociatedTokenAddress(mint.publicKey, bettor1.publicKey),
        marketTokenAccount: await getAssociatedTokenAddress(mint.publicKey, marketPda),
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      })
      .signers([bettor1])
      .rpc();

    console.log("Claim winnings transaction:", tx);

    // Verify bet was processed
    const betAccount = await program.account.bet.fetch(betPda);
    expect(betAccount.bettor.toString()).to.equal(bettor1.publicKey.toString());
    expect(betAccount.direction).to.deep.equal({ yes: {} });
  });
});
