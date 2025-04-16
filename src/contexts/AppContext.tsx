
import React, { createContext, useContext, useEffect, useState } from "react";
import { InventoryItem, Transaction, FinancialData, STORAGE_KEYS, DEFAULT_FINANCIAL, Currency, RegisterCashEntry } from './types';
import { createInventoryService, calculateEquivalent24k } from './inventoryService';
import { createTransactionService } from './transactionService';
import { createFinancialService } from './financialService';
import { toast } from "sonner";
import { calculateTransactionPrice } from "@/utils/goldCalculations";
import { Debt } from "@/utils/debtUtils";

// Extended financial data type
interface ExtendedFinancialData extends FinancialData {
  wholesaleBalance?: { [key in Currency]: number };
  retailBalance?: { [key in Currency]: number };
  customerDebts?: Debt[];
  borrowedDebts?: Debt[];
  registerCashEntries?: RegisterCashEntry[];
  featuredItems?: string[]; // Array of featured item IDs
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
  toggleItemFeature: (id: string, featured: boolean) => void;
  getFeaturedItems: () => InventoryItem[];
  
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
  addRegisterCashEntry: (entry: Omit<RegisterCashEntry, "id" | "date">) => void;
  
  // New debt management functions
  addDebtRecord: (
    personName: string,
    contactInfo: string | undefined,
    amount: number,
    currency: string,
    description: string,
    type: 'customer' | 'borrowed',
    dueDate?: string,
    goldAmount?: number,
    goldPurity?: string,
    goldWeightUnit?: string
  ) => Debt;
  recordDebtPayment: (debtId: string, amount: number, type: 'customer' | 'borrowed', goldAmount?: number, goldPurity?: string) => void;
  
  // Register management
  updateRegisterBalance: (
    registerType: "wholesale" | "retail",
    currency: Currency,
    amount: number
  ) => void;
  
  // Spot check functions
  initiateSpotCheck: () => void;
  
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
    borrowedDebts: [],
    registerCashEntries: [],
    featuredItems: []
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
  
  // Toggle featured status for inventory items
  const toggleItemFeature = (id: string, featured: boolean) => {
    setFinancial(prev => {
      const featuredItems = prev.featuredItems || [];
      
      if (featured) {
        // Add to featured items if not already there
        if (!featuredItems.includes(id)) {
          return {
            ...prev,
            featuredItems: [...featuredItems, id]
          };
        }
      } else {
        // Remove from featured items
        return {
          ...prev,
          featuredItems: featuredItems.filter(itemId => itemId !== id)
        };
      }
      
      return prev;
    });
  };
  
  // Get featured inventory items
  const getFeaturedItems = (): InventoryItem[] => {
    const featuredItemIds = financial.featuredItems || [];
    return inventory.filter(item => featuredItemIds.includes(item.id));
  };
  
  // Initiate spot check (navigate to spot check page)
  const initiateSpotCheck = () => {
    // This function will be a placeholder - the actual navigation will happen in the component
    console.log("Initiating spot check");
  };
  
  // Add register cash entry
  const addRegisterCashEntry = (entry: Omit<RegisterCashEntry, "id" | "date">) => {
    const newEntry: RegisterCashEntry = {
      ...entry,
      id: generateId(),
      date: new Date().toISOString()
    };
    
    // Update the register balance
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
            borrowedDebts: parsedFinancial.borrowedDebts || [],
            registerCashEntries: parsedFinancial.registerCashEntries || [],
            featuredItems: parsedFinancial.featuredItems || []
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
        addRegisterCashEntry,
        // Expose new debt management functions
        addDebtRecord: financialService.addDebt,
        recordDebtPayment: financialService.recordPayment,
        // Expose register management function
        updateRegisterBalance: financialService.updateRegisterBalance,
        // Feature item management
        toggleItemFeature,
        getFeaturedItems,
        // Spot check
        initiateSpotCheck,
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
