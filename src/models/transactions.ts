
import { InventoryItem } from './inventory';

export type TransactionType = 'sale' | 'purchase' | 'exchange';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface TransactionItem {
  inventoryItem: InventoryItem;
  quantity: number;
  pricePerUnit: number;
  discount?: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  customerName: string;
  customerContact?: string;
  date: string; // ISO date string
  items: TransactionItem[];
  totalAmount: number;
  tax?: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  profit?: number; // For sale transactions
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
