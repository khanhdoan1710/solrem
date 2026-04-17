use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DPpLopPcTtciAXf8BNgC1sPzCpHsbedEttFrNysRsWf9");

// Fixed backend authority used by the MVP; update this value when rotating the backend key.
pub const BACKEND_AUTHORITY: Pubkey = Pubkey::new_from_array([
    0xab, 0xed, 0xce, 0x92, 0x46, 0xf7, 0xc1, 0x3b,
    0x0e, 0x3e, 0x95, 0x1e, 0xde, 0x1f, 0x5d, 0x33,
    0x74, 0x3f, 0x59, 0x55, 0x49, 0xca, 0x40, 0xa1,
    0xfb, 0x66, 0x17, 0x58, 0x8f, 0xe8, 0x22, 0x74,
]);

#[program]
pub mod solrem_prediction_markets {
    use super::*;

    /// Initialize a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        description: String,
        end_time: i64,
        creator_stake: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(end_time > clock.unix_timestamp, ErrorCode::MarketEndTimeInPast);
        require!(creator_stake > 0, ErrorCode::InvalidCreatorStake);
        require!(description.as_bytes().len() <= 200, ErrorCode::DescriptionTooLong);

        market.market_id = market_id;
        market.creator = ctx.accounts.creator.key();
        market.description = description;
        market.end_time = end_time;
        market.creator_stake = creator_stake;
        market.total_pool = creator_stake;
        market.yes_pool = creator_stake;
        market.no_pool = 0;
        market.status = MarketStatus::Active;
        market.outcome = None;
        market.created_at = clock.unix_timestamp;
        market.resolved_at = None;
        market.bump = ctx.bumps.market;

        // Create creator's bet account (auto-bet YES)
        let creator_bet = &mut ctx.accounts.creator_bet;
        creator_bet.market = market.key();
        creator_bet.bettor = ctx.accounts.creator.key();
        creator_bet.amount = creator_stake;
        creator_bet.direction = BetDirection::Yes;
        creator_bet.created_at = clock.unix_timestamp;
        creator_bet.bump = ctx.bumps.creator_bet;

        // Transfer creator's stake to the market
        let cpi_accounts = Transfer {
            from: ctx.accounts.creator_token_account.to_account_info(),
            to: ctx.accounts.market_token_account.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, creator_stake)?;

        emit!(MarketCreated {
            market_id,
            creator: ctx.accounts.creator.key(),
            description: description.clone(),
            end_time,
            creator_stake,
        });

