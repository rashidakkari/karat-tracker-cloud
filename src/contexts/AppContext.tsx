
import React, { createContext, useContext, useEffect, useState } from "react";
import { InventoryItem, Transaction, FinancialData, STORAGE_KEYS, DEFAULT_FINANCIAL, Currency } from './types';
import { createInventoryService, calculateEquivalent24k } from './inventoryService';
import { createTransactionService } from './transactionService';
import { createFinancialService } from './financialService';
import { toast } from "sonner";

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

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financial, setFinancial] = useState<FinancialData>(DEFAULT_FINANCIAL);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create services
  const inventoryService = createInventoryService(setInventory);
  
  const transactionService = createTransactionService(
    setTransactions,
    inventory,
    inventoryService.updateInventoryItem
  );
  
  const financialService = createFinancialService(setFinancial);
  
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
  
  return (
    <AppContext.Provider
      value={{
        inventory,
        transactions,
        financial,
        ...inventoryService,
        ...transactionService,
        ...financialService,
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

// Re-export types for convenience
export type { InventoryItem, Transaction, FinancialData, PaymentMethod, Currency } from './types';
