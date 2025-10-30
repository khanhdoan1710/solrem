import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, ProgressBar, Chip, IconButton } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface Props {
  userId: string;
}

interface SleepRecord {
  _id: string;
  date: string;
  dailyProofOfRemScore: number;
}

const DashboardScreen: React.FC<Props> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/user/${userId}/data`);
      const result = await response.json();
      setData(result);
    } catch (e) {
      setError('Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchSleepStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSleepStats = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/sleep/stats/${userId}?days=7`);
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (e) {
      console.error('Failed to fetch sleep stats:', e);
    }
  };

  const handleSyncSleep = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/sync-sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (response.ok) {
        fetchUserData();
      } else {
        setError(result.error || 'Failed to sync sleep data.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setSyncing(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;

  const chartData = data?.sleepRecords?.slice(0, 7).reverse().map((record: SleepRecord) => record.dailyProofOfRemScore) || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const chartConfig = {
    backgroundColor: '#6200ee',
    backgroundGradientFrom: '#6200ee',
    backgroundGradientTo: '#6200ee',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Sleep Dashboard</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>Track your REM sleep journey</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : data ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Proof of REM Points Card */}
          <Card style={styles.pointsCard}>
            <Card.Content style={styles.pointsContent}>
              <View style={styles.pointsHeader}>
                <Text variant="titleLarge" style={styles.pointsLabel}>Proof of REM Points</Text>
                <IconButton icon="trophy" iconColor="#ffa726" size={24} />
              </View>
              <Text variant="displayLarge" style={styles.points}>{data.totalProofOfRemPoints}</Text>
              <Text variant="bodyMedium" style={styles.pointsSubtext}>
                Total points earned from quality sleep
              </Text>
            </Card.Content>
          </Card>

          {/* Sleep Stats Cards */}
          {stats && (
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="titleMedium" style={styles.statValue}>{stats.averageScore}</Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Avg Score (7d)</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="titleMedium" style={styles.statValue}>{stats.bestScore}</Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Best Score</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="titleMedium" style={styles.statValue}>{stats.totalRecords}</Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Days Tracked</Text>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Sleep Trend Chart */}
          {chartData.length > 0 && (
            <Card style={styles.chartCard}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.chartTitle}>7-Day Sleep Trend</Text>
                <LineChart
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                      data: chartData.length >= 7 ? chartData : [...Array(7 - chartData.length).fill(0), ...chartData]
                    }]
                  }}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button 
              mode="contained" 
              onPress={handleSyncSleep} 
              loading={syncing} 
              disabled={syncing} 
              style={styles.actionButton}
              icon="sync"
            >
                Sync Sleep Data
              </Button>
            <Button 
              mode="outlined" 
              icon="watch" 
              style={styles.actionButton} 
              disabled
            >
              Connect Garmin
              </Button>
          </View>

          {/* Recent Sleep Records */}
          <Text variant="titleMedium" style={styles.historyTitle}>Recent Sleep Records</Text>
          {data.sleepRecords?.length > 0 ? (
            data.sleepRecords.slice(0, 5).map((record: SleepRecord) => (
              <Card key={record._id} style={styles.recordCard}>
                <Card.Content style={styles.recordContent}>
                  <View style={styles.recordHeader}>
                    <Text variant="titleSmall" style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                    <Chip 
                      mode="flat" 
                      compact 
                      style={[styles.scoreChip, { backgroundColor: getScoreColor(record.dailyProofOfRemScore) }]}
                    >
                      {record.dailyProofOfRemScore}
                    </Chip>
                  </View>
                  <View style={styles.recordDetails}>
                    <View style={styles.recordDetail}>
                      <Text variant="bodySmall" style={styles.detailLabel}>REM Score</Text>
                      <ProgressBar 
                        progress={record.remScore / 100} 
                        color="#9C27B0" 
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall" style={styles.detailValue}>{record.remScore}</Text>
                    </View>
                    <View style={styles.recordDetail}>
                      <Text variant="bodySmall" style={styles.detailLabel}>Deep Sleep</Text>
                      <ProgressBar 
                        progress={record.deepSleepScore / 100} 
                        color="#2196F3" 
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall" style={styles.detailValue}>{record.deepSleepScore}</Text>
                    </View>
                    <View style={styles.recordDetail}>
                      <Text variant="bodySmall" style={styles.detailLabel}>Efficiency</Text>
                      <ProgressBar 
                        progress={record.efficiencyScore / 100} 
                        color="#4CAF50" 
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall" style={styles.detailValue}>{record.efficiencyScore}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No sleep records yet. Sync your data to get started!
                </Text>
            </Card.Content>
          </Card>
          )}
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
        <Text style={styles.error}>{error || 'No data available.'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f6f6f6' 
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    color: '#7f8c8d',
    marginTop: 4,
  },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    flex: 1, 
    padding: 16 
  },
  pointsCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#6200ee',
  },
  pointsContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: { 
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  points: { 
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointsSubtext: {
    color: '#e1bee7',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    color: '#7f8c8d',
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    marginBottom: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  historyTitle: { 
    marginBottom: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  recordCard: {
    marginBottom: 12,
    elevation: 2,
  },
  recordContent: {
    paddingVertical: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  scoreChip: {
    minWidth: 40,
  },
  recordDetails: {
    gap: 8,
  },
  recordDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    width: 80,
    color: '#7f8c8d',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  detailValue: {
    width: 30,
    textAlign: 'right',
    color: '#2c3e50',
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  error: { 
    color: '#F44336', 
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DashboardScreen; 