# 🔒 FIX: Views RLS Issue

## ❌ VẤN ĐỀ:

Supabase Dashboard hiển thị warning:
- ⚠️ `user_stats` - **unrestricted**
- ⚠️ `active_markets_summary` - **unrestricted**

**Nguyên nhân:** Views không tự động kế thừa RLS policies từ base tables!

---

## ✅ GIẢI PHÁP:

Run file: **`supabase_fix_views_rls.sql`**

### Cách 1: SECURITY INVOKER Views (Đã Fix)
Views giờ sẽ respect RLS của base tables

### Cách 2: Secure Functions (Backup)
Nếu views vẫn unrestricted, dùng functions thay thế:
- `get_user_stats(user_id)` 
- `get_active_markets_summary()`

---

## 🚀 CÁCH RUN:

1. Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ `supabase_fix_views_rls.sql`
4. Click **RUN**

---

## 🔍 VERIFY:

### Check 1: Views không còn warning
Supabase Dashboard → **Table Editor** → Views tab
- ✅ `user_stats` - Secured
- ✅ `active_markets_summary` - Secured

### Check 2: Test Query
Run trong SQL Editor:
```sql
-- Test user_stats
SELECT * FROM user_stats;

-- Test active_markets_summary  
SELECT * FROM active_markets_summary;

-- Test functions (nếu dùng)
SELECT * FROM get_user_stats(NULL);
SELECT * FROM get_active_markets_summary();
```

**Expected:** Chỉ thấy data mà user có quyền truy cập

---

## 📝 THAY ĐỔI:

### Before (Unsafe):
```sql
CREATE VIEW user_stats AS
SELECT ...
-- No RLS enforcement!
```

### After (Safe):
```sql
CREATE VIEW user_stats 
WITH (security_invoker = true)
AS SELECT ...
-- Respects RLS của base tables ✅
```

---

## 🔧 NẾU VẪN UNRESTRICTED:

Dùng functions thay vì views trong code:

**In `supabaseService.ts`:**

```typescript
// Old (using view)
const { data } = await supabase
  .from('user_stats')
  .select('*');

// New (using function)
const { data } = await supabase
  .rpc('get_user_stats', { p_user_id: null });
```

---

## 🎯 KẾT QUẢ:

✅ Views giờ secure với RLS
✅ Functions cung cấp alternative an toàn
✅ Không còn warning trong Dashboard
✅ Data được bảo vệ đúng policies

---

**Run ngay:** `supabase_fix_views_rls.sql` trong Supabase SQL Editor!
