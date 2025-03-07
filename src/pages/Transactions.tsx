
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TransactionList from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/components/transactions/TransactionForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Transaction } from "@/models/transactions";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const { transactions, addTransaction } = useApp();
  
  // Mock functions for the TransactionList props
  const handleViewTransaction = (transaction: Transaction) => {
    console.log("View transaction", transaction);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    console.log("Edit transaction", transaction);
  };
  
  const handlePrintReceipt = (transaction: Transaction) => {
    console.log("Print receipt", transaction);
  };

  const handleComplete = (transaction: any) => {
    addTransaction(transaction);
    setOpen(false);
  };

  // Map the AppContext transactions to match the model Transaction type
  const mappedTransactions: Transaction[] = transactions.map((t: any) => ({
    id: t.id,
    type: t.type,
    customerName: t.customer || "Unknown",
    date: t.dateTime,
    items: [],
    totalAmount: t.totalPrice || 0,
    paymentMethod: t.paymentMethod,
    status: "completed",
    currency: t.currency,
    createdAt: new Date(t.dateTime),
    updatedAt: new Date(t.dateTime)
  }));

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
                inventoryItems={[]}
                currentSpotPrice={0}
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
