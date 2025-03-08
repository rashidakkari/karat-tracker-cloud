
import { Currency, FinancialData, Transaction } from "@/contexts/types";

/**
 * Calculates the total value of all inventory items based on current spot price
 */
export const calculateTotalInventoryValue = (
  inventory: any[], 
  spotPrice: number
): number => {
  return inventory.reduce((total, item) => {
    // Convert equivalent24k from grams to troy ounces
    const troyOunces = (item.equivalent24k || 0) / 31.1035;
    // Calculate value based on spot price (USD per troy oz)
    return total + (troyOunces * spotPrice * item.quantity);
  }, 0);
};

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

/**
 * Convert amount between currencies based on exchange rates
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: Record<Currency, number>
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert from source currency to USD first (if not already USD)
  const amountInUSD = fromCurrency === "USD" 
    ? amount 
    : amount / exchangeRates[fromCurrency];
  
  // Convert from USD to target currency (if not USD)
  return toCurrency === "USD" 
    ? amountInUSD 
    : amountInUSD * exchangeRates[toCurrency];
};