        Ok(())
    }

    /// Place a bet on a prediction market
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        bet_amount: u64,
        bet_direction: BetDirection,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let market = &mut ctx.accounts.market;

        require!(market.status == MarketStatus::Active, ErrorCode::MarketNotActive);
        require!(clock.unix_timestamp < market.end_time, ErrorCode::MarketExpired);

        let bet = &mut ctx.accounts.bet;
        bet.market = market.key();
        bet.bettor = ctx.accounts.bettor.key();
        bet.amount = bet_amount;
        bet.direction = bet_direction;
        bet.created_at = clock.unix_timestamp;
        bet.bump = ctx.bumps.bet;

        match bet_direction {
            BetDirection::Yes => {
                market.yes_pool += bet_amount;
            }
            BetDirection::No => {
                market.no_pool += bet_amount;
            }
        }
        market.total_pool += bet_amount;

        let cpi_accounts = Transfer {
            from: ctx.accounts.bettor_token_account.to_account_info(),
            to: ctx.accounts.market_token_account.to_account_info(),
            authority: ctx.accounts.bettor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, bet_amount)?;

        emit!(BetPlaced {
            market: market.key(),
            bettor: ctx.accounts.bettor.key(),
            amount: bet_amount,
            direction: bet_direction,
        });

        Ok(())
    }

    /// Resolve a prediction market
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: MarketOutcome,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;

        require!(market.status == MarketStatus::Active, ErrorCode::MarketNotActive);
        require!(clock.unix_timestamp >= market.end_time, ErrorCode::MarketNotExpired);
        require_keys_eq!(
            ctx.accounts.resolver.key(),
            BACKEND_AUTHORITY,
            ErrorCode::UnauthorizedResolver
        );

        let winning_pool = match outcome {
            MarketOutcome::Yes => market.yes_pool,
            MarketOutcome::No => market.no_pool,
        };

        market.status = if winning_pool == 0 {
            MarketStatus::Refund
        } else {
            MarketStatus::Resolved
        };
        market.outcome = Some(outcome);
        
        market.resolved_at = Some(clock.unix_timestamp);

        emit!(MarketResolved {
            market: market.key(),
            outcome,
            resolved_at: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Claim winnings from a resolved market
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &ctx.accounts.bet;

        require!(
            market.status == MarketStatus::Resolved || market.status == MarketStatus::Refund,
            ErrorCode::MarketNotResolved
        );
        require!(bet.bettor == ctx.accounts.bettor.key(), ErrorCode::UnauthorizedClaimer);

        let outcome = match &market.outcome {
            Some(outcome) => outcome,
            None => return err!(ErrorCode::MarketNotResolved),
        };

        let winnings = if market.status == MarketStatus::Refund {
            bet.amount
        } else {
            let total_winning_bets = match outcome {
                MarketOutcome::Yes => market.yes_pool,
                MarketOutcome::No => market.no_pool,
            };

            if total_winning_bets > 0
                && ((outcome == &MarketOutcome::Yes && bet.direction == BetDirection::Yes)
                    || (outcome == &MarketOutcome::No && bet.direction == BetDirection::No))
            {
                (bet.amount * market.total_pool) / total_winning_bets
            } else {
                0
            }
        };

        if winnings > 0 {
            let seeds = &[
                b"market",
                market.market_id.to_le_bytes().as_ref(),
                &[market.bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.market_token_account.to_account_info(),
                to: ctx.accounts.bettor_token_account.to_account_info(),
                authority: market.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, winnings)?;
        }

        emit!(WinningsClaimed {
            market: market.key(),
            bettor: ctx.accounts.bettor.key(),
            amount: winnings,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = creator,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), creator.key().as_ref()],
        bump
    )]
    pub creator_bet: Account<'info, Bet>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = creator
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = market
    )]
    pub market_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bettor
    )]
    pub bettor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = market
    )]
    pub market_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub resolver: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump = bet.bump,
        close = bettor
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bettor
    )]
    pub bettor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = market
    )]
    pub market_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub market_id: u64,
    pub creator: Pubkey,
    #[max_len(200)]
    pub description: String,
    pub end_time: i64,
    pub creator_stake: u64,
    pub total_pool: u64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub status: MarketStatus,
    pub outcome: Option<MarketOutcome>,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
    pub direction: BetDirection,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MarketStatus {
    Active,
    Resolved,
    Refund,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MarketOutcome {
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum BetDirection {
    Yes,
    No,
}

#[event]
pub struct MarketCreated {
    pub market_id: u64,
    pub creator: Pubkey,
    pub description: String,
    pub end_time: i64,
    pub creator_stake: u64,
}

#[event]
pub struct BetPlaced {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
    pub direction: BetDirection,
}

#[event]
pub struct MarketResolved {
    pub market: Pubkey,
    pub outcome: MarketOutcome,
    pub resolved_at: i64,
}

#[event]
pub struct WinningsClaimed {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Market has expired")]
    MarketExpired,
    #[msg("Market end time must be in the future")]
    MarketEndTimeInPast,
    #[msg("Creator stake must be greater than zero")]
    InvalidCreatorStake,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Market has not expired yet")]
    MarketNotExpired,
    #[msg("Market is not resolved")]
    MarketNotResolved,
    #[msg("Unauthorized resolver")]
    UnauthorizedResolver,
    #[msg("Unauthorized claimer")]
    UnauthorizedClaimer,
}
