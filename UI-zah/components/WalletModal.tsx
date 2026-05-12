import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  LoaderCircle,
  ShieldCheck,
  X,
} from 'lucide-react';

export type WalletType = 'Phantom' | 'Solflare';

export interface WalletOption {
  name: WalletType;
  icon: string;
  detected: boolean;
  helperText: string;
  badgeLabel: string;
}

export interface WalletModalState {
  status: 'idle' | 'connecting' | 'install' | 'error';
  walletType?: WalletType;
  title?: string;
  description?: string;
  actionLabel?: string;
}

interface WalletModalProps {
  isOpen: boolean;
  isMobile: boolean;
  wallets: WalletOption[];
  state: WalletModalState;
  onClose: () => void;
  onSelectWallet: (walletType: WalletType) => void;
  onPrimaryAction: () => void;
  onBackToWalletList: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  isMobile,
  wallets,
  state,
  onClose,
  onSelectWallet,
  onPrimaryAction,
  onBackToWalletList,
}) => {
  if (!isOpen) return null;

  const selectedWallet = state.walletType
    ? wallets.find((wallet) => wallet.name === state.walletType)
    : undefined;
  const isBusy = state.status === 'connecting';

  const renderWalletIcon = (wallet?: WalletOption, size = 'h-12 w-12') => {
    if (wallet?.icon) {
      return (
        <img
          src={wallet.icon}
          alt={`${wallet.name} logo`}
          className={`${size} rounded-2xl object-contain`}
        />
      );
    }

    return (
      <div className={`${size} rounded-2xl bg-white/5 flex items-center justify-center text-sm font-bold text-white`}>
        {wallet?.name?.slice(0, 2) ?? 'W'}
      </div>
    );
  };

  const renderIdleState = () => (
    <div className="space-y-3">
      <p className="mb-5 text-center text-sm text-gray-400">
        {isMobile
          ? 'Open your wallet app and approve the connection request.'
          : 'Choose a wallet. If it is not installed, we will route you to the correct download page.'}
      </p>

      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          type="button"
          onClick={() => onSelectWallet(wallet.name)}
          className="w-full rounded-2xl border border-white/8 bg-[#111113] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sport/30 hover:bg-[#16161a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                {renderWalletIcon(wallet, 'h-10 w-10')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold uppercase tracking-wide text-white">
                    {wallet.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] ${
                      wallet.detected
                        ? 'bg-sport/15 text-sport'
                        : 'bg-white/8 text-gray-400'
                    }`}
                  >
                    {wallet.badgeLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{wallet.helperText}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-500" />
          </div>
        </button>
      ))}

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs text-gray-500">
        No transaction or signature is requested at this stage. This step only links your wallet session to SolREM.
      </div>
    </div>
  );

  const renderConnectingState = () => (
    <div className="flex flex-col items-center py-3 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-[28px] bg-sport/15 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-sport/25 bg-white/5 shadow-[0_0_35px_rgba(204,255,0,0.08)]">
          {renderWalletIcon(selectedWallet, 'h-14 w-14')}
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-sport text-black shadow-[0_0_20px_rgba(204,255,0,0.35)]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
        </div>
      </div>

      <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-sport">
        Wallet handshake
      </div>
      <h3 className="mt-3 text-2xl font-display font-bold uppercase text-white">
        {state.title ?? `Connecting ${selectedWallet?.name ?? 'wallet'}`}
      </h3>
      <p className="mt-3 max-w-xs text-sm text-gray-400">
        {state.description ??
          `Approve the connection request inside ${selectedWallet?.name ?? 'your wallet'} to continue.`}
      </p>

      <div className="mt-6 w-full rounded-2xl border border-white/8 bg-[#111113] p-4 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sport" />
          <div>
            <div className="text-sm font-semibold text-white">
              Waiting for {selectedWallet?.name ?? 'wallet'} approval
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isMobile
                ? 'If nothing appears, switch to your wallet app and confirm the request there.'
                : 'If the popup is hidden, bring your wallet extension window to the front and approve.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <span className="h-1.5 flex-1 rounded-full bg-sport animate-pulse" />
          <span className="h-1.5 flex-1 rounded-full bg-white/10" />
          <span className="h-1.5 flex-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );

  const renderResolutionState = () => {
    const isInstall = state.status === 'install';

    return (
      <div className="flex flex-col items-center py-3 text-center">
        <div
          className={`mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border ${
            isInstall
              ? 'border-white/10 bg-white/5'
              : 'border-red-500/20 bg-red-500/10'
          }`}
        >
          {isInstall ? (
            renderWalletIcon(selectedWallet, 'h-14 w-14')
          ) : (
            <AlertTriangle className="h-10 w-10 text-red-400" />
          )}
        </div>

        <div
          className={`text-[11px] font-mono uppercase tracking-[0.28em] ${
            isInstall ? 'text-gray-400' : 'text-red-400'
          }`}
        >
          {isInstall ? 'Wallet required' : 'Connection blocked'}
        </div>
        <h3 className="mt-3 text-2xl font-display font-bold uppercase text-white">
          {state.title ?? (isInstall ? `Install ${selectedWallet?.name}` : 'Connection failed')}
        </h3>
        <p className="mt-3 max-w-xs text-sm text-gray-400">
          {state.description ??
            (isInstall
              ? 'This wallet is not available in the current browser.'
              : 'We could not finish the wallet handshake. Please try again.')}
        </p>

        <div className="mt-6 flex w-full gap-3">
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              isInstall
                ? 'bg-sport text-black hover:bg-sport/90'
                : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {state.actionLabel}
              {isInstall && <ArrowUpRight className="h-4 w-4" />}
            </span>
          </button>

          <button
            type="button"
            onClick={onBackToWalletList}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Back
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div className="glass-card w-full max-w-sm rounded-[24px] border border-border p-6 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 id="wallet-modal-title" className="text-xl font-display font-bold uppercase text-white">
              Connect Wallet
            </h2>
            <p className="mt-1 text-xs font-mono uppercase tracking-[0.18em] text-gray-500">
              Secure Solana session
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close wallet modal"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state.status === 'idle' && renderIdleState()}
        {state.status === 'connecting' && renderConnectingState()}
        {(state.status === 'install' || state.status === 'error') && renderResolutionState()}
      </div>
    </div>
  );
};

export default WalletModal;
