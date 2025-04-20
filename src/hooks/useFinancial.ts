
import { useState } from 'react';
import { FinancialData, Currency, RegisterCashEntry, DEFAULT_FINANCIAL } from '@/contexts/types';
import { toast } from 'sonner';
import { Debt } from '@/utils/debtUtils';

export const useFinancial = () => {
  const [financial, setFinancial] = useState<FinancialData>(DEFAULT_FINANCIAL);

  const updateSpotPrice = (price: number) => {
    setFinancial(prev => ({ ...prev, spotPrice: price }));
    toast.success('Spot price updated');
  };

  const updateCashBalance = (currency: Currency, amount: number) => {
    setFinancial(prev => ({
      ...prev,
      cashBalance: {
        ...prev.cashBalance,
        [currency]: amount
      }
    }));
  };

  const addDebt = (debt: Debt) => {
    if (!debt.id) {
      debt.id = generateId();
    }
    
    if (debt.type === 'customer') {
      setFinancial(prev => ({
        ...prev,
        customerDebts: [...(prev.customerDebts || []), debt],
        customerDebt: (prev.customerDebt || 0) + debt.amount
      }));
    } else {
      setFinancial(prev => ({
        ...prev,
        borrowedDebts: [...(prev.borrowedDebts || []), debt],
        factoryDebt: (prev.factoryDebt || 0) + debt.amount
      }));
    }
  };

  const addRegisterCashEntry = (entry: Omit<RegisterCashEntry, "id" | "date">) => {
    const newEntry: RegisterCashEntry = {
      ...entry,
      id: generateId(),
      date: new Date().toISOString()
    };
    
    const registerKey = entry.registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
    
    setFinancial(prev => {
      const currentBalance = prev[registerKey]?.[entry.currency] || 0;
      const newBalance = entry.type === "deposit" 
        ? currentBalance + entry.amount 
        : Math.max(0, currentBalance - entry.amount);
        
      return {
        ...prev,
        [registerKey]: {
          ...(prev[registerKey] || {}),
          [entry.currency]: newBalance
        },
        registerCashEntries: [...(prev.registerCashEntries || []), newEntry]
      };
    });
    
    toast.success(`Cash ${entry.type} to ${entry.registerType} register recorded`);
  };

  const updateFinancial = (updates: Partial<FinancialData>) => {
    setFinancial(prev => ({ ...prev, ...updates }));
  };

  return {
    financial,
    setFinancial,
    updateSpotPrice,
    updateCashBalance,
    addDebt,
    addRegisterCashEntry,
    updateFinancial,
  };
};

// Helper function to generate ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
