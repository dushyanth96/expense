import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getExpenses, deleteExpense, Expense } from '@/utils/storage';
import { formatCurrency } from '@/utils/calculations';
import { Filter, Trash2, FileText } from 'lucide-react-native';

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Misc'] as const;

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    const data = await getExpenses();
    const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(sorted);
    filterExpenses(sorted, selectedCategory);
  };

  const filterExpenses = (data: Expense[], category: string) => {
    if (category === 'All') {
      setFilteredExpenses(data);
    } else {
      setFilteredExpenses(data.filter(exp => exp.category === category));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterExpenses(expenses, category);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = () => {
      deleteExpense(id).then(() => {
        loadExpenses();
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderExpense = ({ item }: { item: Expense }) => {
    const categoryColors: Record<string, string> = {
      Food: '#ef4444',
      Travel: '#3b82f6',
      Bills: '#f59e0b',
      Misc: '#8b5cf6',
    };

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColors[item.category] + '20' },
              ]}>
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: categoryColors[item.category] },
                ]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        {item.note && (
          <View style={styles.noteContainer}>
            <FileText size={14} color="#6b7280" />
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Filter size={20} color="#6b7280" />
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item && styles.filterButtonActive,
              ]}
              onPress={() => handleCategoryChange(item)}>
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item && styles.filterTextActive,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No expenses found</Text>
          <Text style={styles.emptySubtext}>
            {selectedCategory === 'All'
              ? 'Add your first expense to get started'
              : `No expenses in ${selectedCategory} category`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterList: {
    paddingLeft: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  deleteButton: {
    padding: 8,
  },
  expenseDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
