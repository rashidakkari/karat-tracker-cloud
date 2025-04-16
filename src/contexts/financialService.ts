
import { FinancialData, Currency } from './types';
import { toast } from 'sonner';
import { createDebtRecord, Debt, recordDebtPayment } from '@/utils/debtUtils';

// Extended financial data type
interface ExtendedFinancialData extends FinancialData {
  wholesaleBalance?: { [key in Currency]: number };
  retailBalance?: { [key in Currency]: number };
  customerDebts?: Debt[];
  borrowedDebts?: Debt[];
}

export const createFinancialService = (
  setFinancial: React.Dispatch<React.SetStateAction<ExtendedFinancialData>>
) => {
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
  
  const updateCashBalance = (currency: Currency, amount: number) => {
    setFinancial(prev => ({
      ...prev,
      cashBalance: {
        ...prev.cashBalance,
        [currency]: Math.max(0, (prev.cashBalance[currency] || 0) + amount)
      }
    }));
    
    const action = amount >= 0 ? "added to" : "removed from";
    toast.success(`${Math.abs(amount)} ${currency} ${action} cash balance`);
  };
  
  const updateRegisterBalance = (
    registerType: "wholesale" | "retail",
    currency: Currency,
    amount: number
  ) => {
    const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
    
    setFinancial(prev => {
      const currentBalance = prev[registerKey]?.[currency] || 0;
      const newBalance = Math.max(0, currentBalance + amount);
      
      return {
        ...prev,
        [registerKey]: {
          ...(prev[registerKey] || {}),
          [currency]: newBalance
        }
      };
    });
    
    const action = amount >= 0 ? "added to" : "removed from";
    toast.success(`${Math.abs(amount)} ${currency} ${action} ${registerType} register`);
  };
  
  const updateCustomerDebt = (amount: number) => {
    setFinancial(prev => ({
      ...prev,
      customerDebt: Math.max(0, prev.customerDebt + amount)
    }));
    
    if (amount > 0) {
      toast.info(`Customer debt increased by ${amount}`);
    } else {
      toast.success(`Customer debt reduced by ${Math.abs(amount)}`);
    }
  };
  
  const updateFactoryDebt = (amount: number) => {
    setFinancial(prev => ({
      ...prev,
      factoryDebt: Math.max(0, prev.factoryDebt + amount)
    }));
    
    if (amount > 0) {
      toast.info(`Borrowed debt increased by ${amount}`);
    } else {
      toast.success(`Borrowed debt reduced by ${Math.abs(amount)}`);
    }
  };
  
  // Add a new debt
  const addDebt = (
    personName: string,
    contactInfo: string | undefined,
    amount: number,
    currency: string,
    description: string,
    type: 'customer' | 'borrowed',
    dueDate?: string
  ) => {
    const newDebt = createDebtRecord(
      personName,
      contactInfo,
      amount,
      currency,
      description,
      type,
      dueDate
    );
    
    setFinancial(prev => {
      if (type === 'customer') {
        return {
          ...prev,
          customerDebts: [...(prev.customerDebts || []), newDebt],
          customerDebt: (prev.customerDebt || 0) + amount
        };
      } else {
        return {
          ...prev,
          borrowedDebts: [...(prev.borrowedDebts || []), newDebt],
          factoryDebt: (prev.factoryDebt || 0) + amount
        };
      }
    });
    
    toast.success(`${type === 'customer' ? 'Customer' : 'Borrowed'} debt recorded`);
    return newDebt;
  };
  
  // Record a payment for a debt
  const recordPayment = (debtId: string, amount: number, type: 'customer' | 'borrowed') => {
    setFinancial(prev => {
      if (type === 'customer') {
        const debts = prev.customerDebts || [];
        const debtIndex = debts.findIndex(d => d.id === debtId);
        
        if (debtIndex === -1) {
          toast.error("Debt not found");
          return prev;
        }
        
        const updatedDebt = recordDebtPayment(debts[debtIndex], amount);
        const updatedDebts = [...debts];
        updatedDebts[debtIndex] = updatedDebt;
        
        // Update total customerDebt value
        const remainingDebt = amount > debts[debtIndex].amount ? 0 : debts[debtIndex].amount - amount;
        const debtReduction = debts[debtIndex].amount - remainingDebt;
        
        return {
          ...prev,
          customerDebts: updatedDebts,
          customerDebt: Math.max(0, (prev.customerDebt || 0) - debtReduction)
        };
      } else {
        const debts = prev.borrowedDebts || [];
        const debtIndex = debts.findIndex(d => d.id === debtId);
        
        if (debtIndex === -1) {
          toast.error("Debt not found");
          return prev;
        }
        
        const updatedDebt = recordDebtPayment(debts[debtIndex], amount);
        const updatedDebts = [...debts];
        updatedDebts[debtIndex] = updatedDebt;
        
        // Update total factoryDebt value
        const remainingDebt = amount > debts[debtIndex].amount ? 0 : debts[debtIndex].amount - amount;
        const debtReduction = debts[debtIndex].amount - remainingDebt;
        
        return {
          ...prev,
          borrowedDebts: updatedDebts,
          factoryDebt: Math.max(0, (prev.factoryDebt || 0) - debtReduction)
        };
      }
    });
    
    toast.success(`Payment recorded for ${type === 'customer' ? 'customer' : 'borrowed'} debt`);
  };

  return {
    updateSpotPrice,
    addExpense,
    updateCashBalance,
    updateCustomerDebt,
    updateFactoryDebt,
    updateRegisterBalance,
    addDebt,
    recordPayment
  };
};
