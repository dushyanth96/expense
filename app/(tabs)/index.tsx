import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getExpenses } from '@/utils/storage';
import { getTodayTotal, getMonthTotal, getCategoryTotals, formatCurrency } from '@/utils/calculations';
import PieChart from '@/components/PieChart';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const expenses = await getExpenses();
    setTodayTotal(getTodayTotal(expenses));
    setMonthTotal(getMonthTotal(expenses));
    setCategoryTotals(getCategoryTotals(expenses));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your spending</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <DollarSign size={24} color="#10b981" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(todayTotal)}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Calendar size={24} color="#3b82f6" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(monthTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
        </View>
        <PieChart data={categoryTotals} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
});
