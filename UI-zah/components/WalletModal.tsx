import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  isMobile: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: 'Phantom' | 'Solflare') => void;
  LoadingComponent?: React.ReactNode;
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  isLoading = false,
  isMobile,
  onClose,
  onSelectWallet,
  LoadingComponent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {isLoading && LoadingComponent ? (
        <div className="glass-panel w-full max-w-sm rounded-xl p-8 border border-sport/20 shadow-2xl animate-slide-up bg-[#09090b]">
          {LoadingComponent}
        </div>
      ) : (
        <div className="glass-card w-full max-w-sm rounded-sm p-6 border border-border shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold uppercase">Connect Wallet</h2>
            <button onClick={onClose}>
              <X className="text-gray-400 hover:text-white" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center mb-4">
              {isMobile ? '📱 Tap to open wallet app' : '💻 Select your wallet'}
            </p>

            {/* Phantom Wallet */}
            <button
              onClick={() => onSelectWallet('Phantom')}
              className="w-full bg-[#512DA8] hover:bg-[#5e35b1] p-4 rounded-sm flex items-center justify-between group transition-colors border border-white/5"
            >
              <div className="flex items-center gap-3">
                <img src="/logos/phantom.svg" alt="Phantom" className="w-10 h-10 rounded-full" />
                <div className="text-left">
                  <div className="font-bold tracking-wide text-white">PHANTOM</div>
                  <div className="text-xs text-white/60">
                    {isMobile ? 'Mobile App' : 'Browser Extension'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </button>

            {/* Solflare Wallet */}
            <button
              onClick={() => onSelectWallet('Solflare')}
              className="w-full bg-surface hover:bg-surfaceHighlight p-4 rounded-sm flex items-center justify-between group transition-colors border border-border"
            >
              <div className="flex items-center gap-3">
                <img src="/logos/solflare.svg" alt="Solflare" className="w-10 h-10 rounded-full" />
                <div className="text-left">
                  <div className="font-bold tracking-wide text-gray-300">SOLFLARE</div>
                  <div className="text-xs text-gray-500">
                    {isMobile ? 'Mobile App' : 'Browser Extension'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>

            {/* Footer hint */}
            {isMobile ? (
              <p className="text-xs text-gray-600 text-center mt-4">
                📲 Will open your wallet app
              </p>
            ) : (
              <p className="text-xs text-gray-600 text-center mt-4">
                Requires browser extension
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletModal;
