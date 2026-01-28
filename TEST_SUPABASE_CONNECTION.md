# ✅ TEST SUPABASE CONNECTION

## 🚀 SERVER RUNNING:

**URL:** http://localhost:5173  
**Status:** ✅ Started with Supabase config  
**Mode:** LIVE DATA (VITE_USE_MOCK_DATA=false)

---

## 📋 TEST CHECKLIST:

### 1. Open Browser & Check Console ✅

```bash
# Open in browser
open http://localhost:5173
```

**Press F12 (DevTools) → Console**

**✅ Success logs should show:**
```
🔌 Connection status: { supabase: true, mode: 'live' }
🔌 Fetching markets from Supabase
```

**❌ If you see error:**
```
Supabase connection failed: [error]
```
→ Check Supabase Dashboard → API keys correct

---

### 2. Test Landing Page ✅

**Expected:**
- ✅ "SolREM" logo displays
- ✅ "Connect Wallet" button visible
- ✅ "Enter as Guest" button visible
- ✅ No console errors

**Action:**
- Click **"Connect Wallet"**
- Select **"Phantom"**

---

### 3. Test Dashboard ✅

**After connecting wallet:**

**Expected to see:**
- ✅ Sleep score ring (from Supabase data)
- ✅ 6 metric cards (REM, Deep, Efficiency, etc.)
- ✅ 7-day sleep chart
- ✅ AI Analysis panel

**Check Console:**
```
🔌 Fetching user profile from Supabase
🔌 Fetching sleep history from Supabase
🔌 Fetching devices from Supabase
```

**If data shows:**
- **Score 94** → ✅ Real data from Supabase
- **Score 0** → ⚠️ No data, check migration

---

### 4. Test Markets Tab ✅

**Navigate to Markets:**

**Expected:**
- ✅ Shows 3 markets (from Supabase)
- ✅ "Will you get > 25% REM sleep tonight?"
- ✅ "Global Sleep Score > 80 average?"
- ✅ "User @sleep_king > 8h duration?"

**Console:**
```
🔌 Fetching markets from Supabase
```

**Test bet placement:**
- Click a market
- Adjust bet amount
- Click "Place Order"
- ✅ Should save to Supabase

---

### 5. Verify Supabase Dashboard ✅

**Open Supabase Dashboard:**

**Table Editor → Check tables:**

1. **`users` table:**
   - ✅ Should have 1 row: `SolSleeper` (wallet: `8x72...3f29`)

2. **`sleep_records` table:**
   - ✅ Should have 7 rows (last 7 days)
   - ✅ Dates: today, yesterday, -2 days, etc.

3. **`markets` table:**
   - ✅ Should have 3 rows
   - ✅ Status: `active`

4. **`devices` table:**
   - ✅ Should have 1 row: `Garmin Fenix 7`
   - ✅ Connected: `true`

5. **`user_bets` table:**
   - ✅ Empty initially
   - ✅ After placing bet → should have rows

**Views (no warnings):**
- ✅ `user_stats` - secured
- ✅ `active_markets_summary` - secured

---

## 🔍 TROUBLESHOOTING:

### Console shows "📦 Using MOCK data"

**Problem:** Still using mock despite Supabase config

**Fix:**
```bash
# Check .env.local
cat UI-zah/.env.local
# Should have:
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Restart server
pkill -f vite && npm run dev
```

---

### Console shows "Supabase connection failed"

**Problem:** API keys wrong or Supabase down

**Fix:**
1. Check Supabase Dashboard → Settings → API
2. Verify URL and anon key match `.env.local`
3. Test connection: https://yaztlbbttluyrxwrvvge.supabase.co
4. Check Supabase status: status.supabase.com

---

### Dashboard shows "Score: 0" or empty data

**Problem:** Migration didn't seed test data

**Fix:**
1. Supabase Dashboard → SQL Editor
2. Run seed data section from migration:
```sql
-- Get test user ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE wallet_address = '8x72...3f29';
  
  -- Insert 7 days of sleep data
  INSERT INTO sleep_records (user_id, date, score, rem_score, deep_score, efficiency, duration_hours, latency_minutes, waso_minutes)
  VALUES 
    (test_user_id, CURRENT_DATE, 94, 96, 88, 96, 8.5, 5, 10)
  ON CONFLICT DO NOTHING;
END $$;
```

---

### Views still showing "unrestricted"

**Problem:** `supabase_fix_views_rls.sql` not run

**Fix:**
1. Supabase Dashboard → SQL Editor
2. Copy entire `supabase_fix_views_rls.sql`
3. Click RUN
4. Refresh Table Editor → Views

---

## ✅ SUCCESS CRITERIA:

You're successfully connected when:

1. ✅ Console shows `🔌 Fetching from Supabase`
2. ✅ Dashboard displays sleep score **94**
3. ✅ Markets tab shows **3 markets**
4. ✅ Supabase Table Editor shows data
5. ✅ No "unrestricted" warnings on views
6. ✅ Can place bets and see them saved

---

## 📊 QUICK DATA VERIFICATION:

**Run in Supabase SQL Editor:**

```sql
-- Check user exists
SELECT username, wallet_address, total_rem_points 
FROM users;

-- Check sleep records count
SELECT COUNT(*) as sleep_records 
FROM sleep_records;

-- Check markets
SELECT question, category, status 
FROM markets;

-- Check views work
SELECT * FROM user_stats;
SELECT * FROM active_markets_summary;
```

**Expected output:**
```
username    | wallet_address | total_rem_points
------------|----------------|------------------
SolSleeper  | 8x72...3f29   | 3450

sleep_records: 7
markets: 3
```

---

## 🎯 WHAT TO DO NOW:

### Option 1: Full Test Flow ✅
```bash
# 1. Open browser
open http://localhost:5173

# 2. Connect wallet (mock: 8x72...3f29)
# 3. Check dashboard shows data
# 4. Navigate all tabs
# 5. Place a test bet
# 6. Verify in Supabase Table Editor
```

### Option 2: Quick Smoke Test ✅
```bash
# Just check console logs
open http://localhost:5173
# Press F12
# Look for: 🔌 Fetching from Supabase
```

### Option 3: Data Integrity Check ✅
```bash
# Verify Supabase data matches UI
# Supabase Dashboard → Table Editor
# Compare with browser display
```

---

## 🔥 NEXT STEPS AFTER VERIFICATION:

Once connection is confirmed:

1. **Real Wallet Integration**
   - Install `@solana/wallet-adapter-react`
   - Replace mock wallet with Phantom/Solflare
   - Test signing transactions

2. **Deploy Smart Contract**
   - Build Anchor program
   - Deploy to devnet
   - Update `VITE_PROGRAM_ID`

3. **Implement Real Features**
   - Place real bets on-chain
   - Settle markets with Oracle
   - Sync actual wearable data

---

**Current Status:** ✅ Server running  
**Your Action:** Open http://localhost:5173 and test!
