
import { Transaction, InventoryItem } from '@/contexts/types';
import { toast } from 'sonner';
import { calculateTransactionPrice } from '@/utils/goldCalculations';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';
import { generateId } from '@/contexts/types';

export const formatTransaction = (transaction: any): Transaction => {
  return {
    id: generateId(),
    dateTime: new Date().toISOString(),
    type: transaction.type?.toLowerCase() || 'buy',
    itemId: transaction.items?.[0]?.inventoryItemId || '',
    quantity: transaction.items?.reduce((total: number, item: any) => total + (item.quantity || 0), 0) || 0,
    spotPrice: transaction.spotPriceAtTransaction || 0,
    commission: transaction.commission || 0,
    commissionType: transaction.commissionType?.toLowerCase() || 'flat',
    paymentMethod: transaction.payments?.[0]?.method?.toLowerCase() || 'cash',
    currency: transaction.currency || 'USD',
    totalPrice: transaction.totalAmount || 0,
    cashAmount: transaction.payments?.find((p: any) => p.method === 'Cash')?.amount || 0,
    goldAmount: transaction.payments?.find((p: any) => p.method === 'Gold')?.amount || 0,
    customer: transaction.customerName || '',
    notes: transaction.notes || '',
    customerPhone: transaction.customerPhone || '',
    registerType: transaction.registerType?.toLowerCase() || 'wholesale'
  };
};

export const calculatePrice = (
  type: 'buy' | 'sell',
  category: 'bars' | 'coins' | 'jewelry',
  spotPrice: number,
  weight: number,
  weightUnit: 'g' | 'oz' | 'tola' | 'baht' | 'kg',
  purity: "999.9" | "995" | "22K" | "21K" | "18K" | "14K" | "9K",
  commissionRate: number,
  commissionType: 'percentage' | 'flat' | 'per_gram'
) => {
  return calculateTransactionPrice(
    type,
    category,
    spotPrice,
    weight,
    weightUnit,
    purity,
    commissionRate,
    commissionType
  );
};
