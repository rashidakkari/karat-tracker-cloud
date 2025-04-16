
import { Transaction, InventoryItem, generateId } from './types';
import { toast } from 'sonner';
import { convertToGrams, getPurityFactor, calculateTransactionPrice } from '@/utils/goldCalculations';

export const createTransactionService = (
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  inventory: InventoryItem[],
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
) => {
  const addTransaction = (transaction: Omit<Transaction, "id" | "dateTime"> | any) => {
    console.log("Adding transaction with data:", transaction);
    
    // Create a properly formatted transaction object
    const newTransaction: Transaction = {
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
      customerPhone: transaction.customerPhone || ''
    };
    
    console.log("Formatted transaction:", newTransaction);
    
    // Update inventory based on transaction items
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
        
        // Extract transaction details
        const transactionQuantity = transactionItem.quantity || 0;
        const transactionWeight = transactionItem.weight || 0;
        const transactionType = transaction.type?.toLowerCase() === 'buy' ? 'buy' : 'sell';
        
        console.log(`Processing ${transactionType} transaction for ${inventoryItem.name}:`);
        console.log(`- Current Quantity: ${inventoryItem.quantity}, Transaction Quantity: ${transactionQuantity}`);
        console.log(`- Current Weight: ${inventoryItem.weight}${inventoryItem.weightUnit}, Transaction Weight: ${transactionWeight}${inventoryItem.weightUnit || 'g'}`);
        
        // Calculate new weight and quantity based on transaction type
        let newQuantity = inventoryItem.quantity;
        let newWeight = inventoryItem.weight;
        
        if (transactionType === 'buy') {
          // Adding to inventory (buying from customer)
          newQuantity = inventoryItem.quantity + transactionQuantity;
          newWeight = inventoryItem.weight + transactionWeight;
          
          console.log(`- New Quantity: ${newQuantity} (+${transactionQuantity})`);
          console.log(`- New Weight: ${newWeight}${inventoryItem.weightUnit} (+${transactionWeight})`);
        } else if (transactionType === 'sell') {
          // Check if we have enough quantity
          if (inventoryItem.quantity < transactionQuantity) {
            toast.error(`Not enough quantity in inventory for ${inventoryItem.name}`);
            return;
          }
          
          // Check if we have enough weight (with a small tolerance)
          const TOLERANCE = 0.001; // Small tolerance for floating point comparisons
          if (inventoryItem.weight < (transactionWeight - TOLERANCE)) {
            toast.error(`Not enough weight in inventory for ${inventoryItem.name}`);
            return;
          }
          
          // Removing from inventory (selling to customer)
          newQuantity = inventoryItem.quantity - transactionQuantity;
          newWeight = Math.max(0, inventoryItem.weight - transactionWeight);
          
          console.log(`- New Quantity: ${newQuantity} (-${transactionQuantity})`);
          console.log(`- New Weight: ${newWeight}${inventoryItem.weightUnit} (-${transactionWeight})`);
        }
        
        // Recalculate 24K equivalent weight for updated inventory
        const weightInGrams = convertToGrams(newWeight, inventoryItem.weightUnit);
        const purityFactor = getPurityFactor(inventoryItem.purity);
        const newEquivalent24k = weightInGrams * purityFactor;
        
        console.log(`- New 24K Equivalent: ${newEquivalent24k}g`);
        
        // Update inventory item with new values
        updateInventoryItem(inventoryItem.id, { 
          quantity: newQuantity,
          weight: newWeight,
          equivalent24k: newEquivalent24k
        });
      });
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
    // Find the transaction to be removed from transactions state
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
    
    // Revert inventory changes
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      // We need to revert the inventory changes by doing the opposite operation
      // If the transaction was a buy, we need to remove from inventory (as if selling)
      // If the transaction was a sell, we need to add to inventory (as if buying)
      const reverseType = transaction.type === 'buy' ? 'sell' : 'buy';
      
      // Calculate weight per unit for proportional weight adjustment
      const weightPerUnit = item.quantity > 0 ? item.weight / item.quantity : 0;
      // Calculate total weight being transacted
      const totalWeightChange = transaction.quantity * weightPerUnit;
      
      // Calculate new weight and quantity
      let newQuantity = item.quantity;
      let newWeight = item.weight;
      
      if (reverseType === 'buy') {
        // Add back to inventory (undo sell)
        newQuantity = item.quantity + transaction.quantity;
        newWeight = item.weight + totalWeightChange;
      } else {
        // Remove from inventory (undo buy)
        newQuantity = Math.max(0, item.quantity - transaction.quantity);
        newWeight = Math.max(0, item.weight - totalWeightChange);
      }
      
      // Recalculate 24K equivalent
      const weightInGrams = convertToGrams(newWeight, item.weightUnit);
      const purityFactor = getPurityFactor(item.purity);
      const newEquivalent24k = weightInGrams * purityFactor;
      
      // Update inventory
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
    
    // Remove the transaction
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success("Transaction removed and inventory adjusted");
  };

  // Helper function to dynamically calculate transaction price during form entry
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
