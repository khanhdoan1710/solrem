import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, ProgressBar, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SolanaService, { MarketData, WalletInfo } from '../services/SolanaService';
import WalletConnection from '../components/WalletConnection';

interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  creator: string;
  endDate: string;
  totalPool: number;
  yesOdds: number;
  noOdds: number;
  participants: number;
  status: 'active' | 'resolved' | 'pending';
  category: string;
}

const MarketsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const activeMarkets = await SolanaService.getActiveMarkets();
      setMarkets(activeMarkets);
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      Alert.alert('Error', 'Failed to load prediction markets');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnected = (connectedWallet: WalletInfo) => {
    setWallet(connectedWallet);
  };

  const handleWalletDisconnected = () => {
    setWallet(null);
  };

  const handlePlaceBet = async (marketId: string, direction: 'yes' | 'no') => {
    if (!wallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet to place bets');
      return;
    }

    setBetting(marketId);
    try {
      const betAmount = 0.1; // 0.1 SOL
      const mintAddress = 'So11111111111111111111111111111111111111112'; // SOL mint
      
      const txId = await SolanaService.placeBet(marketId, betAmount, direction, mintAddress);
      
      Alert.alert(
        'Bet Placed!', 
        `Your bet has been placed successfully. Transaction: ${txId.slice(0, 8)}...`
      );
      
      // Refresh markets to show updated pools
      await fetchMarkets();
    } catch (error) {
      console.error('Failed to place bet:', error);
      Alert.alert('Error', 'Failed to place bet. Please try again.');
    } finally {
      setBetting(null);
    }
  };

  const handleMarketPress = (market: MarketData) => {
    if (wallet) {
      navigation.navigate('MarketDetails', { 
        marketId: market.marketId, 
        wallet 
      });
    }
  };

  const handleCreateMarket = () => {
    if (wallet) {
      navigation.navigate('CreateMarket', { wallet });
    } else {
      Alert.alert('Wallet Required', 'Please connect your wallet to create markets');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'resolved': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep-duration': return '#E91E63';
      case 'rem-sleep': return '#9C27B0';
      case 'wake-time': return '#3F51B5';
      default: return '#607D8B';
    }
  };

  const calculateOdds = (yesPool: number, noPool: number) => {
    const total = yesPool + noPool;
    if (total === 0) return { yes: 50, no: 50 };
    return {
      yes: Math.round((yesPool / total) * 100),
      no: Math.round((noPool / total) * 100)
    };
  };

  const renderMarket = (market: MarketData) => {
    const odds = calculateOdds(market.yesPool, market.noPool);
    const isBetting = betting === market.marketId;
    const endDate = new Date(market.endTime).toLocaleDateString();
    
    return (
      <Card 
        key={market.marketId} 
        style={styles.marketCard}
        onPress={() => handleMarketPress(market)}
      >
        <Card.Content>
          <View style={styles.marketHeader}>
            <Text variant="titleMedium" style={styles.marketTitle}>
              {market.description}
            </Text>
            <Chip
              mode="outlined"
              compact
              style={[styles.statusChip, { borderColor: getStatusColor(market.status) }]}
              textStyle={{ color: getStatusColor(market.status) }}
            >
              {market.status.toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.marketMeta}>
            <Text variant="bodySmall" style={styles.metaText}>
              Created by {market.creator}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Ends: {endDate}
            </Text>
          </View>
          
          <View style={styles.oddsContainer}>
            <View style={styles.oddsItem}>
              <Text variant="bodySmall" style={styles.oddsLabel}>YES</Text>
              <Text variant="titleMedium" style={[styles.oddsValue, { color: '#4CAF50' }]}>
                {odds.yes}%
              </Text>
            </View>
            <View style={styles.oddsItem}>
              <Text variant="bodySmall" style={styles.oddsLabel}>NO</Text>
              <Text variant="titleMedium" style={[styles.oddsValue, { color: '#F44336' }]}>
                {odds.no}%
              </Text>
            </View>
          </View>
          
          <View style={styles.marketStats}>
            <Text variant="bodySmall" style={styles.statText}>
              Pool: {market.totalPool.toFixed(2)} SOL
            </Text>
            <Text variant="bodySmall" style={styles.statText}>
              YES: {market.yesPool.toFixed(2)} SOL
            </Text>
            <Text variant="bodySmall" style={styles.statText}>
              NO: {market.noPool.toFixed(2)} SOL
            </Text>
          </View>
          
          {market.status === 'active' && wallet && (
            <View style={styles.marketActions}>
              <Button 
                mode="outlined" 
                compact 
                style={styles.betButton}
                onPress={() => handlePlaceBet(market.marketId, 'yes')}
                loading={isBetting}
                disabled={isBetting}
              >
                Bet YES
              </Button>
              <Button 
                mode="outlined" 
                compact 
                style={styles.betButton}
                onPress={() => handlePlaceBet(market.marketId, 'no')}
                loading={isBetting}
                disabled={isBetting}
              >
                Bet NO
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Prediction Markets
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bet on sleep outcomes and earn rewards
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!wallet && (
          <WalletConnection 
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading prediction markets...
            </Text>
          </View>
        ) : markets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Active Markets
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                Be the first to create a sleep prediction market!
              </Text>
              {wallet && (
                <Button mode="contained" style={styles.createButton} onPress={handleCreateMarket}>
                  Create Market
                </Button>
              )}
            </Card.Content>
          </Card>
        ) : (
          markets.map(renderMarket)
        )}
      </ScrollView>

      {wallet && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateMarket}
          label="Create Market"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  marketCard: {
    marginBottom: 16,
    elevation: 2,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  marketTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  marketDescription: {
    color: '#34495e',
    marginBottom: 12,
    lineHeight: 20,
  },
  marketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    color: '#7f8c8d',
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  oddsItem: {
    alignItems: 'center',
  },
  oddsLabel: {
    color: '#7f8c8d',
    marginBottom: 4,
  },
  oddsValue: {
    fontWeight: 'bold',
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statText: {
    color: '#7f8c8d',
  },
  marketActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  betButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
  },
});

export default MarketsScreen;
