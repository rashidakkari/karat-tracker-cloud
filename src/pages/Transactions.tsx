
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TransactionList from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/components/transactions/TransactionForm";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, Search, Filter, RefreshCcw } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Transaction as ModelTransaction } from "@/models/transactions";
import { InventoryItem as ModelInventoryItem, ItemCategory } from "@/models/inventory";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ModelTransaction | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] = useState<ModelTransaction[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { transactions, inventory, financial, addTransaction, updateTransaction } = useApp();
  
  // Map the AppContext transactions to match the model Transaction type and filter them
  useEffect(() => {
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
    
    // Apply register filter based on active tab
    let registerFiltered = mappedTransactions;
    if (activeTab !== "all") {
      registerFiltered = mappedTransactions.filter(t => 
        t.registerType?.toLowerCase() === activeTab.toLowerCase()
      );
    }
    
    // Apply type filtering if selected
    let typeFiltered = registerFiltered;
    if (filterType !== 'all') {
      typeFiltered = registerFiltered.filter(t => 
        t.type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Apply search filtering
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const filtered = typeFiltered.filter(t => 
        t.customerName.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query) ||
        t.totalAmount.toString().includes(query)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(typeFiltered);
    }
    
  }, [transactions, searchQuery, filterType, activeTab]);

  // Function to view transaction details
  const handleViewTransaction = (transaction: ModelTransaction) => {
    console.log("Viewing transaction details:", transaction);
    toast.info(`Viewing details for transaction: ${transaction.id.substring(0, 8)}`);
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
      costPrice: item.costPrice || 0,
      sellingPrice: 0,
      equivalent24k: item.equivalent24k || 0,
      description: item.description || '',
      dateAcquired: item.dateAdded || '',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: item.type
    };
    
    return mappedItem;
  });

  // Get transaction counts by register and type
  const getTransactionCounts = () => {
    const counts = {
      all: transactions.length,
      wholesale: transactions.filter(t => t.registerType?.toLowerCase() === 'wholesale').length,
      retail: transactions.filter(t => t.registerType?.toLowerCase() === 'retail').length,
      buy: transactions.filter(t => t.type === 'buy').length,
      sell: transactions.filter(t => t.type === 'sell').length
    };
    return counts;
  };
  
  const transactionCounts = getTransactionCounts();

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
              <DialogTitle className="sr-only">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
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

        {/* Filtering and view control */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Register Type Filter */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Register Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">
                    All ({transactionCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="wholesale">
                    Wholesale ({transactionCounts.wholesale})
                  </TabsTrigger>
                  <TabsTrigger value="retail">
                    Retail ({transactionCounts.retail})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Transaction Type Filter */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transaction Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{filterType === 'all' ? 'All Types' : filterType === 'buy' ? 'Buy' : 'Sell'}</span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types ({transactionCounts.all})</SelectItem>
                  <SelectItem value="buy">Buy Transactions ({transactionCounts.buy})</SelectItem>
                  <SelectItem value="sell">Sell Transactions ({transactionCounts.sell})</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {/* Search */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Search Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <Input
                  placeholder="Search by name, ID, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2" 
                    onClick={() => setSearchQuery('')}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <TransactionList 
          transactions={filteredTransactions}
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
