# SolREM Solana Program

This package contains the on-chain Anchor program for SolREM prediction markets.

The program is intentionally small and MVP-friendly:
- creators create a market and auto-bet YES with their stake
- users place YES/NO bets
- the backend authority resolves expired markets
- claim flow pays winners and closes the bet account after payout

## Design Goals

SolREM uses a trust-based MVP model for small groups of users.

That means the program focuses on:
- simple prediction market mechanics
- clear ownership of on-chain funds
- backend-authority resolution
- predictable payout behavior

It does not try to solve high-stakes anonymous-market problems.

## Core Instructions

The program exposes four main instructions:

- `create_market` initializes a market, creates the creator bet account, and transfers the creator stake into the market vault.
- `place_bet` lets a user bet YES or NO on an active market before `end_time`.
- `resolve_market` sets the market outcome after expiry, but only the backend authority can call it.
- `claim_winnings` pays the bettor and closes the bet account so the same bet cannot be claimed twice.

## Account Model

### `Market`

Stores the on-chain state for a prediction market:

- `market_id`
- `creator`
- `description`
- `end_time`
- `creator_stake`
- `total_pool`
- `yes_pool`
- `no_pool`
- `status`
- `outcome`
- `created_at`
- `resolved_at`
- `bump`

### `Bet`

Stores a single bettor position for a specific market:

- `market`
- `bettor`
- `amount`
- `direction`
- `created_at`
- `bump`

## PDA Seeds

The program uses deterministic PDAs:

```rust
Market: seeds = [b"market", market_id]
Bet:    seeds = [b"bet", market_key, bettor_key]
```

The creator also gets a bet account when creating the market.

## Resolution Model

Resolution is backend-authority only.

The backend verifies sleep data off-chain, then calls `resolve_market` on-chain after the market expires. This is a deliberate MVP tradeoff:

- creator cannot resolve their own market
- the backend is the single source of truth for sleep outcome verification
- the program only enforces the on-chain resolution gate

## Current Invariants

The current program enforces these important rules:

- markets must have an `end_time` in the future
- creator stake must be greater than zero
- market descriptions are capped at 200 characters
- betting is only allowed while the market is active and not expired
- only the backend authority can resolve markets
- `claim_winnings` closes the bet account after payout

## Market Types

Market types are backend metadata, not on-chain state.

The smart contract stores only a generic description string. The backend decides whether a market is:

1. `sleep-duration`
2. `rem-percentage`
3. `deep-sleep`
4. `sleep-efficiency`
5. `wake-time`
6. `sleep-latency`

## Build And Test

From the `solana-program/` directory:

```bash
anchor build
anchor test
```

The main integration test file is:

- [`tests/solrem-prediction-markets.ts`](tests/solrem-prediction-markets.ts)

## Integration Notes

The on-chain program is meant to be called through the app/backend flow, not directly by users guessing raw PDAs.

Useful companion files:
- [`programs/solrem-prediction-markets/src/lib.rs`](programs/solrem-prediction-markets/src/lib.rs)
- [`tests/solrem-prediction-markets.ts`](tests/solrem-prediction-markets.ts)
- [`../backend/services/marketResolution.js`](../backend/services/marketResolution.js)
- [`../backend/routes/markets.js`](../backend/routes/markets.js)

## MVP Scope

In scope for this program:
- unauthorized resolution protection
- expired market checks
- invalid bet direction checks
- creator auto-bet behavior
- payout distribution

Not in scope for the MVP:
- minimum or maximum bet validation
- per-user bet limits
- anonymous high-stakes market protection
- anti-collusion systems
- fake sleep data detection

## Notes For Contributors

When changing this program:
- keep the trust-based MVP scope in mind
- check the backend flow before changing on-chain state
- preserve the existing account layout unless there is a strong reason not to
- prefer small, explicit invariants over broad abstractions

If you need broader product context, see the root [`README.md`](../README.md) and [`AGENTS.md`](../AGENTS.md).
