# SOLREM - KIEN TRUC VA TONG KET DU AN

## 1) Tac dung app (business purpose)
SolREM la app "sleep-to-earn + prediction market":
- Thu thap du lieu ngu (Garmin/Whoop/CUDIS).
- Tinh diem chat luong ngu (Proof of REM).
- Tao va giao dich cac market du doan ket qua giac ngu (YES/NO, SOL).
- Tu dong resolve market dua tren du lieu sleep (oracle flow).
- Cung cap resource giao duc ve sleep.

## 2) Kien truc tong the (hien trang)
Repo hien la multi-part system, gom 4 khoi lon:

1. Frontend Web (dang la phan chay chinh)
- Thu muc: `UI-zah/`
- Tech: React 19 + TypeScript + Vite + Tailwind (CDN config) + Solana Wallet Adapter + Supabase JS.
- Vai tro: UX chinh (Onboarding, Dashboard, Markets, Leaderboard, Device, Resources, Profile).
- Data: lay truc tiep tu Supabase qua `services/dataLoader.ts` + `supabaseService.ts`.

2. Backend API (Node/Express - dang ton tai song song)
- Thu muc: `backend/`
- Tech: Node.js, Express, MongoDB/Mongoose, cron, JWT deps, Solana web3 deps.
- Vai tro: auth/user/sleep/garmin/markets API + sleep scoring service + market resolution scheduler.
- Hien trang: nhieu endpoint va Solana call van o dang mock/placeholder.

3. On-chain Program (Solana Anchor)
- Thu muc: `solana-program/`
- Tech: Rust + Anchor + SPL Token.
- Vai tro: create_market, place_bet, resolve_market, claim_winnings.
- Hien trang: co code contract va test skeleton, nhung integration voi web/backend chua hoan tat.

4. Mobile app React Native (legacy scaffold)
- Thu muc: `android/`, `ios/`, `src/`
- Tech: React Native native shells + TS screen code.
- Hien trang: co man hinh va service rieng, nhung root JS app config/package hien khong day du, endpoint mapping cung khong dong bo backend chinh.

## 3) Thanh phan app (theo module)
### A. Web app UI-zah
- Entry: `UI-zah/index.tsx`, `UI-zah/App.tsx`
- Components:
  - `components/ScoreRing.tsx`
  - `components/SleepChart.tsx`
  - `components/WalletModal.tsx`
- Services:
  - `services/supabaseClient.ts`: init Supabase + wallet-based auth workaround.
  - `services/supabaseService.ts`: users/sleep_records/devices/markets/user_bets CRUD.
  - `services/dataLoader.ts`: facade cho data (hien dang live Supabase, resource van mock).
  - `services/walletService.ts`: balance/transaction helper web3.
  - `services/solanaService.ts`: co structure, nhung instruction program chua implement day du.
- Domain models: `types.ts`
- Mock backup: `constants.mock.ts`

### B. Backend
- Entry: `backend/server.js`
- Routes:
  - `routes/auth.js`
  - `routes/users.js`
  - `routes/sleep.js`
  - `routes/garmin.js`
  - `routes/markets.js`
- Services:
  - `services/sleepScoring.js` (formula weighted score)
  - `services/marketResolution.js` (cron + resolve logic, dang mock expired markets)
  - `services/solanaService.js` (dang mock tx/query)
- Models:
  - `models/User.js`
  - `models/SleepRecord.js`

### C. On-chain program
- Program source: `solana-program/programs/solrem-prediction-markets/src/lib.rs`
- Accounts:
  - `Market`
  - `Bet`
- Instructions:
  - `create_market`
  - `place_bet`
  - `resolve_market`
  - `claim_winnings`
- Test: `solana-program/tests/solrem-prediction-markets.ts`

### D. Data schema
- SQL migration da co san: `supabase_migration.sql`
- Bang chinh:
  - `users`
  - `sleep_records`
  - `devices`
  - `markets`
  - `user_bets`
