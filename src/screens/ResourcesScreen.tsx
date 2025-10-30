import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Card, Searchbar, Chip, Button, IconButton } from 'react-native-paper';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'research' | 'thread';
  category: string;
  description: string;
  url?: string;
  duration?: string;
  author?: string;
  date?: string;
}

const ResourcesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'sleep-hygiene', label: 'Sleep Hygiene' },
    { id: 'rem-sleep', label: 'REM Sleep' },
    { id: 'sleep-disorders', label: 'Sleep Disorders' },
    { id: 'technology', label: 'Sleep Tech' },
    { id: 'research', label: 'Research' }
  ];

  // Sample resources data
  const sampleResources: Resource[] = [
    {
      id: '1',
      title: 'The Science of REM Sleep',
      type: 'video',
      category: 'rem-sleep',
      description: 'Comprehensive overview of REM sleep cycles and their importance for cognitive function.',
      duration: '12:34',
      author: 'Sleep Research Institute'
    },
    {
      id: '2',
      title: '10 Sleep Hygiene Tips That Actually Work',
      type: 'article',
      category: 'sleep-hygiene',
      description: 'Evidence-based strategies to improve your sleep quality and consistency.',
      author: 'Dr. Sarah Johnson'
    },
    {
      id: '3',
      title: 'Impact of Blue Light on Sleep Quality',
      type: 'research',
      category: 'research',
      description: 'Peer-reviewed study examining the effects of screen time on sleep patterns.',
      author: 'Journal of Sleep Medicine'
    },
    {
      id: '4',
      title: 'Best Sleep Tracking Devices 2024',
      type: 'thread',
      category: 'technology',
      description: 'Community discussion about the most accurate sleep tracking wearables.',
      author: 'SleepTech Community'
    }
  ];

  useEffect(() => {
    setResources(sampleResources);
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'article': return 'file-document';
      case 'research': return 'book-open';
      case 'thread': return 'forum';
      default: return 'file';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video': return '#FF6B6B';
      case 'article': return '#4ECDC4';
      case 'research': return '#45B7D1';
      case 'thread': return '#96CEB4';
      default: return '#95A5A6';
    }
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <Card style={styles.resourceCard}>
      <Card.Content>
        <View style={styles.resourceHeader}>
          <IconButton
            icon={getResourceIcon(item.type)}
            iconColor={getResourceColor(item.type)}
            size={24}
          />
          <View style={styles.resourceInfo}>
            <Text variant="titleMedium" style={styles.resourceTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.resourceMeta}>
              {item.author} {item.duration && `• ${item.duration}`}
            </Text>
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.resourceDescription}>
          {item.description}
        </Text>
        <View style={styles.resourceActions}>
          <Chip
            mode="outlined"
            compact
            style={[styles.categoryChip, { borderColor: getResourceColor(item.type) }]}
          >
            {categories.find(cat => cat.id === item.category)?.label}
          </Chip>
          <Button mode="text" compact>
            View
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Sleep Resources
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Curated content to improve your sleep
        </Text>
      </View>

      <Searchbar
        placeholder="Search resources..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.categoryChip}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredResources}
        renderItem={renderResource}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.resourcesList}
        showsVerticalScrollIndicator={false}
      />
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
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  resourcesList: {
    padding: 16,
    paddingTop: 0,
  },
  resourceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 8,
  },
  resourceTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  resourceMeta: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  resourceDescription: {
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ResourcesScreen;
