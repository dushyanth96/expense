import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface PieChartProps {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  Food: '#ef4444',
  Travel: '#3b82f6',
  Bills: '#f59e0b',
  Misc: '#8b5cf6',
};

export default function PieChart({ data }: PieChartProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expenses yet</Text>
      </View>
    );
  }

  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const strokeWidth = 40;

  let currentAngle = -90;
  const segments = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const segment = {
        category,
        value,
        percentage,
        color: COLORS[category],
        startAngle: currentAngle,
        angle,
      };
      currentAngle += angle;
      return segment;
    });

  return (
    <View style={styles.container}>
      <Svg width="200" height="200" viewBox="0 0 200 200">
        <G rotation="0" origin="100, 100">
          {segments.map((segment, index) => {
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(segment.angle / 360) * circumference} ${circumference}`;
            const rotation = segment.startAngle + 90;

            return (
              <Circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                rotation={rotation}
                origin={`${centerX}, ${centerY}`}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: segment.color }]} />
            <Text style={styles.legendText}>
              {segment.category}: {segment.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
});
