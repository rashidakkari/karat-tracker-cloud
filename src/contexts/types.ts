
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
  costPrice?: number;
  featured?: boolean; // Flag to feature item on dashboard
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
  customerPhone?: string;
  registerType?: "wholesale" | "retail";
  goldPurity?: string;
  goldWeightUnit?: "g" | "oz"; 
}

// Debt type
export interface Debt {
  id: string;
  personName: string;
  contactInfo?: string;
  amount: number;
  currency: string;
  goldAmount?: number;
  goldPurity?: string;
  goldWeightUnit?: string;
  date: string;
  dueDate?: string;
  description: string;
  status: 'pending' | 'partially_paid' | 'paid';
  partialPayments?: {
    date: string;
    amount: number;
    goldAmount?: number;
    goldPurity?: string;
  }[];
  type: 'customer' | 'borrowed';
}

// Register Cash Entry
export interface RegisterCashEntry {
  id: string;
  registerType: "wholesale" | "retail";
  currency: Currency;
  amount: number;
  date: string;
  description: string;
  type: "deposit" | "withdrawal";
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
  wholesaleBalance?: { [key in Currency]: number };
  retailBalance?: { [key in Currency]: number };
  customerDebts?: Debt[];
  borrowedDebts?: Debt[];
  registerCashEntries?: RegisterCashEntry[];
}

// Storage keys
export const STORAGE_KEYS = {
  inventory: "karatcloud_inventory",
  transactions: "karatcloud_transactions",
  financial: "karatcloud_financial"
};

// Default values for financial data
export const DEFAULT_FINANCIAL: FinancialData = {
  spotPrice: 2000, // Default placeholder spot price (USD per troy ounce)
  cashBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
  customerDebt: 0,
  factoryDebt: 0,
  expenses: [],
  wholesaleBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
  retailBalance: { USD: 0, EUR: 0, GBP: 0, CHF: 0 },
  customerDebts: [],
  borrowedDebts: [],
  registerCashEntries: []
};

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Purity conversion mapping
export const PURITY_MAPPING = {
  BUYING: {
    '999.9': '999.9',
    '995': '995',
    '22K': '916',
    '21K': '875',
    '18K': '750',
    '14K': '583',
    '9K': '375'
  },
  SELLING: {
    '999.9': '999.9',
    '995': '995',
    '22K': '916',
    '21K': '865',
    '18K': '740',
    '14K': '583',
    '9K': '375'
  }
};
