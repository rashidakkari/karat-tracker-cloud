import { Transaction, InventoryItem, generateId, Currency } from './types';
import { toast } from 'sonner';
import { convertToGrams, getPurityFactor, calculateTransactionPrice } from '@/utils/goldCalculations';
import { updateRegisterBalance, createCustomerDebt, verifyInventoryAvailability } from '@/utils/inventoryUtils';

export const createTransactionService = (
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  inventory: InventoryItem[],
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void,
  updateFinancial: (updates: any) => void,
  financial: any,
  addDebt: (debt: any) => void
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
      customerPhone: transaction.customerPhone || '',
      registerType: transaction.registerType?.toLowerCase() || 'wholesale'
    };
    
    console.log("Formatted transaction:", newTransaction);
    
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
          
          // If unpaid, create a debt (we owe the customer)
          if (hasUnpaidAmount) {
            const debtDescription = `Owed to supplier for ${inventoryItem.name} (${transactionQuantity} items)`;
            const newDebt = createCustomerDebt(
              transaction.customerName,
              transaction.customerPhone,
              unpaidAmount,
              transaction.currency,
              debtDescription,
              new Date().toISOString()
            );
            // Add as borrowed debt (we owe them)
            addDebt({ ...newDebt, type: 'borrowed' });
            console.log(`Created borrowed debt for unpaid amount: ${unpaidAmount} ${transaction.currency}`);
          }
        } else if (transactionType === 'sell') {
          // Check if we have enough quantity
          const availability = verifyInventoryAvailability(
            inventoryItem, 
            transactionQuantity, 
            transactionWeight
          );
          
          if (!availability.quantityAvailable) {
            toast.error(`Not enough quantity in inventory for ${inventoryItem.name}`);
            return;
          }
          
          if (!availability.weightAvailable) {
            toast.error(`Not enough weight in inventory for ${inventoryItem.name}`);
            return;
          }
          
          // Removing from inventory (selling to customer)
          newQuantity = inventoryItem.quantity - transactionQuantity;
          newWeight = Math.max(0, inventoryItem.weight - transactionWeight);
          
          console.log(`- New Quantity: ${newQuantity} (-${transactionQuantity})`);
          console.log(`- New Weight: ${newWeight}${inventoryItem.weightUnit} (-${transactionWeight})`);
          
          // If unpaid, create a customer debt (they owe us)
          if (hasUnpaidAmount) {
            const debtDescription = `Owed by customer for ${inventoryItem.name} (${transactionQuantity} items)`;
            const newDebt = createCustomerDebt(
              transaction.customerName,
              transaction.customerPhone,
              unpaidAmount,
              transaction.currency,
              debtDescription,
              new Date().toISOString()
            );
            // Add as customer debt (they owe us)
            addDebt({ ...newDebt, type: 'customer' });
            console.log(`Created customer debt for unpaid amount: ${unpaidAmount} ${transaction.currency}`);
          }
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
      
      // Update register cash balance for paid amounts
      if (transaction.payments && transaction.payments.length > 0) {
        const cashPayment = transaction.payments.find((p: any) => p.method === 'Cash');
        if (cashPayment && cashPayment.amount > 0) {
          // For sell transactions, add cash to register; for buy transactions, subtract cash from register
          const isAddition = transaction.type?.toLowerCase() === 'sell';
          const registerType = transaction.registerType?.toLowerCase();
          const updatedBalance = updateRegisterBalance(
            registerType as "wholesale" | "retail",
            cashPayment.amount,
            transaction.currency,
            isAddition,
            financial
          );
          
          // Update the financial data
          const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
          updateFinancial({
            [registerKey]: updatedBalance
          });
          
          console.log(`Updated ${registerType} register balance: ${JSON.stringify(updatedBalance)}`);
        }
        
        // Process gold payments
        const goldPayment = transaction.payments.find((p: any) => p.method === 'Gold');
        if (goldPayment && goldPayment.goldWeight && goldPayment.goldPurity) {
          // Create a virtual inventory item for the gold payment
          const goldPaymentItem = {
            id: generateId(),
            name: `Gold Payment - ${transaction.id}`,
            category: 'bars',
            purity: goldPayment.goldPurity,
            weight: goldPayment.goldWeight,
            weightUnit: 'g',
            quantity: 1,
            type: transaction.registerType?.toLowerCase() || 'wholesale',
            dateAdded: new Date().toISOString()
          };
          
          // Add gold to inventory if we're selling (receiving gold as payment)
          // Remove gold from inventory if we're buying (paying with gold)
          if (transaction.type?.toLowerCase() === 'sell') {
            // For now, just log this. This would require a separate feature to implement fully
            console.log(`Received gold payment: ${goldPayment.goldWeight}g of ${goldPayment.goldPurity} purity`);
          } else {
            console.log(`Paid with gold: ${goldPayment.goldWeight}g of ${goldPayment.goldPurity} purity`);
          }
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
