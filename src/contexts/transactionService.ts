
import { Transaction, InventoryItem, generateId } from './types';
import { toast } from 'sonner';

export const createTransactionService = (
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  inventory: InventoryItem[],
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
) => {
  const addTransaction = (transaction: Omit<Transaction, "id" | "dateTime">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      dateTime: new Date().toISOString()
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update inventory based on transaction
    const item = inventory.find(i => i.id === transaction.itemId);
    if (item) {
      if (transaction.type === "buy") {
        // Adding to inventory
        updateInventoryItem(item.id, { 
          quantity: item.quantity + transaction.quantity 
        });
      } else if (transaction.type === "sell") {
        // Removing from inventory
        if (item.quantity >= transaction.quantity) {
          updateInventoryItem(item.id, { 
            quantity: item.quantity - transaction.quantity 
          });
        } else {
          toast.error("Not enough quantity in inventory");
        }
      }
    }
    
    toast.success(`Transaction ${transaction.type === "buy" ? "purchase" : "sale"} recorded`);
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
      if (transaction.type === "buy") {
        // Remove from inventory what was added
        updateInventoryItem(item.id, { 
          quantity: Math.max(0, item.quantity - transaction.quantity)
        });
      } else if (transaction.type === "sell") {
        // Add back to inventory what was sold
        updateInventoryItem(item.id, { 
          quantity: item.quantity + transaction.quantity 
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
