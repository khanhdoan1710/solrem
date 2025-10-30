import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  SegmentedButtons, 
  Chip,
  Divider,
  ActivityIndicator 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SolanaService, { WalletInfo } from '../services/SolanaService';

interface Props {
  wallet: WalletInfo;
}

const CreateMarketScreen: React.FC<Props> = ({ wallet }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [marketType, setMarketType] = useState('sleep-duration');
  const [duration, setDuration] = useState('24');
  const [creatorStake, setCreatorStake] = useState('0.1');
  const [targetValue, setTargetValue] = useState('8');

  const marketTypes = [
    { value: 'sleep-duration', label: 'Sleep Duration' },
    { value: 'rem-percentage', label: 'REM %' },
    { value: 'deep-sleep', label: 'Deep Sleep' },
    { value: 'sleep-efficiency', label: 'Efficiency' },
    { value: 'wake-time', label: 'Wake Time' },
    { value: 'sleep-latency', label: 'Sleep Latency' },
  ];

  const durationOptions = [
    { value: '12', label: '12h' },
    { value: '24', label: '24h' },
    { value: '48', label: '48h' },
    { value: '72', label: '72h' },
    { value: '168', label: '1 week' },
  ];

  const stakeOptions = [
    { value: '0.05', label: '0.05 SOL' },
    { value: '0.1', label: '0.1 SOL' },
    { value: '0.25', label: '0.25 SOL' },
    { value: '0.5', label: '0.5 SOL' },
    { value: '1.0', label: '1.0 SOL' },
  ];

  const getMarketTemplate = (type: string) => {
    switch (type) {
      case 'sleep-duration':
        return {
          placeholder: 'Will I get 8+ hours of sleep tonight?',
          targetLabel: 'Target Hours',
          targetPlaceholder: '8',
          description: 'Predict your total sleep duration'
        };
      case 'rem-percentage':
        return {
          placeholder: 'Will my REM sleep be above 20%?',
          targetLabel: 'Target %',
          targetPlaceholder: '20',
          description: 'Predict your REM sleep percentage'
        };
      case 'deep-sleep':
        return {
          placeholder: 'Will my deep sleep be above 1.5 hours?',
          targetLabel: 'Target Hours',
          targetPlaceholder: '1.5',
          description: 'Predict your deep sleep duration'
        };
      case 'sleep-efficiency':
        return {
          placeholder: 'Will my sleep efficiency be above 85%?',
          targetLabel: 'Target %',
          targetPlaceholder: '85',
          description: 'Predict your sleep efficiency'
        };
      case 'wake-time':
        return {
          placeholder: 'Will I wake up before 7 AM?',
          targetLabel: 'Target Time',
          targetPlaceholder: '07:00',
          description: 'Predict your wake-up time'
        };
      case 'sleep-latency':
        return {
          placeholder: 'Will I fall asleep within 20 minutes?',
          targetLabel: 'Target Minutes',
          targetPlaceholder: '20',
          description: 'Predict your sleep latency'
        };
      default:
        return {
          placeholder: 'Enter your prediction...',
          targetLabel: 'Target Value',
          targetPlaceholder: '0',
          description: 'Create a custom prediction'
        };
    }
  };

  const template = getMarketTemplate(marketType);

  const handleCreateMarket = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a market description');
      return;
    }

    if (!targetValue.trim()) {
      Alert.alert('Error', 'Please enter a target value');
      return;
    }

    setLoading(true);
    try {
      const endTime = Date.now() + (parseInt(duration) * 60 * 60 * 1000);
      const stake = parseFloat(creatorStake);
      const mintAddress = 'So11111111111111111111111111111111111111112'; // SOL mint

      const marketId = await SolanaService.createMarket(
        description,
        endTime,
        stake,
        mintAddress
      );

      Alert.alert(
        'Market Created!',
        `Your prediction market has been created successfully. Market ID: ${marketId}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create market:', error);
      Alert.alert('Error', 'Failed to create market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = () => {
    const hours = parseInt(duration);
    const endTime = new Date(Date.now() + (hours * 60 * 60 * 1000));
    return endTime.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Prediction Market
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Set up a new sleep prediction market
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Market Type Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Market Type
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              {template.description}
            </Text>
            <View style={styles.chipContainer}>
              {marketTypes.map((type) => (
                <Chip
                  key={type.value}
                  selected={marketType === type.value}
                  onPress={() => {
                    setMarketType(type.value);
                    setDescription(template.placeholder);
                    setTargetValue(template.targetPlaceholder);
                  }}
                  style={styles.chip}
                >
                  {type.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Market Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Market Description
            </Text>
            <TextInput
              mode="outlined"
              placeholder={template.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </Card.Content>
        </Card>

        {/* Target Value */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {template.targetLabel}
            </Text>
            <TextInput
              mode="outlined"
              placeholder={template.targetPlaceholder}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="numeric"
              style={styles.textInput}
            />
          </Card.Content>
        </Card>

        {/* Market Duration */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Market Duration
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              How long should the market be active?
            </Text>
            <View style={styles.segmentedContainer}>
              <SegmentedButtons
                value={duration}
                onValueChange={setDuration}
                buttons={durationOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                style={styles.segmentedButtons}
              />
            </View>
            <Text variant="bodySmall" style={styles.endTimeText}>
              Market ends: {calculateEndTime()}
            </Text>
          </Card.Content>
        </Card>

        {/* Creator Stake */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Creator Stake
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              How much SOL do you want to stake as the market creator?
            </Text>
            <View style={styles.segmentedContainer}>
              <SegmentedButtons
                value={creatorStake}
                onValueChange={setCreatorStake}
                buttons={stakeOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                style={styles.segmentedButtons}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Market Preview */}
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Market Preview
            </Text>
            <View style={styles.previewContent}>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Description: </Text>
                {description || template.placeholder}
              </Text>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Type: </Text>
                {marketTypes.find(t => t.value === marketType)?.label}
              </Text>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Target: </Text>
                {targetValue} {marketType === 'wake-time' ? '' : marketType.includes('percentage') || marketType === 'sleep-efficiency' ? '%' : marketType === 'sleep-latency' ? 'minutes' : 'hours'}
              </Text>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Duration: </Text>
                {durationOptions.find(d => d.value === duration)?.label}
              </Text>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Creator Stake: </Text>
                {creatorStake} SOL
              </Text>
              <Text variant="bodyMedium" style={styles.previewText}>
                <Text style={styles.previewLabel}>Ends: </Text>
                {calculateEndTime()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleCreateMarket}
            loading={loading}
            disabled={loading || !description.trim() || !targetValue.trim()}
            style={styles.createButton}
          >
            {loading ? 'Creating...' : 'Create Market'}
          </Button>
        </View>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#7f8c8d',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  textInput: {
    marginTop: 8,
  },
  segmentedContainer: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  endTimeText: {
    color: '#6200ee',
    fontWeight: '600',
    textAlign: 'center',
  },
  previewCard: {
    marginBottom: 24,
    elevation: 3,
    backgroundColor: '#f8f9fa',
  },
  previewContent: {
    marginTop: 8,
  },
  previewText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  previewLabel: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default CreateMarketScreen;
