import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const SCAN_HISTORY_KEY = 'scanHistory';
const CARD_WIDTH = 180;
const CARD_HEIGHT = 240;

export default function ScanHistory({ onSelectScan }: { onSelectScan: (scan: any) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadHistory();
  }, []);

  // Load scan history from AsyncStorage
  const loadHistory = async () => {
    try {
      const historyRaw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      const historyArr = historyRaw ? JSON.parse(historyRaw) : [];
      setHistory(historyArr);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setHistory([]);
    }
  };

  // Render each scan card
  const renderItem = ({ item }: { item: any }) => (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>  
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onSelectScan(item)}>
        <LinearGradient
          colors={['#00e67655', '#1de9b655', '#222']}
          style={styles.glow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageWrapper}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderImg} />
            )}
          </View>
          <Text style={styles.machineName} numberOfLines={1}>{item.machineName}</Text>
          <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!history.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No scan history yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        style={{ flexGrow: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 30,
    marginBottom: 10,
    height: CARD_HEIGHT,
  },
  cardContainer: {
    marginHorizontal: 10,
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#23272f',
    borderWidth: 1.5,
    borderColor: '#00e67655',
  },
  glow: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    borderRadius: 20,
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#111',
  },
  placeholderImg: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  machineName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_HEIGHT,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
}); 