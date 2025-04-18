
import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { FileDown, Printer, RefreshCw, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import html2pdf from 'html2pdf.js';

const TransactionReport: React.FC = () => {
  const { transactions, inventory } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "buy" | "sell">("all");
  const [registerType, setRegisterType] = useState<"all" | "wholesale" | "retail">("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      (transaction.customer && transaction.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by transaction type
    const matchesType = transactionType === "all" || transaction.type === transactionType;
    
    // Filter by register type
    const matchesRegister = registerType === "all" || 
      (transaction.registerType && transaction.registerType.toLowerCase() === registerType);
    
    // Filter by date range
    let matchesDateRange = true;
    const txDate = new Date(transaction.dateTime);
    
    if (startDate) {
      matchesDateRange = matchesDateRange && txDate >= startDate;
    }
    
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      matchesDateRange = matchesDateRange && txDate < nextDay;
    }
    
    return matchesSearch && matchesType && matchesRegister && matchesDateRange;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
  
  // Get item details
  const getItemDetails = (itemId: string) => {
    return inventory.find(item => item.id === itemId) || null;
  };
  
  // Calculate totals
  const totalBuy = filteredTransactions
    .filter(tx => tx.type === 'buy')
    .reduce((sum, tx) => sum + tx.totalPrice, 0);
    
  const totalSell = filteredTransactions
    .filter(tx => tx.type === 'sell')
    .reduce((sum, tx) => sum + tx.totalPrice, 0);
  
  // Export the report as PDF
  const exportToPdf = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `transaction-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    try {
      await html2pdf().from(element).set(opt).save();
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsGenerating(false);
    }
  };

  // Print the report
  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Transaction Report</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()} className="flex gap-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" onClick={printReport} className="flex gap-2">
            <Printer size={16} />
            <span>Print</span>
          </Button>
          <Button 
            onClick={exportToPdf} 
            className="bg-amber-500 hover:bg-amber-600 text-white flex gap-2"
            disabled={isGenerating}
          >
            <FileDown size={16} />
            <span>{isGenerating ? 'Generating...' : 'Export PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                placeholder="Search by customer or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Select value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy Transactions</SelectItem>
                <SelectItem value="sell">Sell Transactions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={registerType} onValueChange={(value) => setRegisterType(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Register Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registers</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
            
            <div>
              <Button onClick={() => {
                setSearchQuery("");
                setTransactionType("all");
                setRegisterType("all");
                setStartDate(undefined);
                setEndDate(undefined);
              }} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
            
            <div className="flex gap-2 md:col-span-2">
              <div className="w-1/2">
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  label="Start Date"
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  label="End Date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef} className="space-y-4 print:p-4">
        <div className="print:block hidden mb-8">
          <h1 className="text-2xl font-bold text-center">Transaction Report</h1>
          <p className="text-center text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-center">
            {startDate && endDate ? 
              `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` : 
              'All Dates'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                {transactionType === "all" ? "All types" : `${transactionType} transactions`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Buy Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBuy)}</div>
              <p className="text-xs text-muted-foreground">
                {registerType === "all" ? "All registers" : `${registerType} register`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sell Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSell)}</div>
              <p className="text-xs text-muted-foreground">
                {registerType === "all" ? "All registers" : `${registerType} register`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader className="bg-muted print:bg-white">
            <CardTitle>Transaction List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border print:border-black">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Register</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No transactions found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedTransactions.map((transaction) => {
                      const item = getItemDetails(transaction.itemId);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.dateTime).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            <span className={`capitalize font-medium ${
                              transaction.type === 'buy' ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {transaction.type}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.registerType || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item ? (
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Qty: {transaction.quantity}
                                </div>
                              </div>
                            ) : (
                              'Unknown Item'
                            )}
                          </TableCell>
                          <TableCell>{transaction.customer || 'N/A'}</TableCell>
                          <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(transaction.totalPrice, transaction.currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionReport;