- Co RLS policy, views va seed script.

## 4) Luong du lieu (as-is)
### Luong web hien tai (dang su dung)
Wallet connect -> Supabase auth (`authenticateWithWallet`) -> UI load profile/sleep/devices/markets/bets tu Supabase -> user place bet -> ghi `user_bets` (hien dang `mock_tx_signature`).

### Luong backend (co code nhung chua la duong chinh cua web)
Device data (mock Garmin) -> sleep scoring -> luu MongoDB -> cron job resolve market (logic service) -> Solana service (dang mock).

## 5) Nhung thu can build tiep (uu tien cao)
1. Chot "single source of truth" cho backend data
- Hien co 2 huong song song: Supabase (web) va Mongo/Express (backend).
- Can quyet dinh architecture chinh (khuyen nghi: Supabase + service layer, hoac backend API thuong truc) de tranh split logic.

2. Hoan thien giao dich on-chain that su
- UI `handlePlaceBet` hien ghi DB voi `mock_tx_signature`.
- Can call instruction Anchor that (`place_bet`, `claim_winnings`, `resolve_market`) va verify tx signature.
- Can mapping market DB <-> PDA on-chain (`on_chain_address`).

3. Oracle/Resolution service production
- Lay du lieu tu Garmin/Whoop/CUDIS that.
- Validate identity + data integrity.
- Ky giao dich resolver bang key quan tri an toan (khong hardcode).
- Dong bo ket qua resolve vao ca chain va database.

4. Auth wallet dung chuan
- Hien dang auth Supabase bang email/password sinh tu wallet address.
- Can chuyen sang challenge-signature login (SIWS style) + mapping user identity ro rang.

5. Hoan thien backend markets layer
- `backend/routes/markets.js` va `backend/services/solanaService.js` con nhieu placeholder.
- Can implement read/write that, retries, idempotency, failure handling.

6. Testing + CI
- Unit test cho scoring, market resolution, supabase service.
- Integration test web <-> DB <-> chain.
- Anchor test can fix seed derivation consistency (hien co nguy co mismatch seed trong test).

7. Mobile direction
- Neu tiep tuc mobile native: can phuc hoi root RN app setup day du va dong bo endpoint/data model.
- Neu khong dung nua: tach mobile thanh repo khac hoac danh dau archived de tranh nhiu.

## 6) Tech stack (thuc te trong repo)
### Frontend Web
- React 19
- TypeScript
- Vite
- Tailwind CSS (CDN config + custom CSS)
- Recharts
- Lucide icons
- Solana wallet adapter libs
- @solana/web3.js
- Supabase JS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- node-cron
- Axios
- JWT/Bcrypt deps
- @solana/web3.js + @solana/spl-token deps

### Blockchain
- Rust
- Anchor framework
- SPL Token program

### Mobile
- React Native (Android/iOS native projects scaffold)
- react-native-paper

## 7) Build/Run matrix
### Web UI-zah
- `cd UI-zah`
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

Can env:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SOLANA_NETWORK`
- `VITE_SOLANA_RPC_URL` (optional)
- `VITE_PROGRAM_ID`

### Backend
- `cd backend`
- `npm install`
- `npm run dev` (hoac `npm start`)

Can env (theo code/docs):
- `PORT`
- `MONGODB_URI`
- `GARMIN_CLIENT_ID`
- `GARMIN_CLIENT_SECRET`
- `GARMIN_REDIRECT_URI`

### Solana program
- `cd solana-program`
- `anchor build`
- `anchor test`

Can setup local Solana + Anchor CLI + wallet file.

## 8) Danh gia nhanh maturity
- UI web: co the demo duoc, UX da day du tab flow.
- Data layer: Supabase schema kha day du.
- On-chain: co contract khung, can integration thuc te.
- Backend: co service skeleton tot, nhung chua production-ready.
- Toan he thong: dang giai doan prototype/transition, chua hop nhat 1 architecture final.
