
// Local storage service for KaratCloud
import { InventoryItem, InventoryRegister } from '../models/inventory';
import { Transaction, Expense, Debt } from '../models/transactions';

// Encryption utility for securing sensitive data
const encryptData = (data: any, password: string): string => {
  // In a real application, we would use a proper encryption library
  // For now, we'll just use a simple encoding as a placeholder
  const encoded = btoa(JSON.stringify(data));
  return encoded;
};

const decryptData = (encryptedData: string, password: string): any => {
  // In a real application, we would use a proper decryption method
  // For now, we'll just decode the data
  try {
    const decoded = JSON.parse(atob(encryptedData));
    return decoded;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

// Generic storage handler
const storageHandler = {
  save: <T>(key: string, data: T, secure: boolean = false, password?: string): void => {
    try {
      const dataToStore = secure && password 
        ? encryptData(data, password)
        : JSON.stringify(data);
      
      localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error(`Error saving data to localStorage [${key}]:`, error);
    }
  },
  
  get: <T>(key: string, secure: boolean = false, password?: string): T | null => {
    try {
      const storedData = localStorage.getItem(key);
      
      if (!storedData) return null;
      
      if (secure && password) {
        return decryptData(storedData, password);
      }
      
      return JSON.parse(storedData) as T;
    } catch (error) {
      console.error(`Error retrieving data from localStorage [${key}]:`, error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data from localStorage [${key}]:`, error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Application-specific storage keys
const STORAGE_KEYS = {
  AUTH: 'karatcloud_auth',
  WHOLESALE_REGISTER: 'karatcloud_wholesale',
  RETAIL_REGISTER: 'karatcloud_retail',
  TRANSACTIONS: 'karatcloud_transactions',
  EXPENSES: 'karatcloud_expenses',
  DEBTS: 'karatcloud_debts',
  SETTINGS: 'karatcloud_settings',
  SPOT_PRICE: 'karatcloud_spot_price',
  EXCHANGE_RATES: 'karatcloud_exchange_rates'
};

// Authentication storage
export const authStorage = {
  saveAuth: (data: { username: string, passwordHash: string }, secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.AUTH, data, secure, password);
  },
  
  getAuth: (secure: boolean = true, password?: string): { username: string, passwordHash: string } | null => {
    return storageHandler.get(STORAGE_KEYS.AUTH, secure, password);
  },
  
  clearAuth: (): void => {
    storageHandler.remove(STORAGE_KEYS.AUTH);
  }
};

// Inventory storage
export const inventoryStorage = {
  saveWholesaleRegister: (data: InventoryRegister, secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.WHOLESALE_REGISTER, data, secure, password);
  },
  
  getWholesaleRegister: (secure: boolean = true, password?: string): InventoryRegister | null => {
    return storageHandler.get(STORAGE_KEYS.WHOLESALE_REGISTER, secure, password);
  },
  
  saveRetailRegister: (data: InventoryRegister, secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.RETAIL_REGISTER, data, secure, password);
  },
  
  getRetailRegister: (secure: boolean = true, password?: string): InventoryRegister | null => {
    return storageHandler.get(STORAGE_KEYS.RETAIL_REGISTER, secure, password);
  }
};

// Transaction storage
export const transactionStorage = {
  saveTransactions: (data: Transaction[], secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.TRANSACTIONS, data, secure, password);
  },
  
  getTransactions: (secure: boolean = true, password?: string): Transaction[] | null => {
    return storageHandler.get(STORAGE_KEYS.TRANSACTIONS, secure, password) || [];
  },
  
  addTransaction: (transaction: Transaction, secure: boolean = true, password?: string): void => {
    const transactions = transactionStorage.getTransactions(secure, password) || [];
    transactions.push(transaction);
    transactionStorage.saveTransactions(transactions, secure, password);
  },
  
  updateTransaction: (updatedTransaction: Transaction, secure: boolean = true, password?: string): boolean => {
    const transactions = transactionStorage.getTransactions(secure, password) || [];
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      transactionStorage.saveTransactions(transactions, secure, password);
      return true;
    }
    
    return false;
  },
  
  deleteTransaction: (transactionId: string, secure: boolean = true, password?: string): boolean => {
    const transactions = transactionStorage.getTransactions(secure, password) || [];
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    
    if (filteredTransactions.length < transactions.length) {
      transactionStorage.saveTransactions(filteredTransactions, secure, password);
      return true;
    }
    
    return false;
  }
};

// Expense storage
export const expenseStorage = {
  saveExpenses: (data: Expense[], secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.EXPENSES, data, secure, password);
  },
  
  getExpenses: (secure: boolean = true, password?: string): Expense[] | null => {
    return storageHandler.get(STORAGE_KEYS.EXPENSES, secure, password) || [];
  },
  
  addExpense: (expense: Expense, secure: boolean = true, password?: string): void => {
    const expenses = expenseStorage.getExpenses(secure, password) || [];
    expenses.push(expense);
    expenseStorage.saveExpenses(expenses, secure, password);
  }
};

// Debt storage
export const debtStorage = {
  saveDebts: (data: Debt[], secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.DEBTS, data, secure, password);
  },
  
  getDebts: (secure: boolean = true, password?: string): Debt[] | null => {
    return storageHandler.get(STORAGE_KEYS.DEBTS, secure, password) || [];
  },
  
  addDebt: (debt: Debt, secure: boolean = true, password?: string): void => {
    const debts = debtStorage.getDebts(secure, password) || [];
    debts.push(debt);
    debtStorage.saveDebts(debts, secure, password);
  },
  
  updateDebt: (updatedDebt: Debt, secure: boolean = true, password?: string): boolean => {
    const debts = debtStorage.getDebts(secure, password) || [];
    const index = debts.findIndex(d => d.id === updatedDebt.id);
    
    if (index !== -1) {
      debts[index] = updatedDebt;
      debtStorage.saveDebts(debts, secure, password);
      return true;
    }
    
    return false;
  }
};

// Settings storage
export const settingsStorage = {
  saveSettings: (data: any, secure: boolean = true, password?: string): void => {
    storageHandler.save(STORAGE_KEYS.SETTINGS, data, secure, password);
  },
  
  getSettings: (secure: boolean = true, password?: string): any => {
    return storageHandler.get(STORAGE_KEYS.SETTINGS, secure, password);
  }
};

// Market data storage
export const marketDataStorage = {
  saveSpotPrice: (price: number): void => {
    storageHandler.save(STORAGE_KEYS.SPOT_PRICE, {
      price,
      timestamp: new Date().toISOString()
    });
  },
  
  getSpotPrice: (): { price: number, timestamp: string } | null => {
    return storageHandler.get(STORAGE_KEYS.SPOT_PRICE);
  },
  
  saveExchangeRates: (rates: Record<string, number>): void => {
    storageHandler.save(STORAGE_KEYS.EXCHANGE_RATES, {
      rates,
      timestamp: new Date().toISOString()
    });
  },
  
  getExchangeRates: (): { rates: Record<string, number>, timestamp: string } | null => {
    return storageHandler.get(STORAGE_KEYS.EXCHANGE_RATES);
  }
};

// Export a combined service
export const localStorageService = {
  auth: authStorage,
  inventory: inventoryStorage,
  transactions: transactionStorage,
  expenses: expenseStorage,
  debts: debtStorage,
  settings: settingsStorage,
  marketData: marketDataStorage
};

export default localStorageService;
