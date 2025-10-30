# SolREM

SolREM is a sleep-first product that:
- Ingests sleep data from devices (Garmin, CUDIS, WHOOP).
- Scores nightly sleep (Proof of REM points) using a research-backed sleep scoring engine.
- Provides prediction markets where users create and bet on sleep outcomes using SOL or USDC.
- Aggregates curated resources (articles, videos, research) to help users improve sleep.

Why SolREM
- Incentivizes better sleep with points and social wagering.
- Automates market settlement using device data.
- Bridges consumer sleep telemetry with decentralised prediction markets.

Key features
- Nightly sleep scoring and points: see [`SleepScoringService.calculateSleepScore`](backend/services/sleepScoring.js) and [backend/services/sleepScoring.js](backend/services/sleepScoring.js).
- Prediction markets (create/place/resolve/claim): client hooks in [src/services/SolanaService.ts](src/services/SolanaService.ts) — e.g. [`SolanaService.createMarket`](src/services/SolanaService.ts), [`SolanaService.placeBet`](src/services/SolanaService.ts), [`SolanaService.resolveMarket`](src/services/SolanaService.ts), [`SolanaService.claimWinnings`](src/services/SolanaService.ts).
- Automatic market resolution service: see [`MarketResolutionService.resolveMarkets`](backend/services/marketResolution.js) and [backend/services/marketResolution.js](backend/services/marketResolution.js).
- Mobile app screens: dashboard, markets, create market, market details — see [src/screens/DashboardScreen.tsx](src/screens/DashboardScreen.tsx), [src/screens/MarketsScreen.tsx](src/screens/MarketsScreen.tsx), [src/screens/CreateMarketScreen.tsx](src/screens/CreateMarketScreen.tsx), [src/screens/MarketDetailsScreen.tsx](src/screens/MarketDetailsScreen.tsx).
- On-chain program (Anchor / Solana) that manages markets, bets and payouts: [solana-program/programs/solrem-prediction-markets/src/lib.rs](solana-program/programs/solrem-prediction-markets/src/lib.rs) (functions: `create_market`, `place_bet`, `resolve_market`, `claim_winnings`).

Getting started (local dev)
1. Backend
   - Open [backend/README.md](backend/README.md) for backend-specific setup.
   - Install and run:
     ```sh
     cd backend
     npm install
     cp .env.example .env
     # edit .env (MONGODB_URI, GARMIN_* keys if testing integrations)
     npm run dev
     ```
   - Backend entry: [backend/server.js](backend/server.js).

2. Mobile app (React Native)
   - Install JS dependencies at repo root or in app folder as appropriate.
   - Run Metro and build for simulator/device per React Native docs.

3. UI (Next.js)
   - UI v0 app lives in `UI v0/` — build and preview with Next.js commands.

4. Solana program (optional / local validator)
   - Build & test Anchor program:
     ```sh
     cd solana-program
     anchor build
     anchor test
     ```
   - Program source: [solana-program/programs/solrem-prediction-markets/src/lib.rs](solana-program/programs/solrem-prediction-markets/src/lib.rs)

API overview (important endpoints)
- GET /api/health — health check ([backend/server.js](backend/server.js))
- GET /api/sleep/user/:userId/data — user sleep and points ([backend/routes/sleep.js](backend/routes/sleep.js))
- POST /api/garmin/sync-sleep/:userId — simulate Garmin sync ([backend/routes/garmin.js](backend/routes/garmin.js))
- GET /api/markets/active — list markets ([backend/routes/markets.js](backend/routes/markets.js))
- POST /api/markets/create, /api/markets/bet, /api/markets/resolve — market lifecycle endpoints ([backend/routes/markets.js](backend/routes/markets.js))

Architecture (high level)
- Devices -> Backend ingestion (Garmin route / simulated) -> Sleep scoring engine ([backend/services/sleepScoring.js](backend/services/sleepScoring.js)) -> SleepRecord model -> Dashboard + Markets resolution ([backend/services/marketResolution.js](backend/services/marketResolution.js)).
- Markets interact with Solana via front-end service [src/services/SolanaService.ts](src/services/SolanaService.ts) and on-chain Anchor program [solana-program/.../lib.rs](solana-program/programs/solrem-prediction-markets/src/lib.rs).

Development notes
- Scoring weights and formulas live in [backend/services/sleepScoring.js](backend/services/sleepScoring.js). Adjust weights or thresholds used in [`SleepScoringService.calculateSleepScore`](backend/services/sleepScoring.js) to tune behavior.
- Market resolution logic is in [backend/services/marketResolution.js](backend/services/marketResolution.js). Unit-test edge cases for timezones and missing sleep data.
- Front-end mock Solana methods (in [src/services/SolanaService.ts](src/services/SolanaService.ts)) emulate transactions — replace with real RPC / wallet integration for production.

Testing
- Backend: run unit/integration tests (see [backend/README.md](backend/README.md)).
- Solana program: run Anchor tests in [solana-program/tests/solrem-prediction-markets.ts](solana-program/tests/solrem-prediction-markets.ts).

Deployment
- Backend: Node.js app (Docker or managed hosting). Ensure MONGODB_URI and Garmin keys are set.
- Frontend (Next.js): static or server rendering depending on routing — test build locally before pushing.
- Solana: deploy Anchor program to desired cluster and update program ID in services.

Resources & links
- Backend README: [backend/README.md](backend/README.md)
- Sleep scoring service: [backend/services/sleepScoring.js](backend/services/sleepScoring.js) (`SleepScoringService.calculateSleepScore`)
- Market resolution service: [backend/services/marketResolution.js](backend/services/marketResolution.js) (`MarketResolutionService.resolveMarkets`)
- Client Solana service: [src/services/SolanaService.ts](src/services/SolanaService.ts) (`SolanaService.createMarket`, `SolanaService.placeBet`, `SolanaService.resolveMarket`, `SolanaService.claimWinnings`)
- On-chain program: [solana-program/programs/solrem-prediction-markets/src/lib.rs](solana-program/programs/solrem-prediction-markets/src/lib.rs)

Contributing
- Open issues for feature requests or bugs.
- Follow existing code style and tests.
- Document scoring or market rule changes clearly.

License
- Add a LICENSE file as needed. 