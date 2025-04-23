
import { FinancialData } from "@/contexts/types";

/**
 * Summarizes expenses by category
 */
export const summarizeExpensesByCategory = (
  expenses: FinancialData["expenses"]
): Record<string, number> => {
  return expenses.reduce((summary, expense) => {
    const category = expense.category;
    if (!summary[category]) {
      summary[category] = 0;
    }
    summary[category] += expense.amount;
    return summary;
  }, {} as Record<string, number>);
};
