# 🚀 SUPABASE SETUP GUIDE

## STEP 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Login (use GitHub for fast login)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `solrem`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (512MB database)
5. Wait 2-3 minutes for project to provision

---

## STEP 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string)

3. Update `UI-zah/.env.local`:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

---

## STEP 3: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy & paste the SQL below
4. Click **RUN** (or press Cmd+Enter)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  rank INTEGER DEFAULT 999,
  total_rem_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep Records Table
CREATE TABLE sleep_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  rem_score INTEGER NOT NULL,
  deep_score INTEGER NOT NULL,
  efficiency INTEGER NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  latency_minutes INTEGER NOT NULL,
  waso_minutes INTEGER NOT NULL,
  raw_data JSONB,
  device_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Devices Table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('GARMIN', 'WHOOP', 'CUDIS')),
  connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ,
  battery_level INTEGER,
  access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Markets Table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Personal', 'Global', 'Challenge')),
  ends_at TIMESTAMPTZ NOT NULL,
  pool_size DECIMAL(10,2) DEFAULT 0,
  liquidity DECIMAL(10,2) DEFAULT 0,
  yes_percent INTEGER DEFAULT 50,
  no_percent INTEGER DEFAULT 50,
  volume DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  on_chain_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Bets Table
CREATE TABLE user_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('YES', 'NO')),
  entry_price INTEGER NOT NULL,
  potential_payout DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'WON', 'LOST')),
  transaction_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sleep_records_user_date ON sleep_records(user_id, date DESC);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_markets_status ON markets(status, ends_at);
CREATE INDEX idx_user_bets_user ON user_bets(user_id);
CREATE INDEX idx_user_bets_market ON user_bets(market_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bets ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can read, users can update their own data
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Sleep Records: Users can only see their own
CREATE POLICY "Users can view own sleep records" ON sleep_records FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own sleep records" ON sleep_records FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Devices: Users can only see their own
CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can manage own devices" ON devices FOR ALL USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Markets: Public read, admin write (for now)
CREATE POLICY "Markets are viewable by everyone" ON markets FOR SELECT USING (true);

-- User Bets: Users can view their own bets
CREATE POLICY "Users can view own bets" ON user_bets FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own bets" ON user_bets FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## STEP 4: Seed Mock Data (Optional - for testing)

```sql
-- Insert test user
INSERT INTO users (wallet_address, username, bio, rank, total_rem_points)
VALUES ('8x72...3f29', 'SolSleeper', 'Hacking sleep cycles 🌙 | REM Chaser', 42, 3450);

-- Get user ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE wallet_address = '8x72...3f29';
  
  -- Insert 7 days of sleep data
  INSERT INTO sleep_records (user_id, date, score, rem_score, deep_score, efficiency, duration_hours, latency_minutes, waso_minutes)
  VALUES 
    (test_user_id, CURRENT_DATE - 6, 72, 65, 70, 85, 6.5, 15, 45),
    (test_user_id, CURRENT_DATE - 5, 68, 60, 65, 82, 6.2, 20, 50),
    (test_user_id, CURRENT_DATE - 4, 85, 88, 80, 92, 7.8, 10, 20),
    (test_user_id, CURRENT_DATE - 3, 78, 75, 72, 88, 7.0, 12, 30),
    (test_user_id, CURRENT_DATE - 2, 91, 94, 85, 95, 8.2, 8, 15),
    (test_user_id, CURRENT_DATE - 1, 88, 85, 82, 90, 7.9, 25, 25),
    (test_user_id, CURRENT_DATE, 94, 96, 88, 96, 8.5, 5, 10);
  
  -- Insert test device
  INSERT INTO devices (user_id, name, type, connected, battery_level)
  VALUES (test_user_id, 'Garmin Fenix 7', 'GARMIN', true, 78);
  
  -- Insert test markets
  INSERT INTO markets (question, description, rules, category, ends_at, pool_size, liquidity, yes_percent, no_percent, volume)
  VALUES 
    ('Will you get > 25% REM sleep tonight?', 
     'Based on your wearable data. REM sleep is crucial for memory consolidation.',
     'Market resolves to YES if REM > 25%',
     'Personal',
     NOW() + INTERVAL '12 hours',
     145.2, 4500, 45, 55, 1200),
    ('Global Sleep Score > 80 average?',
     'Predicting the average sleep quality of entire SolREM userbase.',
     'Resolves YES if avg sleep score > 80',
     'Global',
     NOW() + INTERVAL '6 hours',
     520.5, 12000, 62, 38, 5400);
END $$;
```

---

## STEP 5: Verify Setup

Run this query to check data:

```sql
SELECT 
  u.username,
  COUNT(sr.id) as sleep_records_count,
  COUNT(d.id) as devices_count
FROM users u
LEFT JOIN sleep_records sr ON u.id = sr.user_id
LEFT JOIN devices d ON u.id = d.user_id
GROUP BY u.id, u.username;
```

You should see:
```
username     | sleep_records_count | devices_count
-------------|---------------------|---------------
SolSleeper   | 7                   | 1
```

---

## ✅ DONE!

Now your Supabase is ready. Next steps:
1. Copy your API keys to `UI-zah/.env.local`
2. Run `npm run dev` in UI-zah folder
3. Check console for Supabase connection

---

## 🔧 Troubleshooting

**Error: "Invalid API key"**
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing .env

**Error: "Row Level Security policy violation"**
- RLS is enabled. You need to authenticate first (we'll implement wallet auth next)

**Can't see data in UI:**
- Check Supabase dashboard → Table Editor → verify data exists
- Check browser console for errors
