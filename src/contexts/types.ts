
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
  costPrice?: number; // Add costPrice field to address the type error
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
  expenses: []
};

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
