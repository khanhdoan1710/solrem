# ⚙️ SUPABASE AUTH SETUP REQUIRED

## 🚨 **QUAN TRỌNG - PHẢI LÀM:**

Để app hoạt động, bạn **PHẢI** disable email confirmation trong Supabase Dashboard:

---

## 📋 **BƯỚC 1: Disable Email Confirmation**

### **Vào Supabase Dashboard:**
```
1. Mở: https://supabase.com/dashboard
2. Chọn project: yaztlbbttluyrxwrvvge
3. Vào: Authentication → Settings
4. Tìm: "Email" section
```

### **Tắt Email Confirmation:**
```
☑️ Enable Email Confirmations  ← BỎ TICK NÀY!

Hoặc:
- Email Templates → Confirmation → Disable
```

### **Lưu thay đổi:**
```
Click "Save" ở cuối trang
```

---

## 📋 **BƯỚC 2: (Optional) Update RLS Policies**

Nếu bạn muốn sử dụng RLS đúng cách, update policies để sử dụng `auth.uid()`:

### **SQL Migration:**
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow insert for new users" ON users;

-- Create new policies using auth.uid()
CREATE POLICY "Users can read own data" ON users
FOR SELECT
USING (
  auth.uid()::text = id::text 
  OR 
  wallet_address = (
    SELECT raw_user_meta_data->>'wallet_address' 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update own data" ON users
FOR UPDATE
USING (
  auth.uid()::text = id::text 
  OR 
  wallet_address = (
    SELECT raw_user_meta_data->>'wallet_address' 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Allow insert for authenticated users" ON users
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);
```

---

## 🔍 **TẠI SAO CẦN AUTH?**

### **Vấn đề:**
```
Anonymous client → Supabase
  ↓
RLS Policy: "Only authenticated users can INSERT"
  ↓
Error: "new row violates row-level security policy" ❌
```

### **Giải pháp:**
```
Wallet connects → Authenticate with Supabase
  ↓
Get auth session (JWT token)
  ↓
Authenticated client → Supabase
  ↓
RLS Policy: "auth.uid() IS NOT NULL" ✅
  ↓
Success! ✅
```

---

## 🔧 **CODE ĐÃ THÊM:**

### **supabaseClient.ts:**
```typescript
export async function authenticateWithWallet(walletAddress: string) {
  // Email: {wallet}@solrem.app
  // Password: wallet address (hashed by Supabase)
  const email = `${walletAddress}@solrem.app`;
  const password = walletAddress;
  
  // Try sign in
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // If no account, sign up
  if (error?.message.includes('Invalid login credentials')) {
    ({ data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { wallet_address: walletAddress },
      },
    }));
  }
  
  return data?.user ? true : false;
}
```

### **App.tsx:**
```typescript
useEffect(() => {
  if (walletConnected && walletAddress) {
    const loadUserData = async () => {
      // 1. Authenticate first ✅
      await authenticateWithWallet(walletAddress);
      
      // 2. Then load data (RLS now works)
      const profile = await getUserProfile(walletAddress);
      // ...
    };
    loadUserData();
  }
}, [walletConnected, walletAddress]);
```

---

## 📊 **FLOW MỚI:**

### **Before (Broken):**
```
Connect wallet
  ↓
Load user data
  ↓
Supabase: "Who are you?" 🤔
  ↓
Client: "Anonymous" 
  ↓
RLS: "Access denied" ❌
```

### **After (Working):**
```
Connect wallet
  ↓
Authenticate with Supabase ✅
  ↓
Get auth session (JWT)
  ↓
Load user data
  ↓
Supabase: "Who are you?" 🤔
  ↓
Client: "I'm user {auth.uid()}" ✅
  ↓
RLS: "Welcome!" ✅
```

---

## 🧪 **TEST:**

### **After disabling email confirmation:**
```bash
1. Restart dev server:
   cd UI-zah
   npm run dev

2. Click "Connect Wallet"
3. Select Phantom
4. Connect

Expected console logs:
🔐 Authenticating with Supabase...
✅ Authenticated with Supabase: {user_id}
📊 Loading user profile...
✅ User profile loaded!
```

### **Check Supabase Dashboard:**
```
1. Go to: Authentication → Users
2. You should see: {wallet}@solrem.app
3. Status: Confirmed ✅
```

---

## ⚠️ **COMMON ISSUES:**

### **Issue 1: Email confirmation not disabled**
```
Error: "Email not confirmed"
Solution: Disable email confirmation in dashboard
```

### **Issue 2: RLS still blocking**
```
Error: "new row violates row-level security policy"
Solution: 
  - Check auth session exists: supabase.auth.getSession()
  - Update RLS policies to use auth.uid()
```

### **Issue 3: Sign up fails**
```
Error: "User already exists"
Solution: Sign in instead of sign up (code handles this automatically)
```

---

## 📝 **SUMMARY:**

```
✅ Added: authenticateWithWallet()
✅ Called: Before loading user data
✅ Required: Disable email confirmation in dashboard
✅ Result: RLS policies work correctly
```

---

## 🔗 **LINKS:**

- **Supabase Dashboard:** https://supabase.com/dashboard/project/yaztlbbttluyrxwrvvge
- **Auth Settings:** https://supabase.com/dashboard/project/yaztlbbttluyrxwrvvge/auth/settings
- **Users:** https://supabase.com/dashboard/project/yaztlbbttluyrxwrvvge/auth/users

---

## 🚀 **NEXT STEPS:**

1. **Disable email confirmation** (required!)
2. **Test connection flow**
3. **Check user created in dashboard**
4. **Verify data loads correctly**

---

**Status:** ✅ Code fixed, awaiting dashboard config  
**Action Required:** Disable email confirmation in Supabase  
**Then:** Test connection flow! 🚀
