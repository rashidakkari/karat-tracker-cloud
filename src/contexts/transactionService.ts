import { Transaction, InventoryItem, Currency } from './types';
import { toast } from 'sonner';
import { formatTransaction } from '@/services/transactions/transactionUtils';
import { updateInventoryForTransaction } from '@/services/transactions/inventoryUpdate';
import { updateRegisterBalance, createCustomerDebt, verifyInventoryAvailability } from '@/utils/inventoryUtils';

export const createTransactionService = (
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  inventory: InventoryItem[],
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void,
  updateFinancial: (updates: any) => void,
  financial: any,
  addDebt: (debt: any) => void
) => {
  const addTransaction = (transaction: any) => {
    console.log("Adding transaction with data:", transaction);
    
    const newTransaction = formatTransaction(transaction);
    
    // Calculate total payments
    const totalPayments = (transaction.payments || []).reduce((total: number, payment: any) => {
      return total + (payment.amount || 0);
    }, 0);
    
    // Determine if there's an unpaid amount
    const hasUnpaidAmount = totalPayments < transaction.totalAmount;
    const unpaidAmount = transaction.totalAmount - totalPayments;
    
    // Update inventory and financial data based on transaction type
    if (transaction.items && Array.isArray(transaction.items)) {
      transaction.items.forEach((transactionItem: any) => {
        if (!transactionItem.inventoryItemId) return;
        
        const inventoryItem = inventory.find(i => i.id === transactionItem.inventoryItemId);
        if (!inventoryItem) {
          console.error(`Inventory item with ID ${transactionItem.inventoryItemId} not found`);
          return;
        }
        
        // Check if transaction register type matches inventory item type
        const registerType = transaction.registerType?.toLowerCase() || 'wholesale';
        if (inventoryItem.type !== registerType) {
          toast.error(`Cannot ${transaction.type} ${inventoryItem.type} items in ${registerType} register`);
          return;
        }
        
        // Handle inventory updates and debt creation
        if (transaction.type?.toLowerCase() === 'buy') {
          updateInventoryForTransaction(newTransaction, inventoryItem, updateInventoryItem);
          if (hasUnpaidAmount) {
            const debtDescription = `Owed to supplier for ${inventoryItem.name} (${transactionItem.quantity} items)`;
            const newDebt = createCustomerDebt(
              transaction.customerName,
              transaction.customerPhone,
              unpaidAmount,
              transaction.currency,
              debtDescription,
              new Date().toISOString()
            );
            addDebt({ ...newDebt, type: 'borrowed' });
          }
        } else {
          // Verify availability before selling
          const availability = verifyInventoryAvailability(
            inventoryItem, 
            transactionItem.quantity || 0,
            transactionItem.weight || 0
          );
          
          if (!availability.quantityAvailable || !availability.weightAvailable) {
            toast.error(`Not enough inventory available for ${inventoryItem.name}`);
            return;
          }
          
          updateInventoryForTransaction(newTransaction, inventoryItem, updateInventoryItem);
          if (hasUnpaidAmount) {
            const debtDescription = `Owed by customer for ${inventoryItem.name} (${transactionItem.quantity} items)`;
            const newDebt = createCustomerDebt(
              transaction.customerName,
              transaction.customerPhone,
              unpaidAmount,
              transaction.currency,
              debtDescription,
              new Date().toISOString()
            );
            addDebt({ ...newDebt, type: 'customer' });
          }
        }
      });
      
      // Update register cash balance for paid amounts
      if (transaction.payments && transaction.payments.length > 0) {
        const cashPayment = transaction.payments.find((p: any) => p.method === 'Cash');
        if (cashPayment && cashPayment.amount > 0) {
          const isAddition = transaction.type?.toLowerCase() === 'sell';
          const registerType = transaction.registerType?.toLowerCase();
          const updatedBalance = updateRegisterBalance(
            registerType as "wholesale" | "retail",
            cashPayment.amount,
            transaction.currency as Currency,
            isAddition,
            financial
          );
          
          const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
          updateFinancial({
            [registerKey]: updatedBalance
          });
        }
      }
    }
    
    // Add the transaction to the state
    setTransactions(prev => [...prev, newTransaction]);
    toast.success(`Transaction ${transaction.type?.toLowerCase() === "buy" ? "purchase" : "sale"} recorded`);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    toast.success("Transaction updated");
  };

  const removeTransaction = (id: string) => {
    const getTransactions = () => {
      let currentTransactions: Transaction[] = [];
      setTransactions(prev => {
        currentTransactions = prev;
        return prev;
      });
      return currentTransactions;
    };
    
    const transactions = getTransactions();
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;
    
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      const reverseType = transaction.type === 'buy' ? 'sell' : 'buy';
      
      const weightPerUnit = item.quantity > 0 ? item.weight / item.quantity : 0;
      const totalWeightChange = transaction.quantity * weightPerUnit;
      
      let newQuantity = item.quantity;
      let newWeight = item.weight;
      
      if (reverseType === 'buy') {
        newQuantity = item.quantity + transaction.quantity;
        newWeight = item.weight + totalWeightChange;
      } else {
        newQuantity = Math.max(0, item.quantity - transaction.quantity);
        newWeight = Math.max(0, item.weight - totalWeightChange);
      }
      
      const weightInGrams = convertToGrams(newWeight, item.weightUnit);
      const purityFactor = getPurityFactor(item.purity);
      const newEquivalent24k = weightInGrams * purityFactor;
      
      updateInventoryItem(item.id, { 
        quantity: newQuantity,
        weight: newWeight,
        equivalent24k: newEquivalent24k
      });
      
      console.log(`Reverted inventory for ${item.name}:`);
      console.log(`- New Quantity: ${newQuantity}`);
      console.log(`- New Weight: ${newWeight}${item.weightUnit}`);
      console.log(`- New 24K Equivalent: ${newEquivalent24k}g`);
    }
    
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success("Transaction removed and inventory adjusted");
  };

  const calculatePrice = (
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
      category as 'bars' | 'coins' | 'jewelry',
      spotPrice,
      weight,
      weightUnit as 'g' | 'oz' | 'tola' | 'baht',
      purity,
      commissionRate,
      commissionType
    );
  };

  return {
    addTransaction,
    updateTransaction,
    removeTransaction,
    calculatePrice
  };
};

export type TransactionService = ReturnType<typeof createTransactionService>;
