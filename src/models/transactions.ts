
import { InventoryItem } from './inventory';

export type TransactionType = 'sale' | 'purchase' | 'exchange' | 'Buy' | 'Sell' | 'Expense' | 'Repair';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other' | 'Cash' | 'Gold' | 'Mixed' | 'Credit' | 'Bank Transfer' | 'Other';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'Completed' | 'Pending';

export interface TransactionItem {
  id?: string;
  inventoryItem?: InventoryItem;
  inventoryItemId?: string;
  quantity: number;
  pricePerUnit?: number;
  unitPrice?: number;
  discount?: number;
  subtotal: number;
  totalPrice?: number;
  name?: string;
  category?: string;
  purity?: string;
  weight?: number;
  weightUnit?: string;
  currency?: string;
}

export interface Payment {
  method: string;
  amount: number;
  currency: string;
  goldWeight?: number;
  goldPurity?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  customerName: string;
  customerContact?: string;
  customerPhone?: string;
  registerType?: string;
  date: string; // ISO date string
  items: TransactionItem[];
  totalAmount: number;
  tax?: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  profit?: number; // For sale transactions
  
  // Additional properties needed by components
  payments?: Payment[];
  balance?: number;
  currency?: string;
  spotPriceAtTransaction?: number;
  commission?: number;
  commissionType?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string; // ISO date string
  description: string;
  paymentMethod: PaymentMethod;
  recurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Debt {
  id: string;
  personName: string;
  contactInfo?: string;
  amount: number;
  date: string; // ISO date string
  dueDate?: string; // ISO date string
  description: string;
  status: 'pending' | 'partially_paid' | 'paid';
  partialPayments?: {
    date: string;
    amount: number;
  }[];
}
