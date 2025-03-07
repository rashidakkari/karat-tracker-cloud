
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
  const { transactions, inventory, financial, addTransaction } = useApp();
  
  // Functions for transaction handling
  const handleViewTransaction = (transaction: ModelTransaction) => {
    toast.info(`Viewing details for transaction: ${transaction.id}`);
    console.log("View transaction", transaction);
  };
  
  const handleEditTransaction = (transaction: ModelTransaction) => {
    toast.info(`Editing transaction: ${transaction.id}`);
    console.log("Edit transaction", transaction);
    // In a full implementation, you would set the editing transaction and open the form
  };
  
  const handlePrintReceipt = (transaction: ModelTransaction) => {
    toast.success(`Printing receipt for transaction: ${transaction.id}`);
    console.log("Print receipt", transaction);
    // In a full implementation, you would generate and print a receipt
  };

  const handleComplete = (transaction: any) => {
    addTransaction(transaction);
    toast.success("Transaction completed successfully");
    setOpen(false);
  };

  // Map the AppContext transactions to match the model Transaction type
  const mappedTransactions = transactions.map((t: any) => ({
    id: t.id,
    type: t.type,
    customerName: t.customer || "Unknown",
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
  const mappedInventory = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category as ItemCategory,
    weight: item.weight,
    weightUnit: item.weightUnit === "kg" ? "g" : item.weightUnit, // Convert kg to g to match allowed types
    purity: item.purity,
    quantity: item.quantity,
    costPrice: typeof item.costPrice !== 'undefined' ? item.costPrice : 0,
    sellingPrice: 0,
    equivalent24k: item.equivalent24k || 0,
    description: item.description || '',
    dateAcquired: item.dateAdded || '',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })) as ModelInventoryItem[];

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
            <DialogContent className="sm:max-w-[600px]">
              <TransactionForm 
                transaction={undefined}
                inventoryItems={mappedInventory}
                currentSpotPrice={financial.spotPrice}
                onSave={handleComplete} 
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <TransactionList 
          transactions={mappedTransactions}
          onCreateTransaction={() => setOpen(true)}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>
    </AppLayout>
  );
};

export default Transactions;
