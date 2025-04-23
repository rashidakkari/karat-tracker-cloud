
import { Transaction } from "@/contexts/types";

/**
 * Calculates profit from transactions within a date range
 */
export const calculateProfitInDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): number => {
  return transactions
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      return txDate >= startDate && txDate <= endDate && tx.type === "sell";
    })
    .reduce((total, tx) => {
      // For simplicity assuming we calculate profit as a percentage of selling price
      // In a real app you would calculate based on cost price vs selling price
      const estimatedProfit = tx.totalPrice * 0.15; // 15% profit margin as example
      return total + estimatedProfit;
    }, 0);
};
