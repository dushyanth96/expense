import { Expense } from './storage';

export const getTodayTotal = (expenses: Expense[]): number => {
  const today = new Date().toISOString().split('T')[0];
  return expenses
    .filter(exp => exp.date === today)
    .reduce((sum, exp) => sum + exp.amount, 0);
};

export const getMonthTotal = (expenses: Expense[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);
};

export const getCategoryTotals = (expenses: Expense[]): Record<string, number> => {
  const totals: Record<string, number> = {
    Food: 0,
    Travel: 0,
    Bills: 0,
    Misc: 0,
  };

  expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });

  return totals;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
