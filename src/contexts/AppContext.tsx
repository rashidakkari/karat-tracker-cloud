
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// Types for inventory items
export interface InventoryItem {
  id: string;
  type: "wholesale" | "retail";
  category: "bars" | "coins" | "jewelry";
  name: string;
  weight: number;
  weightUnit: "g" | "kg" | "oz";
  purity: "999.9" | "995" | "22K" | "21K" | "18K" | "14K" | "9K";
  quantity: number;
  dateAdded: string;
  barcode?: string;
  description?: string;
  equivalent24k: number; // Weight in 24K equivalent
}

// Types for transactions
export type PaymentMethod = "cash" | "gold" | "mixed";
export type Currency = "USD" | "EUR" | "GBP" | "CHF";

export interface Transaction {
  id: string;
  type: "buy" | "sell";
  itemId: string;
  quantity: number;
  dateTime: string;
  spotPrice: number;
  commission: number;
  commissionType: "percentage" | "flat" | "per_gram";
  paymentMethod: PaymentMethod;
  currency: Currency;
  totalPrice: number;
  cashAmount?: number;
  goldAmount?: number;
  customer?: string;
  notes?: string;
}

// Types for financial data
export interface FinancialData {
  spotPrice: number; // Current gold spot price
  cashBalance: { [key in Currency]: number };
  customerDebt: number;
  factoryDebt: number;
  expenses: {
    id: string;
    category: string;
    amount: number;
    currency: Currency;
    date: string;
    description: string;
  }[];
}

// Main app context type
interface AppContextType {
  inventory: InventoryItem[];
  transactions: Transaction[];
  financial: FinancialData;
  
  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, "id" | "dateAdded" | "equivalent24k">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id" | "dateTime">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  
  // Financial actions
  updateSpotPrice: (price: number) => void;
  addExpense: (expense: Omit<FinancialData["expenses"][0], "id">) => void;
  updateCashBalance: (currency: Currency, amount: number) => void;
  updateCustomerDebt: (amount: number) => void;
  updateFactoryDebt: (amount: number) => void;
  
  // Utility
  isLoading: boolean;
  calculateEquivalent24k: (weight: number, purity: InventoryItem["purity"]) => number;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  inventory: "karatcloud_inventory",
  transactions: "karatcloud_transactions",
  financial: "karatcloud_financial"
};

// Default values for financial data
const DEFAULT_FINANCIAL: FinancialData = {
  spotPrice: 2000, // Default placeholder spot price (USD per troy ounce)
  cashBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
  customerDebt: 0,
  factoryDebt: 0,
  expenses: []
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financial, setFinancial] = useState<FinancialData>(DEFAULT_FINANCIAL);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load inventory
        const storedInventory = localStorage.getItem(STORAGE_KEYS.inventory);
        if (storedInventory) {
          setInventory(JSON.parse(storedInventory));
        }
        
        // Load transactions
        const storedTransactions = localStorage.getItem(STORAGE_KEYS.transactions);
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }
        
        // Load financial data
        const storedFinancial = localStorage.getItem(STORAGE_KEYS.financial);
        if (storedFinancial) {
          setFinancial(JSON.parse(storedFinancial));
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        toast.error("Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.financial, JSON.stringify(financial));
    }
  }, [inventory, transactions, financial, isLoading]);
  
  // Helper function to generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Calculate 24K equivalent weight based on purity
  const calculateEquivalent24k = (weight: number, purity: InventoryItem["purity"]): number => {
    switch (purity) {
      case "999.9":
        return weight; // Pure gold
      case "995":
        return weight * 0.995; // 995 fine gold
      case "22K":
        return weight * 0.916; // 22K = 91.6% pure
      case "21K":
        return weight * 0.875; // 21K = 87.5% pure
      case "18K":
        return weight * 0.75; // 18K = 75% pure
      case "14K":
        return weight * 0.583; // 14K = 58.3% pure
      case "9K":
        return weight * 0.375; // 9K = 37.5% pure
      default:
        return weight;
    }
  };
  
  // Inventory actions
  const addInventoryItem = (item: Omit<InventoryItem, "id" | "dateAdded" | "equivalent24k">) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      equivalent24k: calculateEquivalent24k(item.weight, item.purity)
    };
    
    setInventory(prev => [...prev, newItem]);
    toast.success(`Added ${item.name} to inventory`);
  };
  
  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          // Recalculate 24K equivalent if weight or purity changed
          if (updates.weight || updates.purity) {
            updatedItem.equivalent24k = calculateEquivalent24k(
              updates.weight || item.weight,
              updates.purity || item.purity
            );
          }
          return updatedItem;
        }
        return item;
      })
    );
    toast.success("Inventory item updated");
  };
  
  const removeInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    toast.success("Inventory item removed");
  };
  
  // Transaction actions
  const addTransaction = (transaction: Omit<Transaction, "id" | "dateTime">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      dateTime: new Date().toISOString()
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update inventory based on transaction
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      if (transaction.type === "buy") {
        // Adding to inventory
        updateInventoryItem(item.id, { 
          quantity: item.quantity + transaction.quantity 
        });
      } else if (transaction.type === "sell") {
        // Removing from inventory
        if (item.quantity >= transaction.quantity) {
          updateInventoryItem(item.id, { 
            quantity: item.quantity - transaction.quantity 
          });
        } else {
          toast.error("Not enough quantity in inventory");
        }
      }
    }
    
    toast.success(`Transaction ${transaction.type === "buy" ? "purchase" : "sale"} recorded`);
  };
  
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    toast.success("Transaction updated");
  };
  
  const removeTransaction = (id: string) => {
    // Find the transaction to be removed
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;
    
    // Revert inventory changes
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      if (transaction.type === "buy") {
        // Remove from inventory what was added
        updateInventoryItem(item.id, { 
          quantity: Math.max(0, item.quantity - transaction.quantity)
        });
      } else if (transaction.type === "sell") {
        // Add back to inventory what was sold
        updateInventoryItem(item.id, { 
          quantity: item.quantity + transaction.quantity 
        });
      }
    }
    
    // Remove the transaction
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success("Transaction removed and inventory adjusted");
  };
  
  // Financial actions
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
  
  return (
    <AppContext.Provider
      value={{
        inventory,
        transactions,
        financial,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        addTransaction,
        updateTransaction,
        removeTransaction,
        updateSpotPrice,
        addExpense,
        updateCashBalance,
        updateCustomerDebt,
        updateFactoryDebt,
        isLoading,
        calculateEquivalent24k
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
