
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TransactionList from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/components/transactions/TransactionForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Transaction as ModelTransaction, TransactionItem } from "@/models/transactions";
import { InventoryItem as ModelInventoryItem, ItemCategory } from "@/models/inventory";
import { toast } from "sonner";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ModelTransaction | undefined>(undefined);
  const { transactions, inventory, financial, addTransaction, updateTransaction } = useApp();
  
  // Function to view transaction details
  const handleViewTransaction = (transaction: ModelTransaction) => {
    console.log("Viewing transaction details:", transaction);
    toast.info(`Viewing details for transaction: ${transaction.id.substring(0, 8)}`);
    // In a full implementation, this might open a detailed view dialog
  };
  
  // Function to edit a transaction
  const handleEditTransaction = (transaction: ModelTransaction) => {
    console.log("Editing transaction:", transaction);
    setEditingTransaction(transaction);
    setOpen(true);
  };
  
  // Function to print a receipt
  const handlePrintReceipt = (transaction: ModelTransaction) => {
    console.log("Print receipt for transaction:", transaction);
    // Actual printing is now handled in the TransactionList component
  };

  // Function to save transaction (new or edited)
  const handleComplete = (transaction: any) => {
    if (editingTransaction) {
      // Update existing transaction
      updateTransaction(transaction.id, transaction);
      toast.success("Transaction updated successfully");
    } else {
      // Add new transaction
      addTransaction(transaction);
      toast.success("Transaction completed successfully");
    }
    setOpen(false);
    setEditingTransaction(undefined);
  };

  // Function to cancel transaction form
  const handleCancel = () => {
    setOpen(false);
    setEditingTransaction(undefined);
  };

  // Map the AppContext transactions to match the model Transaction type
  const mappedTransactions = transactions.map((t: any) => ({
    id: t.id,
    type: t.type,
    customerName: t.customer || "Unknown",
    customerPhone: t.customerPhone || "",
    date: t.dateTime,
    items: [],
    totalAmount: t.totalPrice || 0,
    paymentMethod: t.paymentMethod,
    status: "completed",
    currency: t.currency,
    registerType: t.registerType || "Wholesale",
    createdAt: new Date(t.dateTime),
    updatedAt: new Date(t.dateTime)
  })) as ModelTransaction[];

  // Map AppContext inventory items to ModelInventoryItem type
  const mappedInventory = inventory.map(item => {
    // Define the mapped item with the correct type structure
    const mappedItem: ModelInventoryItem = {
      id: item.id,
      name: item.name,
      category: item.category as ItemCategory,
      weight: item.weight,
      weightUnit: item.weightUnit === "kg" ? "g" : item.weightUnit as "g" | "oz" | "tola" | "baht", 
      purity: item.purity,
      quantity: item.quantity,
      // The costPrice field in the model is required
      costPrice: 0, // Default value
      sellingPrice: 0,
      equivalent24k: item.equivalent24k || 0,
      description: item.description || '',
      dateAcquired: item.dateAdded || '',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // If the item from context has costPrice, use it with proper type checking
    if ('costPrice' in item && typeof item.costPrice === 'number') {
      mappedItem.costPrice = item.costPrice;
    }
    
    return mappedItem;
  });

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">Transactions</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <PlusIcon className="mr-2 h-4 w-4" /> New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-4xl max-h-[90vh] w-[90vw]">
              <TransactionForm 
                transaction={editingTransaction}
                inventoryItems={mappedInventory}
                currentSpotPrice={financial.spotPrice}
                onSave={handleComplete} 
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
        <TransactionList 
          transactions={mappedTransactions}
          onCreateTransaction={() => {
            setEditingTransaction(undefined);
            setOpen(true);
          }}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>
    </AppLayout>
  );
};

export default Transactions;
