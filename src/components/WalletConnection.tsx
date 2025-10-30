import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, ActivityIndicator, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SolanaService, { WalletInfo } from '../services/SolanaService';

interface Props {
  onWalletConnected?: (wallet: WalletInfo) => void;
  onWalletDisconnected?: () => void;
}

const WalletConnection: React.FC<Props> = ({ onWalletConnected, onWalletDisconnected }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const currentWallet = SolanaService.getWallet();
    if (currentWallet) {
      setWallet(currentWallet);
      fetchBalance();
    }
  }, []);

  const fetchBalance = async () => {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const solBalance = await SolanaService.getBalance();
      setBalance(solBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const connectedWallet = await SolanaService.connectWallet();
      setWallet(connectedWallet);
      await fetchBalance();
      onWalletConnected?.(connectedWallet);
    } catch (error) {
      Alert.alert('Connection Failed', 'Failed to connect wallet. Please try again.');
      console.error('Wallet connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    SolanaService.disconnectWallet();
    setWallet(null);
    setBalance(0);
    onWalletDisconnected?.();
  };

  if (wallet) {
    return (
      <Card style={styles.walletCard}>
        <Card.Content>
          <View style={styles.walletHeader}>
            <View style={styles.walletInfo}>
              <Icon name="wallet" size={24} color="#4CAF50" />
              <View style={styles.walletDetails}>
                <Text variant="titleMedium" style={styles.walletTitle}>
                  Wallet Connected
                </Text>
                <Text variant="bodySmall" style={styles.walletAddress}>
                  {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-8)}
                </Text>
              </View>
            </View>
            <Chip 
              mode="flat" 
              compact 
              style={styles.connectedChip}
              textStyle={styles.connectedText}
            >
              Connected
            </Chip>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text variant="bodyMedium" style={styles.balanceLabel}>SOL Balance:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#6200ee" />
            ) : (
              <Text variant="titleMedium" style={styles.balanceValue}>
                {balance.toFixed(4)} SOL
              </Text>
            )}
          </View>
          
          <View style={styles.walletActions}>
            <Button 
              mode="outlined" 
              onPress={fetchBalance}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
              icon="refresh"
            >
              Refresh
            </Button>
            <Button 
              mode="outlined" 
              onPress={handleDisconnect}
              style={[styles.actionButton, styles.disconnectButton]}
              icon="logout"
            >
              Disconnect
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.connectCard}>
      <Card.Content style={styles.connectContent}>
        <Icon name="wallet-outline" size={48} color="#6200ee" />
        <Text variant="titleLarge" style={styles.connectTitle}>
          Connect Your Wallet
        </Text>
        <Text variant="bodyMedium" style={styles.connectDescription}>
          Connect your Solana wallet to participate in prediction markets and earn rewards.
        </Text>
        <Button 
          mode="contained" 
          onPress={handleConnect}
          loading={connecting}
          disabled={connecting}
          style={styles.connectButton}
          icon="wallet"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  walletCard: {
    margin: 16,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletDetails: {
    marginLeft: 12,
    flex: 1,
  },
  walletTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  walletAddress: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  connectedChip: {
    backgroundColor: '#E8F5E8',
  },
  connectedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  balanceLabel: {
    color: '#7f8c8d',
  },
  balanceValue: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  disconnectButton: {
    borderColor: '#F44336',
  },
  connectCard: {
    margin: 16,
    elevation: 2,
  },
  connectContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  connectTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
    fontWeight: '600',
  },
  connectDescription: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 24,
    lineHeight: 20,
  },
  connectButton: {
    minWidth: 200,
  },
});

export default WalletConnection;
