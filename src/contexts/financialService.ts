
import { FinancialData, Currency } from './types';
import { toast } from 'sonner';
import { createDebtService } from '@/services/financial/debtService';
import { createRegisterService } from '@/services/financial/registerService';

export const createFinancialService = (
  setFinancial: React.Dispatch<React.SetStateAction<FinancialData>>
) => {
  const debtService = createDebtService(setFinancial);
  const registerService = createRegisterService(setFinancial);

  const updateSpotPrice = (price: number) => {
    if (price <= 0) {
      toast.error("Spot price must be greater than zero");
      return;
    }
    
    setFinancial(prev => ({ ...prev, spotPrice: price }));
    toast.success(`Gold spot price updated to $${price.toFixed(2)}`);
  };
  
  const addExpense = (expense: Omit<FinancialData["expenses"][0], "id">) => {
    const expenseWithId = {
      ...expense,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2)
    };
    
    setFinancial(prev => ({
      ...prev,
      expenses: [...prev.expenses, expenseWithId]
    }));
    
    toast.success(`Expense of ${expense.amount} ${expense.currency} added`);
  };

  const toggleItemFeature = (itemId: string, featured: boolean) => {
    setFinancial(prev => {
      const featuredItems = prev.featuredItems || [];
      
      if (featured && !featuredItems.includes(itemId)) {
        return {
          ...prev,
          featuredItems: [...featuredItems, itemId]
        };
      } else if (!featured) {
        return {
          ...prev,
          featuredItems: featuredItems.filter(id => id !== itemId)
        };
      }
      
      return prev;
    });
  };

  return {
    updateSpotPrice,
    addExpense,
    toggleItemFeature,
    ...debtService,
    ...registerService
  };
};
