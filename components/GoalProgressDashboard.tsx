import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';


const { width: screenWidth } = Dimensions.get('window');
const CHART_SIZE = Math.min(screenWidth - 80, 280);
const RADIUS = CHART_SIZE / 2 - 20;
const STROKE_WIDTH = 12;

interface HistoryDataPoint {
  date: string;
  value: number;
}

interface GoalProgressDashboardProps {
  goalTitle: string;
  currentValue: number;
  targetValue: number;
  historyData: HistoryDataPoint[];
}

export default function GoalProgressDashboard({
  goalTitle,
  currentValue,
  targetValue,
  historyData,
}: GoalProgressDashboardProps) {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const lineAnimation = useRef(new Animated.Value(0)).current;

  const progressPercentage = Math.min((currentValue / targetValue) * 100, 100);
  const circumference = 2 * Math.PI * RADIUS;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  useEffect(() => {
    // Animate progress ring
    Animated.timing(progressAnimation, {
      toValue: progressPercentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animate line graph
    Animated.timing(lineAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [currentValue, targetValue, progressPercentage, progressAnimation, lineAnimation]);

  // Prepare line graph data
  const maxValue = Math.max(...historyData.map(d => d.value), targetValue);
  const lineGraphPoints = historyData.map((point, index) => {
    const x = (index / (historyData.length - 1)) * (CHART_SIZE - 40);
    const y = CHART_SIZE - 40 - (point.value / maxValue) * (CHART_SIZE - 80);
    return { x, y };
  });

  // Create smooth line path
  const createSmoothLine = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (next) {
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        const cp2x = curr.x - (next.x - curr.x) * 0.5;
        const cp2y = curr.y;
        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  const linePath = createSmoothLine(lineGraphPoints);

  return (
    <View style={styles.container}>
      {/* Progress Ring Chart */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00e676" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#00ff88" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00e676" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#00e676" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* Background ring */}
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          
          {/* Progress ring with glow effect */}
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={RADIUS}
            stroke="url(#progressGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Inner glow ring */}
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={RADIUS - STROKE_WIDTH / 2}
            stroke="url(#glowGradient)"
            strokeWidth={2}
            fill="none"
          />
        </Svg>
        
        {/* Center progress text */}
        <View style={styles.centerText}>
          <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
      </View>

      {/* Progress stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentValue}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{targetValue}</Text>
          <Text style={styles.statLabel}>Target</Text>
        </View>
      </View>

      {/* Line Graph */}
      <View style={styles.lineGraphContainer}>
        <Text style={styles.graphTitle}>Progress Trend</Text>
        <View style={styles.graphContainer}>
          <Svg width={CHART_SIZE - 40} height={CHART_SIZE - 40}>
            <Defs>
              <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#00e676" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#00e676" stopOpacity="0.2" />
              </LinearGradient>
            </Defs>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <Line
                key={`grid-${i}`}
                x1={0}
                y1={i * ((CHART_SIZE - 40) / 4)}
                x2={CHART_SIZE - 40}
                y2={i * ((CHART_SIZE - 40) / 4)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            ))}
            
            {/* Progress line with glow */}
            <Line
              x1={lineGraphPoints[0]?.x || 0}
              y1={lineGraphPoints[0]?.y || 0}
              x2={lineGraphPoints[1]?.x || 0}
              y2={lineGraphPoints[1]?.y || 0}
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {lineGraphPoints.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill="#00e676"
                stroke="#000"
                strokeWidth={2}
              />
            ))}
          </Svg>
        </View>
        
        {/* Time labels */}
        <View style={styles.timeLabels}>
          {historyData.map((point, index) => (
            <Text key={index} style={styles.timeLabel}>
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00e676',
    textShadowColor: '#00e676',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00e676',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  lineGraphContainer: {
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
  },
});
