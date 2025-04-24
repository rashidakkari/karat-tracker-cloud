
import { useEffect, useState } from 'react';
import { Transaction } from '@/contexts/types';

// Define an interface for the sales data
interface SalesData {
  date: string;
  salesCount: number;
  totalAmount: number;
}

// Define an interface for the profit data
interface ProfitData {
  date: string;
  profit: number;
}

export function useReportData(transactions: Transaction[]) {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  
  useEffect(() => {
    // Process transactions to get sales data
    const salesByDate = transactions.reduce((acc: Record<string, SalesData>, transaction) => {
      // Only count sell transactions
      if (transaction.type === 'sell') {
        // Use the dateTime field instead of date
        const date = transaction.dateTime.substring(0, 10); // Get just the YYYY-MM-DD part
        
        if (!acc[date]) {
          acc[date] = {
            date,
            salesCount: 0,
            totalAmount: 0
          };
        }
        
        acc[date].salesCount += 1;
        // Use totalPrice instead of totalAmount
        acc[date].totalAmount += transaction.totalPrice || 0;
      }
      return acc;
    }, {});
    
    const salesResult = Object.values(salesByDate);
    setSalesData(salesResult);
    
    // Process transactions to get profit data
    const profitByDate = transactions.reduce((acc: Record<string, ProfitData>, transaction) => {
      // Calculate profit for each transaction
      const profit = calculateProfit(transaction);
      if (profit) {
        // Use the dateTime field instead of date
        const date = transaction.dateTime.substring(0, 10); // Get just the YYYY-MM-DD part
        
        if (!acc[date]) {
          acc[date] = {
            date,
            profit: 0
          };
        }
        
        // Only add profit for sell transactions
        if (transaction.type === 'sell') {
          // We're assuming profit is stored elsewhere or calculated
          acc[date].profit += profit;
        }
      }
      return acc;
    }, {});
    
    const profitResult = Object.values(profitByDate);
    setProfitData(profitResult);
    
  }, [transactions]);
  
  // Calculate profit based on transaction information
  const calculateProfit = (transaction: Transaction): number => {
    // This is a placeholder for profit calculation
    // In a real app, you'd calculate based on the sale price minus the cost price
    // For now, we'll just estimate as 20% of the transaction total if it's a sell transaction
    if (transaction.type === 'sell') {
      return transaction.totalPrice * 0.2;
    }
    return 0;
  };
  
  return {
    salesData,
    profitData
  };
}
