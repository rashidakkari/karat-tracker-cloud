
import { generateId } from "@/contexts/types";

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

/**
 * Create a new debt record
 */
export const createDebtRecord = (
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
): Debt => {
  return {
    id: generateId(),
    personName,
    contactInfo: contactInfo || '',
    amount,
    currency,
    goldAmount,
    goldPurity,
    goldWeightUnit,
    date: new Date().toISOString(),
    dueDate,
    description,
    status: 'pending',
    partialPayments: [],
    type
  };
};

/**
 * Record a payment towards a debt
 */
export const recordDebtPayment = (
  debt: Debt,
  amount: number,
  goldAmount?: number,
  goldPurity?: string
): Debt => {
  const payment = {
    date: new Date().toISOString(),
    amount,
    goldAmount,
    goldPurity
  };
  
  const updatedPartialPayments = [...(debt.partialPayments || []), payment];
  const totalPaid = updatedPartialPayments.reduce((total, p) => total + p.amount, 0);
  
  // Determine if the debt is fully paid, partially paid, or still pending
  // For simplicity, we're just checking the cash amount for now
  const newStatus = totalPaid >= debt.amount ? 'paid' : (totalPaid > 0 ? 'partially_paid' : 'pending');
  
  return {
    ...debt,
    partialPayments: updatedPartialPayments,
    status: newStatus as 'pending' | 'partially_paid' | 'paid'
  };
};

/**
 * Calculate the remaining balance on a debt
 */
export const calculateRemainingDebt = (debt: Debt): number => {
  const totalPaid = (debt.partialPayments || []).reduce((total, payment) => total + payment.amount, 0);
  return Math.max(0, debt.amount - totalPaid);
};

/**
 * Calculate the remaining gold on a debt
 */
export const calculateRemainingGoldDebt = (debt: Debt): number => {
  if (!debt.goldAmount) return 0;
  
  const totalPaid = (debt.partialPayments || [])
    .reduce((total, payment) => total + (payment.goldAmount || 0), 0);
  return Math.max(0, debt.goldAmount - totalPaid);
};

/**
 * Get all debts by type
 */
export const getDebtsByType = (
  debts: Debt[],
  type: 'customer' | 'borrowed'
): Debt[] => {
  return debts.filter(debt => debt.type === type);
};

/**
 * Calculate total debt amount by type and status
 */
export const calculateTotalDebtAmount = (
  debts: Debt[],
  type: 'customer' | 'borrowed',
  status?: 'pending' | 'partially_paid' | 'paid'
): number => {
  return debts
    .filter(debt => debt.type === type && (!status || debt.status === status))
    .reduce((total, debt) => {
      // If calculating pending debt, we need to subtract partial payments
      if (debt.status === 'partially_paid') {
        return total + calculateRemainingDebt(debt);
      }
      // For pending debts with no payments or paid debts
      return total + (debt.status === 'paid' ? 0 : debt.amount);
    }, 0);
};

/**
 * Calculate total gold debt by type and status
 */
export const calculateTotalGoldDebtAmount = (
  debts: Debt[],
  type: 'customer' | 'borrowed',
  status?: 'pending' | 'partially_paid' | 'paid'
): number => {
  return debts
    .filter(debt => debt.type === type && debt.goldAmount && (!status || debt.status === status))
    .reduce((total, debt) => {
      // If calculating pending debt, we need to subtract partial payments
      if (debt.status === 'partially_paid') {
        return total + calculateRemainingGoldDebt(debt);
      }
      // For pending debts with no payments or paid debts
      return total + (debt.status === 'paid' ? 0 : (debt.goldAmount || 0));
    }, 0);
};

/**
 * Convert purity symbol to numerical value
 */
export const getPurityValue = (purity: string): number => {
  const purities: Record<string, number> = {
    '999.9': 0.9999,
    '995': 0.995,
    '22K': 0.916,
    '21K': 0.875,
    '18K': 0.75,
    '14K': 0.583,
    '9K': 0.375
  };
  return purities[purity] || 0.995; // Default to 995 if not found
};

/**
 * Get purity display name (for UI display)
 */
export const getPurityDisplay = (purity: string): string => {
  const purities: Record<string, string> = {
    '999.9': '999.9 (24K)',
    '995': '995 (24K)',
    '22K': '916 (22K)',
    '21K': '875 (21K)',
    '18K': '750 (18K)',
    '14K': '583 (14K)',
    '9K': '375 (9K)'
  };
  return purities[purity] || purity;
};

/**
 * Convert numerical purity value to symbol
 */
export const getPuritySymbol = (value: number): string => {
  if (value >= 0.999) return '999.9';
  if (value >= 0.995) return '995';
  if (value >= 0.916) return '22K';
  if (value >= 0.875) return '21K';
  if (value >= 0.75) return '18K';
  if (value >= 0.583) return '14K';
  if (value >= 0.375) return '9K';
  return '995'; // Default
};
