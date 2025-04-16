
import { generateId } from "@/contexts/types";

export interface Debt {
  id: string;
  personName: string;
  contactInfo?: string;
  amount: number;
  currency: string;
  date: string;
  dueDate?: string;
  description: string;
  status: 'pending' | 'partially_paid' | 'paid';
  partialPayments?: {
    date: string;
    amount: number;
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
  dueDate?: string
): Debt => {
  return {
    id: generateId(),
    personName,
    contactInfo: contactInfo || '',
    amount,
    currency,
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
  amount: number
): Debt => {
  const payment = {
    date: new Date().toISOString(),
    amount
  };
  
  const updatedPartialPayments = [...(debt.partialPayments || []), payment];
  const totalPaid = updatedPartialPayments.reduce((total, p) => total + p.amount, 0);
  
  // Determine if the debt is fully paid, partially paid, or still pending
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
