
import { Debt } from '@/utils/debtUtils';
import { toast } from 'sonner';

export const createDebtService = (
  setFinancial: React.Dispatch<React.SetStateAction<any>>
) => {
  const addDebt = (debt: Debt) => {
    if (!debt.id) {
      debt.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    setFinancial(prev => {
      if (debt.type === 'customer') {
        return {
          ...prev,
          customerDebts: [...(prev.customerDebts || []), debt],
          customerDebt: (prev.customerDebt || 0) + debt.amount
        };
      } else {
        return {
          ...prev,
          borrowedDebts: [...(prev.borrowedDebts || []), debt],
          factoryDebt: (prev.factoryDebt || 0) + debt.amount
        };
      }
    });
    
    toast.success(`${debt.type === 'customer' ? 'Customer' : 'Borrowed'} debt recorded`);
  };

  const recordPayment = (debtId: string, amount: number, type: 'customer' | 'borrowed') => {
    setFinancial(prev => {
      const debtList = type === 'customer' ? prev.customerDebts : prev.borrowedDebts;
      const debtIndex = debtList.findIndex(d => d.id === debtId);
      
      if (debtIndex === -1) {
        toast.error("Debt not found");
        return prev;
      }
      
      const updatedDebts = [...debtList];
      const remainingDebt = Math.max(0, updatedDebts[debtIndex].amount - amount);
      updatedDebts[debtIndex] = { ...updatedDebts[debtIndex], amount: remainingDebt };
      
      return {
        ...prev,
        [type === 'customer' ? 'customerDebts' : 'borrowedDebts']: updatedDebts,
        [type === 'customer' ? 'customerDebt' : 'factoryDebt']: 
          Math.max(0, prev[type === 'customer' ? 'customerDebt' : 'factoryDebt'] - amount)
      };
    });
    
    toast.success(`Payment recorded for ${type} debt`);
  };

  return { addDebt, recordPayment };
};
