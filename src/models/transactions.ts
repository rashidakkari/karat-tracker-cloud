
import { GoldPurity, WeightUnit, CurrencyCode } from "../utils/goldCalculations";

export type TransactionType = 'Buy' | 'Sell' | 'Exchange' | 'Repair' | 'Expense';
export type PaymentMethod = 'Cash' | 'Gold' | 'Mixed' | 'Credit' | 'Bank Transfer' | 'Other';

export interface Payment {
  method: PaymentMethod;
  amount: number;
  currency: CurrencyCode;
  // For gold payments
  goldWeight?: number;
  goldPurity?: GoldPurity;
  goldUnit?: WeightUnit;
  // For tracking partial payments
  isPending?: boolean;
  dueDate?: Date;
  reference?: string;
}

export interface TransactionItem {
  id: string;
  inventoryItemId?: string;
  name: string;
  description?: string;
  category: string;
  purity: GoldPurity;
  weight: number;
  weightUnit: WeightUnit;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: CurrencyCode;
  exchangeRate?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  registerType: 'Wholesale' | 'Retail';
  items: TransactionItem[];
  payments: Payment[];
  totalAmount: number;
  balance: number; // Remaining amount after payments
  currency: CurrencyCode;
  spotPriceAtTransaction: number;
  commission: number;
  commissionType: 'Percentage' | 'Fixed' | 'PerGram';
  notes?: string;
  receipt?: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface Expense {
  id: string;
  date: Date;
  category: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  description: string;
  receipt?: string;
  createdAt: Date;
  updatedBy?: string;
}

export interface Debt {
  id: string;
  transactionId?: string;
  type: 'Customer' | 'Factory';
  entityName: string;
  entityContact?: string;
  amount: number;
  currency: CurrencyCode;
  // For gold debt
  goldWeight?: number;
  goldPurity?: GoldPurity;
  goldUnit?: WeightUnit;
  dueDate?: Date;
  status: 'Outstanding' | 'Partially Paid' | 'Paid' | 'Overdue';
  payments: Payment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
