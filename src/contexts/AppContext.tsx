
import React, { createContext, useContext, useEffect, useState } from "react";
import { InventoryItem, Transaction, FinancialData, STORAGE_KEYS, DEFAULT_FINANCIAL, Currency } from './types';
import { createInventoryService, calculateEquivalent24k } from './inventoryService';
import { createTransactionService } from './transactionService';
import { createFinancialService } from './financialService';
import { toast } from "sonner";
import { calculateTransactionPrice } from "@/utils/goldCalculations";

// Extended financial data type
interface ExtendedFinancialData extends FinancialData {
  wholesaleBalance?: { [key in Currency]: number };
  retailBalance?: { [key in Currency]: number };
  customerDebts?: any[];
  borrowedDebts?: any[];
}

// Main app context type
interface AppContextType {
  inventory: InventoryItem[];
  transactions: Transaction[];
  financial: ExtendedFinancialData;
  
  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, "id" | "dateAdded" | "equivalent24k">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id" | "dateTime"> & { registerType?: string }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  calculatePrice: (
    type: 'buy' | 'sell',
    category: string,
    spotPrice: number,
    weight: number,
    weightUnit: 'g' | 'oz' | 'tola' | 'baht' | 'kg',
    purity: "999.9" | "995" | "22K" | "21K" | "18K" | "14K" | "9K",
    commissionRate: number,
    commissionType: 'percentage' | 'flat' | 'per_gram'
  ) => number;
  
  // Financial actions
  updateSpotPrice: (price: number) => void;
  addExpense: (expense: Omit<FinancialData["expenses"][0], "id">) => void;
  updateCashBalance: (currency: Currency, amount: number) => void;
  updateCustomerDebt: (amount: number) => void;
  updateFactoryDebt: (amount: number) => void;
  updateFinancial: (updates: Partial<ExtendedFinancialData>) => void;
  addDebt: (debt: any) => void;
  
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
  const [financial, setFinancial] = useState<ExtendedFinancialData>({
    ...DEFAULT_FINANCIAL,
    wholesaleBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
    retailBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
    customerDebts: [],
    borrowedDebts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Update financial data
  const updateFinancial = (updates: Partial<ExtendedFinancialData>) => {
    setFinancial(prev => ({ ...prev, ...updates }));
  };
  
  // Add debt record
  const addDebt = (debt: any) => {
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
  
  // Create services
  const inventoryService = createInventoryService(setInventory);
  
  const transactionService = createTransactionService(
    setTransactions,
    inventory,
    inventoryService.updateInventoryItem,
    updateFinancial,
    financial,
    addDebt
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
          const parsedFinancial = JSON.parse(storedFinancial);
          setFinancial({
            ...parsedFinancial,
            // Ensure we have the new fields
            wholesaleBalance: parsedFinancial.wholesaleBalance || { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
            retailBalance: parsedFinancial.retailBalance || { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
            customerDebts: parsedFinancial.customerDebts || [],
            borrowedDebts: parsedFinancial.borrowedDebts || []
          });
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
  
  // Wrapper for calculatePrice that safely handles category param
  const calculatePrice = (
    type: 'buy' | 'sell',
    category: string,
    spotPrice: number,
    weight: number,
    weightUnit: 'g' | 'oz' | 'tola' | 'baht' | 'kg',
    purity: "999.9" | "995" | "22K" | "21K" | "18K" | "14K" | "9K",
    commissionRate: number,
    commissionType: 'percentage' | 'flat' | 'per_gram'
  ) => {
    // Normalize category to match expected values
    let normalizedCategory: 'bars' | 'coins' | 'jewelry';
    
    if (category.toLowerCase().includes('bar')) {
      normalizedCategory = 'bars';
    } else if (category.toLowerCase().includes('coin')) {
      normalizedCategory = 'coins';
    } else {
      normalizedCategory = 'jewelry';
    }
    
    return calculateTransactionPrice(
      type,
      normalizedCategory,
      spotPrice,
      weight,
      weightUnit as any,
      purity,
      commissionRate,
      commissionType as any
    );
  };
  
  return (
    <AppContext.Provider
      value={{
        inventory,
        transactions,
        financial,
        ...inventoryService,
        ...transactionService,
        calculatePrice,
        ...financialService,
        updateFinancial,
        addDebt,
        isLoading,
        calculateEquivalent24k
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Helper function to generate ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

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
