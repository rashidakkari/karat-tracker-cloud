
import { useState, useMemo } from 'react';
import { Transaction } from '@/contexts/types';
import { formatCurrency } from "@/utils/formatters";

export const useReportData = (transactions: Transaction[]) => {
  // Calculate monthly sales data
  const salesData = useMemo(() => {
    const salesByMonth: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      salesByMonth[monthKey] = 0;
    }
    
    // Aggregate sales by month
    transactions
      .filter(t => t.type === 'sale')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (salesByMonth[monthKey] !== undefined) {
          salesByMonth[monthKey] += transaction.totalAmount;
        }
      });
    
    return Object.entries(salesByMonth).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        total: value
      };
    });
  }, [transactions]);
  
  // Calculate transaction types distribution
  const transactionTypesData = useMemo(() => {
    const counts: Record<string, number> = { 
      sale: 0, 
      purchase: 0, 
      exchange: 0 
    };
    
    transactions.forEach(transaction => {
      if (counts[transaction.type] !== undefined) {
        counts[transaction.type]++;
      }
    });
    
    return Object.entries(counts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  }, [transactions]);
  
  // Calculate profit over time
  const profitData = useMemo(() => {
    const profitByMonth: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      profitByMonth[monthKey] = 0;
    }
    
    // Calculate profit
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (profitByMonth[monthKey] !== undefined) {
        if (transaction.type === 'sale') {
          profitByMonth[monthKey] += transaction.profit || 0;
        }
      }
    });
    
    return Object.entries(profitByMonth).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        profit: value
      };
    });
  }, [transactions]);

  return {
    salesData,
    transactionTypesData,
    profitData
  };
};
