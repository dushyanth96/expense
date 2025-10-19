import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Bills' | 'Misc';
  date: string;
  note?: string;
}

const STORAGE_KEY = 'expenses';

export const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const existing = await getExpenses();
    const updated = [...existing, expense];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const existing = await getExpenses();
    const updated = existing.filter(exp => exp.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const clearAllExpenses = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing expenses:', error);
    throw error;
  }
};
