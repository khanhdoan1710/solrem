# ⚡ SUPABASE QUICK SETUP

## 🚀 STEPS:

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project: `solrem`
- Save database password

### 2. Run Migration
1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase_migration.sql`
4. Paste and click **RUN** (or Cmd+Enter)

### 3. Get API Keys
- Go to **Settings** → **API**
- Copy:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **anon public key**: `eyJhbG...`

### 4. Update .env.local
Edit `UI-zah/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_USE_MOCK_DATA=false
```

### 5. Restart Server
```bash
cd UI-zah
npm run dev
```

## ✅ VERIFY:

Open http://localhost:5173 → Browser Console should show:
```
🔌 Connection status: { supabase: true, mode: 'live' }
🔌 Fetching markets from Supabase
```

Check Supabase Dashboard → **Table Editor**:
- ✅ 5 tables created: users, sleep_records, devices, markets, user_bets
- ✅ Test data inserted (1 user, 7 sleep records, 3 markets)

---

## 📊 WHAT THE MIGRATION CREATES:

### Tables:
1. **users** - User profiles (wallet_address, username, bio, rank, points)
2. **sleep_records** - Daily sleep data (score, REM, deep, efficiency, etc.)
3. **devices** - Wearables (Garmin, WHOOP, CUDIS)
4. **markets** - Prediction markets
5. **user_bets** - User positions in markets

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Indexes for fast queries
- ✅ Triggers for auto-update timestamps
- ✅ Functions: calculate_user_streak(), update_user_ranks()
- ✅ Views: user_stats, active_markets_summary
- ✅ Test data seeded

### Security:
- Users can only see/edit their own sleep records
- Users can only manage their own devices
- Markets are public (read-only for now)
- Bets are user-scoped

---

## 🔧 TROUBLESHOOTING:

**Migration fails?**
- Check if tables already exist (drop them first if needed)
- Run migration in multiple chunks if timeout

**RLS errors in app?**
- Normal! Auth not implemented yet
- For testing: Disable RLS temporarily in Supabase Dashboard

**No data showing?**
- Check Table Editor → verify seed data exists
- Check browser console for errors
- Verify API keys in `.env.local`

---

## 📁 FILES:

- `supabase_migration.sql` ← **RUN THIS IN SUPABASE**
- `UI-zah/.env.local` ← Update with your keys
- `UI-zah/services/supabaseClient.ts` ← Client config
- `UI-zah/services/supabaseService.ts` ← Database operations

---

## ⏭️ NEXT STEPS AFTER SETUP:

1. Test wallet connection with real data
2. Implement Solana wallet adapter (Phantom/Solflare)
3. Deploy smart contract to devnet
4. Create Supabase Edge Function for Oracle
5. Implement Garmin OAuth for real sleep data

---

**Total time:** ~3 minutes ⚡
