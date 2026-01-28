# 🔍 WALLET CONNECT ERROR - DEBUG

## ❓ CẦN THÔNG TIN:

**User báo:** "Connect wallet bị lỗi"

**Cần biết:**
1. Error message cụ thể là gì?
2. Xuất hiện ở đâu? (console, UI, modal)
3. Lúc nào xảy ra? (click button, sau khi chọn wallet, etc.)

---

## 🧪 CÁCH CHECK LỖI:

### 1. Mở Console (F12):
```bash
# In browser:
F12 → Console tab
```

**Tìm errors màu đỏ:**
- `TypeError: ...`
- `Cannot read property ...`
- `useWalletModal is not defined`
- `setVisible is not a function`

---

### 2. Check Network Tab:
```bash
F12 → Network tab → Click "Connect Wallet"
```

**Tìm:**
- Failed requests (màu đỏ)
- 404 errors
- RPC connection errors

---

### 3. Check Steps:

**Step 1:** Reload page
- Landing page có hiện không? ✅/❌

**Step 2:** Click "CONNECT WALLET"
- Modal có mở không? ✅/❌
- Nếu không mở → Check console error

**Step 3:** Chọn wallet (Phantom/Solflare)
- Phantom extension có mở không? ✅/❌
- Có popup approve không? ✅/❌

**Step 4:** Approve connection
- Có chuyển sang dashboard không? ✅/❌
- Wallet address có hiện không? ✅/❌

---

## 🔥 COMMON ERRORS & FIXES:

### Error 1: "useWalletModal is not defined"
**Nguyên nhân:** WalletModalProvider chưa wrap App

**Fix:**
```typescript
// Check index.tsx has:
<WalletModalProvider>
  <App />
</WalletModalProvider>
```

---

### Error 2: "setVisible is not a function"
**Nguyên nhân:** Import sai hook

**Fix:**
```typescript
// In App.tsx:
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
const { setVisible } = useWalletModal();
```

---

### Error 3: "Phantom not installed"
**Nguyên nhân:** Browser extension chưa có

**Fix:**
1. Install Phantom: https://phantom.app/
2. Reload page
3. Try again

---

### Error 4: CSS not loaded / Modal looks broken
**Nguyên nhân:** Wallet adapter CSS chưa import

**Fix:**
```typescript
// In index.tsx:
import '@solana/wallet-adapter-react-ui/styles.css';
```

---

### Error 5: RPC connection error
**Nguyên nhân:** Devnet RPC down hoặc chậm

**Fix:**
```typescript
// Try different RPC in .env.local:
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
# OR
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com
```

---

### Error 6: "Cannot connect to wallet"
**Nguyên nhân:** Wallet adapter version conflict

**Fix:**
```bash
npm install @solana/wallet-adapter-react@latest
npm install @solana/wallet-adapter-react-ui@latest
npm install @solana/wallet-adapter-wallets@latest
```

---

## 🛠️ QUICK FIXES TO TRY:

### Fix 1: Clear cache & rebuild
```bash
rm -rf node_modules/.vite
npm run dev
```

### Fix 2: Reinstall wallet packages
```bash
npm uninstall @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

### Fix 3: Check browser console
```javascript
// Type in console:
window.phantom
window.solana
// Should return objects if Phantom installed
```

### Fix 4: Disable browser extensions
- Temporarily disable other wallet extensions
- Only keep Phantom enabled
- Try again

---

## 📋 CHECKLIST:

- [ ] Phantom wallet installed?
- [ ] Page loads correctly?
- [ ] Console has no errors on load?
- [ ] "Connect Wallet" button visible?
- [ ] Click button → modal opens?
- [ ] Wallet list shows Phantom?
- [ ] Click Phantom → extension opens?
- [ ] Approve connection?
- [ ] Dashboard loads?

---

## 🔍 DEBUG MODE:

### Enable detailed logs:
Add to `App.tsx` in `handleConnectWallet`:

```typescript
const handleConnectWallet = () => {
  console.log('🔵 Opening wallet modal...');
  console.log('🔵 setVisible function:', typeof setVisible);
  console.log('🔵 WalletModal available:', !!setVisible);
  
  try {
    setVisible(true);
    console.log('✅ Modal opened successfully');
  } catch (error) {
    console.error('❌ Error opening modal:', error);
  }
  
  setShowWalletModal(false);
};
```

---

## 📸 GỬI CHO TÔI:

Để tôi debug chính xác, hãy gửi:
1. **Screenshot console (F12)**
2. **Error message đầy đủ**
3. **Bước nào bị lỗi** (1-4 trong checklist)
4. **Phantom có installed không?**

---

## 🚀 CURRENT STATUS:

✅ **Code đã check:**
- WalletProvider: OK
- WalletModalProvider: OK  
- useWalletModal: OK
- CSS import: OK
- setVisible: OK

⏳ **Chờ thông tin:**
- Error message cụ thể
- Console logs
- Bước nào fail

---

**Hãy mở console (F12) và cho tôi biết error message màu đỏ!** 🔍
