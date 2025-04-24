
import { RegisterCashEntry, Currency } from '@/contexts/types';
import { toast } from 'sonner';

export const createRegisterService = (
  setFinancial: React.Dispatch<React.SetStateAction<any>>
) => {
  const addRegisterCashEntry = (entry: Omit<RegisterCashEntry, "id" | "date">) => {
    const newEntry: RegisterCashEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      date: new Date().toISOString()
    };
    
    setFinancial(prev => {
      const registerKey = entry.registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
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

  const updateRegisterBalance = (
    registerType: "wholesale" | "retail",
    currency: Currency,
    amount: number
  ) => {
    const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
    
    setFinancial(prev => ({
      ...prev,
      [registerKey]: {
        ...(prev[registerKey] || {}),
        [currency]: Math.max(0, (prev[registerKey]?.[currency] || 0) + amount)
      }
    }));
    
    const action = amount >= 0 ? "added to" : "removed from";
    toast.success(`${Math.abs(amount)} ${currency} ${action} ${registerType} register`);
  };

  return { addRegisterCashEntry, updateRegisterBalance };
};
