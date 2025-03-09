
import { Transaction, InventoryItem, generateId } from './types';
import { toast } from 'sonner';

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
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update inventory based on transaction items
    if (transaction.items && Array.isArray(transaction.items)) {
      transaction.items.forEach((transactionItem: any) => {
        if (!transactionItem.inventoryItemId) return;
        
        const inventoryItem = inventory.find(i => i.id === transactionItem.inventoryItemId);
        if (!inventoryItem) return;
        
        const transactionQuantity = transactionItem.quantity || 0;
        const transactionWeight = transactionItem.weight || 0;
        
        // Calculate weight per unit for proportional weight adjustment
        const weightPerUnit = inventoryItem.weight / inventoryItem.quantity;
        
        // Calculate total weight being transacted
        // If custom weight was specified, use that, otherwise calculate based on quantity
        const totalWeightChange = transactionItem.weight 
          ? transactionItem.weight 
          : transactionQuantity * weightPerUnit;
        
        console.log(`Inventory update - Item: ${inventoryItem.name}, Current Weight: ${inventoryItem.weight}, Weight Change: ${totalWeightChange}`);
        
        if (transaction.type === "Buy" || transaction.type === "buy") {
          // Adding to inventory (buying from customer)
          updateInventoryItem(inventoryItem.id, { 
            quantity: inventoryItem.quantity + transactionQuantity,
            weight: inventoryItem.weight + totalWeightChange
          });
          console.log(`Increased inventory for ${inventoryItem.name} by ${transactionQuantity} units and ${totalWeightChange}${inventoryItem.weightUnit}`);
        } else if (transaction.type === "Sell" || transaction.type === "sell") {
          // Removing from inventory (selling to customer)
          if (inventoryItem.quantity >= transactionQuantity) {
            updateInventoryItem(inventoryItem.id, { 
              quantity: inventoryItem.quantity - transactionQuantity,
              weight: Math.max(0, inventoryItem.weight - totalWeightChange)
            });
            console.log(`Decreased inventory for ${inventoryItem.name} by ${transactionQuantity} units and ${totalWeightChange}${inventoryItem.weightUnit}`);
          } else {
            toast.error(`Not enough quantity in inventory for ${inventoryItem.name}`);
          }
        }
      });
    } else if (transaction.itemId) {
      // Handle legacy transaction format
      const item = inventory.find(i => i.id === transaction.itemId);
      if (item) {
        // Calculate weight per unit for proportional weight adjustment
        const weightPerUnit = item.weight / item.quantity;
        // Calculate total weight being transacted
        const totalWeightChange = transaction.quantity * weightPerUnit;
        
        if (transaction.type === "buy") {
          // Adding to inventory
          updateInventoryItem(item.id, { 
            quantity: item.quantity + transaction.quantity,
            weight: item.weight + totalWeightChange
          });
        } else if (transaction.type === "sell") {
          // Removing from inventory
          if (item.quantity >= transaction.quantity) {
            updateInventoryItem(item.id, { 
              quantity: item.quantity - transaction.quantity,
              weight: Math.max(0, item.weight - totalWeightChange)
            });
          } else {
            toast.error("Not enough quantity in inventory");
          }
        }
      }
    }
    
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
      // Calculate weight per unit for proportional weight adjustment
      const weightPerUnit = item.weight / item.quantity;
      // Calculate total weight being transacted
      const totalWeightChange = transaction.quantity * weightPerUnit;
      
      if (transaction.type === "buy") {
        // Remove from inventory what was added
        updateInventoryItem(item.id, { 
          quantity: Math.max(0, item.quantity - transaction.quantity),
          weight: Math.max(0, item.weight - totalWeightChange)
        });
      } else if (transaction.type === "sell") {
        // Add back to inventory what was sold
        updateInventoryItem(item.id, { 
          quantity: item.quantity + transaction.quantity,
          weight: item.weight + totalWeightChange
        });
      }
    }
    
    // Remove the transaction
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast.success("Transaction removed and inventory adjusted");
  };

  return {
    addTransaction,
    updateTransaction,
    removeTransaction
  };
};

export type TransactionService = ReturnType<typeof createTransactionService>;
