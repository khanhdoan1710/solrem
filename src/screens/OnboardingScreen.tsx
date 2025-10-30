import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  setUserId: (id: string) => void;
}

const OnboardingScreen: React.FC<Props> = ({ setUserId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.userId) {
        await AsyncStorage.setItem('userId', data.userId);
        setUserId(data.userId);
      } else {
        setError('Failed to register user.');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>Welcome to Sol REM</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Track your REM sleep, connect your Garmin, and earn Proof of REM points!
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <Button mode="contained" onPress={handleGetStarted} loading={loading} disabled={loading} style={styles.button}>
            Get Started
          </Button>
        </Card.Content>
      </Card>
      {loading && <ActivityIndicator style={styles.loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f6f6' },
  card: { width: '90%', padding: 20 },
  title: { marginBottom: 16, textAlign: 'center' },
  subtitle: { marginBottom: 24, textAlign: 'center' },
  button: { marginTop: 16 },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },
  loading: { marginTop: 16 },
});

export default OnboardingScreen; 