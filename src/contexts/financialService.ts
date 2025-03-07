
import { FinancialData, Currency, generateId } from './types';
import { toast } from 'sonner';

export const createFinancialService = (
  setFinancial: React.Dispatch<React.SetStateAction<FinancialData>>
) => {
  const updateSpotPrice = (price: number) => {
    setFinancial(prev => ({ ...prev, spotPrice: price }));
    toast.success(`Spot price updated to $${price.toFixed(2)}`);
  };
  
  const addExpense = (expense: Omit<FinancialData["expenses"][0], "id">) => {
    const newExpense = { ...expense, id: generateId() };
    setFinancial(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
    toast.success("Expense recorded");
  };
  
  const updateCashBalance = (currency: Currency, amount: number) => {
    setFinancial(prev => ({
      ...prev,
      cashBalance: {
        ...prev.cashBalance,
        [currency]: amount
      }
    }));
    toast.success(`${currency} balance updated`);
  };
  
  const updateCustomerDebt = (amount: number) => {
    setFinancial(prev => ({ ...prev, customerDebt: amount }));
    toast.success("Customer debt updated");
  };
  
  const updateFactoryDebt = (amount: number) => {
    setFinancial(prev => ({ ...prev, factoryDebt: amount }));
    toast.success("Factory debt updated");
  };

  return {
    updateSpotPrice,
    addExpense,
    updateCashBalance,
    updateCustomerDebt,
    updateFactoryDebt
  };
};

export type FinancialService = ReturnType<typeof createFinancialService>;
