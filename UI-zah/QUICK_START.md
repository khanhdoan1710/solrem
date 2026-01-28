# 🚀 QUICK START GUIDE

## ✅ DONE SO FAR:

1. ✅ Installed Supabase client (`@supabase/supabase-js`)
2. ✅ Created database schema (see `../SUPABASE_SETUP.md`)
3. ✅ Created `supabaseService.ts` - Database operations
4. ✅ Created `dataLoader.ts` - Smart data loader (mock ↔ Supabase)
5. ✅ Updated `App.tsx` - Removed all MOCK_* imports
6. ✅ Backed up mock data to `constants.mock.ts`

---

## 📋 WHAT YOU NEED TO DO:

### OPTION 1: Test with Mock Data First (Fastest)

```bash
cd UI-zah
npm run dev
```

Your app will run on `http://localhost:5173` using **mock data** (because `VITE_USE_MOCK_DATA=false` but no Supabase configured yet).

---

### OPTION 2: Setup Supabase (Recommended)

#### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create new project:
   - Name: `solrem`
   - Choose closest region
   - Save database password!
3. Wait 2-3 minutes for provisioning

#### Step 2: Get API Keys

1. In Supabase dashboard: **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`

#### Step 3: Update `.env.local`

Edit `UI-zah/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK_DATA=false
```

#### Step 4: Run Database Migration

1. In Supabase dashboard: **SQL Editor** → **New Query**
2. Open `../SUPABASE_SETUP.md`
3. Copy the entire SQL schema (Step 3)
4. Paste in SQL Editor and click **RUN**
5. (Optional) Run seed data (Step 4) for test data

#### Step 5: Start Dev Server

```bash
npm run dev
```

Open http://localhost:5173 and check browser console:

- **"🔌 Connection status: { supabase: true, mode: 'live' }"** = SUCCESS!
- **"🔌 Fetching sleep data from Supabase"** = Using real database
- **"📦 Using MOCK sleep data"** = Fallback to mock data

---

## 🔍 HOW TO VERIFY IT'S WORKING:

### 1. Check Connection

Open browser DevTools → Console. You should see:

```
🔌 Connection status: { supabase: true, mode: 'live' }
🔌 Fetching markets from Supabase
🔌 Fetching sleep data from Supabase
```

### 2. Check Database

In Supabase Dashboard:
- Go to **Table Editor**
- Check tables: `users`, `sleep_records`, `markets`, `devices`
- Verify data exists (if you ran seed script)

### 3. Connect Wallet

1. Click "Connect Wallet" on landing page
2. Select any wallet (it's simulated for now)
3. Check console for:
   ```
   🔌 Fetching user profile from Supabase
   🔌 Fetching sleep history from Supabase
   ```

---

## 🐛 TROUBLESHOOTING:

### "Missing Supabase environment variables"

**Fix:** Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.  
**Tip:** Restart dev server after changing `.env.local`

### "📦 Using MOCK data" (but you want real data)

**Fix:** Set `VITE_USE_MOCK_DATA=false` in `.env.local`

### "Row Level Security policy violation"

**Fix:** This is normal! RLS is enabled. We'll implement proper auth later.  
**Workaround:** Check Supabase SQL includes the RLS policies from `SUPABASE_SETUP.md`

### No data showing after connecting wallet

1. Check if seed data was inserted (Supabase → Table Editor)
2. Check browser console for errors
3. Verify user exists with wallet address `8x72...3f29`

---

## 📁 PROJECT STRUCTURE:

```
UI-zah/
├── .env.local               # ← YOU EDIT THIS
├── services/
│   ├── supabaseClient.ts    # Supabase connection
│   ├── supabaseService.ts   # Database operations
│   ├── dataLoader.ts        # Smart loader (mock ↔ real)
│   ├── apiService.ts        # (Old, not used)
│   └── geminiService.ts     # AI insights
├── constants.mock.ts        # Backup mock data
├── App.tsx                  # ✅ Updated (no more MOCK imports!)
└── types.ts
```

---

## 🎯 NEXT STEPS:

After Supabase works:

1. **Real Wallet Connection** (Phantom/Solflare SDK)
2. **Deploy Smart Contract** to Solana devnet
3. **Implement Garmin OAuth** for real sleep data
4. **Create Edge Function** for Oracle service

---

## 🆘 NEED HELP?

Check files:
- `../SUPABASE_SETUP.md` - Full database setup guide
- `services/supabaseService.ts` - See all available functions
- `services/dataLoader.ts` - Understand data flow

Console logs:
- `🔌` = Supabase query
- `📦` = Mock data fallback
