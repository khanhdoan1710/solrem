# SolREM - Sleep to Earn Protocol

SolREM is a mobile-first decentralized application (dApp) built on Solana that gamifies sleep hygiene. Users earn tokens for high-quality sleep (verified by wearables) and can participate in prediction markets based on sleep outcomes.

## 📂 Project Structure

*   `index.html`: Entry point, contains Tailwind CSS config and global styles.
*   `index.tsx`: React root mounting.
*   `App.tsx`: Main application logic, routing, UI rendering, and state management.
*   `types.ts`: TypeScript interfaces for Data Models (SleepData, UserProfile, Market, etc.).
*   `constants.ts`: Contains **Mock Data** used throughout the prototype.
*   `services/geminiService.ts`: Integration with Google Gemini AI for sleep analysis.
*   `components/`: Reusable UI components (`SleepChart`, `ScoreRing`).

---

## 🔘 Detailed Button & Functionality Map

### 1. Landing Page (Onboarding)
*   **"Connect Wallet" (Large Main Button):**
    *   **Action:** Opens the *Wallet Selection Modal*.
    *   **Function:** Triggers `setShowWalletModal(true)`.
*   **"Enter as Guest" (Text Button):**
    *   **Action:** Simulates a login without a wallet.
    *   **Function:** Sets `walletConnected` to false, `isOnboarding` to false, and enters read-only mode.
*   **Wallet Selection Modal (Popup):**
    *   **"Phantom" / "Solflare":** Simulates connecting to specific Solana wallets. Triggers a loading state then logs the user in.
    *   **"Passkey":** Simulates a biometric login (FaceID/TouchID).

### 2. Header (Global Top Bar)
*   **Wallet Address Button (Top Right):**
    *   **State: Disconnected:** Label "Connect". Clicking opens the *Wallet Selection Modal*.
    *   **State: Connected:** Label "8x...3f29". Clicking opens the *Wallet Details Modal*.
*   **Wallet Details Modal:**
    *   **"Disconnect" (Red Button):** Logs the user out and returns them to the Landing Page.

### 3. Navigation Bar (Bottom)
*   **DASH (Home):** View main sleep score and chart.
*   **MKTS (Markets):** Trading interface for sleep prediction markets.
*   **LEAD (Leaderboard):** View user rankings.
*   **SYNC (Device):** Manage wearable connections.
*   **LEARN (Resources):** Educational content.
*   **PRO (Profile):** User stats and profile settings.

### 4. Tab-Specific Actions

#### **DASH (Dashboard Tab)**
*   *This tab is primarily for data visualization (Sleep Ring, Metrics Grid, Charts) and has no primary user action buttons besides navigation.*

#### **MKTS (Markets Tab)**
*   **Explore / Portfolio Tabs (Top Toggle):**
    *   **Explore:** Lists active markets available for trading.
    *   **Portfolio:** Shows your current holdings and P&L.
*   **Market Card (Click Action):**
    *   Opens the **Order Modal** for that specific market.
*   **Order Modal (Advanced Betting Interface):**
    *   **Buy YES / Buy NO Toggle:** Switches the position you want to take (Green for Yes, Red for No).
    *   **Amount Input (Field & Slider):** Sets the SOL amount to wager.
    *   **Place Order Button:**
        1.  Triggers `LOADING` state (Simulating blockchain confirmation).
        2.  Triggers `SUCCESS` state (Green checkmark animation).
        3.  Updates the "Portfolio" tab with the new position.
    *   **Success Screen:** Shows "Order Filled" and a "Close" button to return to the market list.

#### **SYNC (Data Sources Tab)**
*   **"Scan Devices" (Top Right):**
    *   **Action:** Simulates searching for Bluetooth wearables. Shows a "Scanning..." spinner for 3 seconds.
*   **Device Card Buttons:**
    *   **Red "X":** Disconnects a connected device.
    *   **Green "+":** Connects a discovered device.

#### **LEARN (Resources Tab)**
*   **"Read" / "Watch" / "Listen":**
    *   **Action:** Opens the external resource link (Google, YouTube, etc.) in a new browser tab.

#### **PRO (Profile Tab)**
*   **"Edit" (Pencil Icon next to username):**
    *   **Action:** Enables **Edit Mode**. Text fields replace static text, and the avatar becomes clickable.
*   **Edit Mode Actions:**
    *   **Avatar (Camera Overlay):** Opens the operating system's file picker to upload an image.
    *   **Save Changes:** Commits changes to the local state and exits Edit Mode.
    *   **Cancel:** Reverts any unsaved changes and exits Edit Mode.

---

## 🛠 Architecture: Building the Real Backend & Smart Contract

To move from this prototype to a production dApp, follow this architecture.

### 1. Solana Smart Contract (The "Program")

You must write a Solana Program using **Rust** and the **Anchor Framework**.

**Core Data Structures (`struct`):**
*   **`Market`:** Stores `market_id`, `end_timestamp`, `total_pool` (u64), `outcome` (enum).
*   **`Bet`:** Stores `user_pubkey`, `amount`, `position` (Long/Short).

**Key Instructions (Functions):**
1.  **`place_bet(ctx, amount, position)`**: 
    *   Transfers SOL from User Wallet -> Program Vault (PDA).
    *   Records the Bet struct.
2.  **`settle_market(ctx, outcome)`**: 
    *   **Critical:** This function must be protected. Only the **Oracle's Public Key** can sign this transaction.
    *   It updates the `Market` state with the final result (e.g., Sleep Score > 80 = YES).
3.  **`claim_winnings(ctx)`**:
    *   Allows users who bet on the winning side to withdraw their share of the pool.

### 2. The "Sleep Oracle" (Backend)

The "Oracle" is a trusted backend server that bridges Web2 wearable data to the Web3 Solana blockchain.

**Tech Stack:** Node.js (TypeScript) or Python.

**Workflow:**
1.  **Ingest:** Server receives a webhook from a wearable API (Terra API, Garmin Health API, Oura Cloud).
2.  **Verify:** The server checks the digital signature to ensure the sleep data belongs to the user claiming it.
3.  **Process:** It runs the scoring algorithm (same as `types.ts` logic) to determine the Sleep Score.
4.  **Publish:** 
    *   The server holds a **Keypair** (The "Oracle Key").
    *   It creates a Solana transaction calling `settle_market`.
    *   It signs and sends this transaction to the Solana network.

---

## 📍 Mock Data Locations

All simulation data is centralized in `src/constants.ts`. Modify these files to test different scenarios.

*   **Sleep History Charts:** Edit `MOCK_SLEEP_HISTORY`.
*   **Betting Markets:** Edit `MOCK_MARKETS`.
*   **Wearable Devices:** Edit `MOCK_DEVICES`.
*   **Educational Content:** Edit `MOCK_RESOURCES`.
*   **Default User User:** Edit `USER_PROFILE`.
