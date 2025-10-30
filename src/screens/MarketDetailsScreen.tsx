import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  ProgressBar, 
  Divider,
  ActivityIndicator,
  IconButton 
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import SolanaService, { MarketData, WalletInfo } from '../services/SolanaService';

interface RouteParams {
  marketId: string;
  wallet: WalletInfo;
}

const MarketDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { marketId, wallet } = route.params as RouteParams;
  
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState(false);
  const [userBet, setUserBet] = useState<{ direction: 'yes' | 'no'; amount: number } | null>(null);

  useEffect(() => {
    fetchMarketDetails();
  }, [marketId]);

  const fetchMarketDetails = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch specific market details
      const markets = await SolanaService.getActiveMarkets();
      const foundMarket = markets.find(m => m.marketId === marketId);
      setMarket(foundMarket || null);
      
      // Check if user has placed a bet
      const userBets = await SolanaService.getUserBets();
      const userBetForMarket = userBets.find(bet => bet.market === marketId);
      if (userBetForMarket) {
        setUserBet({
          direction: userBetForMarket.direction,
          amount: userBetForMarket.amount
        });
      }
    } catch (error) {
      console.error('Failed to fetch market details:', error);
      Alert.alert('Error', 'Failed to load market details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async (direction: 'yes' | 'no') => {
    if (!market || !wallet) return;

    setBetting(true);
    try {
      const betAmount = 0.1; // 0.1 SOL
      const mintAddress = 'So11111111111111111111111111111111111111112';
      
      const txId = await SolanaService.placeBet(market.marketId, betAmount, direction, mintAddress);
      
      Alert.alert(
        'Bet Placed!',
        `Your bet has been placed successfully. Transaction: ${txId.slice(0, 8)}...`
      );
      
      // Update local state
      setUserBet({ direction, amount: betAmount });
      await fetchMarketDetails();
    } catch (error) {
      console.error('Failed to place bet:', error);
      Alert.alert('Error', 'Failed to place bet. Please try again.');
    } finally {
      setBetting(false);
    }
  };

  const handleResolveMarket = async (outcome: 'yes' | 'no') => {
    if (!market || !wallet) return;

    Alert.alert(
      'Resolve Market',
      `Are you sure you want to resolve this market as "${outcome.toUpperCase()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              const txId = await SolanaService.resolveMarket(market.marketId, outcome);
              Alert.alert(
                'Market Resolved!',
                `Market has been resolved as "${outcome.toUpperCase()}". Transaction: ${txId.slice(0, 8)}...`
              );
              await fetchMarketDetails();
            } catch (error) {
              console.error('Failed to resolve market:', error);
              Alert.alert('Error', 'Failed to resolve market. Please try again.');
            }
          }
        }
      ]
    );
  };

  const calculateOdds = (yesPool: number, noPool: number) => {
    const total = yesPool + noPool;
    if (total === 0) return { yes: 50, no: 50 };
    return {
      yes: Math.round((yesPool / total) * 100),
      no: Math.round((noPool / total) * 100)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'resolved': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading market details...
        </Text>
      </View>
    );
  }

  if (!market) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={styles.errorText}>
          Market not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const odds = calculateOdds(market.yesPool, market.noPool);
  const timeRemaining = getTimeRemaining(market.endTime);
  const isCreator = wallet.publicKey.toString() === market.creator;
  const isExpired = Date.now() >= market.endTime;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={() => navigation.goBack()}
          iconColor="#6200ee"
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Market Details
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Market Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.marketHeader}>
              <Text variant="titleMedium" style={styles.marketTitle}>
                {market.description}
              </Text>
              <Chip
                mode="flat"
                compact
                style={[styles.statusChip, { backgroundColor: getStatusColor(market.status) + '20' }]}
                textStyle={{ color: getStatusColor(market.status) }}
              >
                {market.status.toUpperCase()}
              </Chip>
            </View>
            
            <View style={styles.marketMeta}>
              <Text variant="bodySmall" style={styles.metaText}>
                Created by {market.creator.slice(0, 8)}...{market.creator.slice(-8)}
              </Text>
              <Text variant="bodySmall" style={styles.metaText}>
                {timeRemaining}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Pool Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Pool Information
            </Text>
            
            <View style={styles.poolContainer}>
              <View style={styles.poolItem}>
                <Text variant="bodySmall" style={styles.poolLabel}>Total Pool</Text>
                <Text variant="titleLarge" style={styles.poolValue}>
                  {market.totalPool.toFixed(2)} SOL
                </Text>
              </View>
            </View>

            <View style={styles.oddsContainer}>
              <View style={styles.oddsItem}>
                <View style={styles.oddsHeader}>
                  <Text variant="bodyMedium" style={[styles.oddsLabel, { color: '#4CAF50' }]}>
                    YES
                  </Text>
                  <Text variant="titleMedium" style={[styles.oddsValue, { color: '#4CAF50' }]}>
                    {odds.yes}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={odds.yes / 100} 
                  color="#4CAF50" 
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.poolAmount}>
                  {market.yesPool.toFixed(2)} SOL
                </Text>
              </View>

              <View style={styles.oddsItem}>
                <View style={styles.oddsHeader}>
                  <Text variant="bodyMedium" style={[styles.oddsLabel, { color: '#F44336' }]}>
                    NO
                  </Text>
                  <Text variant="titleMedium" style={[styles.oddsValue, { color: '#F44336' }]}>
                    {odds.no}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={odds.no / 100} 
                  color="#F44336" 
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.poolAmount}>
                  {market.noPool.toFixed(2)} SOL
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* User Bet Information */}
        {userBet && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Your Bet
              </Text>
              <View style={styles.userBetContainer}>
                <Chip
                  mode="flat"
                  style={[
                    styles.userBetChip,
                    { backgroundColor: userBet.direction === 'yes' ? '#E8F5E8' : '#FFEBEE' }
                  ]}
                  textStyle={{
                    color: userBet.direction === 'yes' ? '#4CAF50' : '#F44336'
                  }}
                >
                  {userBet.direction.toUpperCase()}
                </Chip>
                <Text variant="bodyMedium" style={styles.userBetAmount}>
                  {userBet.amount.toFixed(2)} SOL
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        {market.status === 'active' && (
          <Card style={styles.card}>
            <Card.Content>
              {!userBet && !isExpired && (
                <>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Place Your Bet
                  </Text>
                  <View style={styles.betActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => handlePlaceBet('yes')}
                      loading={betting}
                      disabled={betting}
                      style={[styles.betButton, styles.yesButton]}
                    >
                      Bet YES
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handlePlaceBet('no')}
                      loading={betting}
                      disabled={betting}
                      style={[styles.betButton, styles.noButton]}
                    >
                      Bet NO
                    </Button>
                  </View>
                </>
              )}

              {isCreator && isExpired && (
                <>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Resolve Market
                  </Text>
                  <Text variant="bodySmall" style={styles.sectionDescription}>
                    This market has expired. As the creator, you can now resolve it.
                  </Text>
                  <View style={styles.resolveActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleResolveMarket('yes')}
                      style={[styles.resolveButton, styles.yesButton]}
                    >
                      Resolve YES
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleResolveMarket('no')}
                      style={[styles.resolveButton, styles.noButton]}
                    >
                      Resolve NO
                    </Button>
                  </View>
                </>
              )}

              {market.status === 'resolved' && market.outcome && (
                <View style={styles.resolvedContainer}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Market Resolved
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.outcomeChip,
                      { backgroundColor: market.outcome === 'yes' ? '#E8F5E8' : '#FFEBEE' }
                    ]}
                    textStyle={{
                      color: market.outcome === 'yes' ? '#4CAF50' : '#F44336'
                    }}
                  >
                    {market.outcome.toUpperCase()}
                  </Chip>
                  {userBet && userBet.direction === market.outcome && (
                    <Button 
                      mode="contained" 
                      style={styles.claimButton}
                      onPress={() => {
                        // Handle claim winnings
                        Alert.alert('Claim Winnings', 'Winnings claim functionality will be implemented');
                      }}
                    >
                      Claim Winnings
                    </Button>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    color: '#F44336',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  marketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#7f8c8d',
  },
  sectionTitle: {
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    color: '#7f8c8d',
    marginBottom: 16,
  },
  poolContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  poolItem: {
    alignItems: 'center',
  },
  poolLabel: {
    color: '#7f8c8d',
    marginBottom: 4,
  },
  poolValue: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  oddsContainer: {
    gap: 16,
  },
  oddsItem: {
    gap: 8,
  },
  oddsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oddsLabel: {
    fontWeight: '600',
  },
  oddsValue: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  poolAmount: {
    color: '#7f8c8d',
    textAlign: 'right',
  },
  userBetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBetChip: {
    alignSelf: 'flex-start',
  },
  userBetAmount: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  betActions: {
    flexDirection: 'row',
    gap: 12,
  },
  betButton: {
    flex: 1,
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  resolveActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resolveButton: {
    flex: 1,
  },
  resolvedContainer: {
    alignItems: 'center',
    gap: 16,
  },
  outcomeChip: {
    alignSelf: 'center',
  },
  claimButton: {
    backgroundColor: '#FF9800',
  },
});

export default MarketDetailsScreen;
