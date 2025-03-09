import React, { useState } from 'react';
import { Transaction } from '@/models/transactions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TransactionListProps {
  transactions: Transaction[];
  onCreateTransaction: () => void;
  onViewTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onPrintReceipt: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onCreateTransaction,
  onViewTransaction,
  onEditTransaction,
  onPrintReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [registerFilter, setRegisterFilter] = useState<string>('all');
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedSearchParams, setAdvancedSearchParams] = useState({
    id: '',
    customerName: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    // Apply search term
    const matchesSearch = transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply transaction type filter
    const matchesTypeFilter = filter === 'all' || transaction.type.toLowerCase() === filter.toLowerCase();

    // Apply register filter
    const matchesRegisterFilter = registerFilter === 'all' || transaction.registerType.toLowerCase() === registerFilter.toLowerCase();

    // Apply advanced search filters if open
    if (advancedSearchOpen) {
      const matchesId = !advancedSearchParams.id || transaction.id.includes(advancedSearchParams.id);
      const matchesCustomer = !advancedSearchParams.customerName || 
                             transaction.customerName.toLowerCase().includes(advancedSearchParams.customerName.toLowerCase());
      
      // Date filtering
      let matchesDateRange = true;
      if (advancedSearchParams.dateFrom || advancedSearchParams.dateTo) {
        const transactionDate = new Date(transaction.createdAt as string).getTime();
        
        if (advancedSearchParams.dateFrom) {
          const fromDate = new Date(advancedSearchParams.dateFrom).getTime();
          if (transactionDate < fromDate) {
            matchesDateRange = false;
          }
        }
        
        if (advancedSearchParams.dateTo) {
          const toDate = new Date(advancedSearchParams.dateTo).getTime() + (24 * 60 * 60 * 1000); // Include the end date
          if (transactionDate > toDate) {
            matchesDateRange = false;
          }
        }
      }
      
      return matchesSearch && matchesTypeFilter && matchesRegisterFilter && 
             matchesId && matchesCustomer && matchesDateRange;
    }
    
    return matchesSearch && matchesTypeFilter && matchesRegisterFilter;
  }).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy':
        return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
      case 'sell':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'expense':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAdvancedSearch = () => {
    setAdvancedSearchOpen(!advancedSearchOpen);
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReceiptDialogOpen(true);
    onPrintReceipt(transaction);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setRegisterFilter('all');
    setAdvancedSearchParams({
      id: '',
      customerName: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleAdvancedSearchChange = (field: string, value: string) => {
    setAdvancedSearchParams({
      ...advancedSearchParams,
      [field]: value
    });
  };

  const printReceiptContent = () => {
    if (!selectedTransaction) return null;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt #${selectedTransaction.id.substring(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .receipt-subtitle { font-size: 14px; color: #666; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
            .customer-info { margin-bottom: 20px; }
            .transaction-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .transaction-items th, .transaction-items td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            .transaction-items th { background-color: #f4f4f4; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total-label { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="receipt-title">RECEIPT</div>
            <div class="receipt-subtitle">Transaction #${selectedTransaction.id.substring(0, 8)}</div>
            <div class="receipt-subtitle">Date: ${format(new Date(selectedTransaction.createdAt as string), 'MMM dd, yyyy hh:mm a')}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="customer-info">
            <p><strong>Customer:</strong> ${selectedTransaction.customerName}</p>
            <p><strong>Transaction Type:</strong> ${selectedTransaction.type}</p>
            <p><strong>Register:</strong> ${selectedTransaction.registerType}</p>
            <p><strong>Status:</strong> ${selectedTransaction.status}</p>
          </div>
          
          <div class="divider"></div>
          
          <table class="transaction-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Purity</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedTransaction.items.map(item => `
                <tr>
                  <td>${item.name || 'Item'}</td>
                  <td>${item.purity || '-'}</td>
                  <td>${item.weight || 0} ${item.weightUnit || 'g'}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.unitPrice || 0).toFixed(2)} ${selectedTransaction.currency}</td>
                  <td>${(item.totalPrice || 0).toFixed(2)} ${selectedTransaction.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Total Amount:</span>
              <span>${selectedTransaction.totalAmount.toFixed(2)} ${selectedTransaction.currency}</span>
            </div>
            ${selectedTransaction.payments ? `
              <div class="total-row">
                <span class="total-label">Payment Method:</span>
                <span>${selectedTransaction.payments.map(p => p.method).join(', ')}</span>
              </div>
            ` : ''}
            ${selectedTransaction.balance !== undefined ? `
              <div class="total-row">
                <span class="total-label">Balance:</span>
                <span>${selectedTransaction.balance.toFixed(2)} ${selectedTransaction.currency}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any questions, please contact us.</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  };

  return <Card className="shadow-md">
      <CardHeader className="bg-secondary rounded-t-lg pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Transactions</CardTitle>
            <CardDescription>
              {transactions.length} total transactions
            </CardDescription>
          </div>
          <Button onClick={onCreateTransaction} className="bg-gold hover:bg-gold-dark">
            <PlusCircle className="mr-2 h-4 w-4" /> New Transaction
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
          </div>
          <Button variant="outline" onClick={handleAdvancedSearch} className="whitespace-nowrap">
            {advancedSearchOpen ? 'Simple Search' : 'Advanced Search'}
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="whitespace-nowrap">
            Reset Filters
          </Button>
        </div>
        
        {advancedSearchOpen && (
          <div className="bg-secondary/10 p-4 rounded-md mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="id-search" className="text-sm font-medium">Transaction ID</label>
              <Input 
                id="id-search" 
                value={advancedSearchParams.id} 
                onChange={e => handleAdvancedSearchChange('id', e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customer-search" className="text-sm font-medium">Customer Name</label>
              <Input 
                id="customer-search" 
                value={advancedSearchParams.customerName} 
                onChange={e => handleAdvancedSearchChange('customerName', e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date-from" className="text-sm font-medium">Date From</label>
              <Input 
                id="date-from" 
                type="date" 
                value={advancedSearchParams.dateFrom} 
                onChange={e => handleAdvancedSearchChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date-to" className="text-sm font-medium">Date To</label>
              <Input 
                id="date-to" 
                type="date" 
                value={advancedSearchParams.dateTo} 
                onChange={e => handleAdvancedSearchChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={cn("px-3 py-1 cursor-pointer", filter === 'all' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setFilter('all')}>
            All Types
          </Badge>
          <Badge className={cn("px-3 py-1 cursor-pointer", filter === 'buy' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setFilter('buy')}>
            Buy
          </Badge>
          <Badge className={cn("px-3 py-1 cursor-pointer", filter === 'sell' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setFilter('sell')}>
            Sell
          </Badge>
          <Badge className={cn("px-3 py-1 cursor-pointer", filter === 'expense' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setFilter('expense')}>
            Expense
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={cn("px-3 py-1 cursor-pointer", registerFilter === 'all' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setRegisterFilter('all')}>
            All Registers
          </Badge>
          <Badge className={cn("px-3 py-1 cursor-pointer", registerFilter === 'wholesale' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setRegisterFilter('wholesale')}>
            Wholesale
          </Badge>
          <Badge className={cn("px-3 py-1 cursor-pointer", registerFilter === 'retail' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80")} onClick={() => setRegisterFilter('retail')}>
            Retail
          </Badge>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Register</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                <TableRow key={transaction.id} className="hover:bg-secondary/20">
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(transaction.createdAt as string), 'MMM dd, yyyy')}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(transaction.createdAt as string), 'hh:mm a')}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">#{transaction.id.substring(0, 8)}</TableCell>
                  <TableCell>{transaction.customerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <span className="ml-1 capitalize">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{transaction.registerType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getTransactionStatusColor(transaction.status))}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.totalAmount.toFixed(2)} {transaction.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onViewTransaction(transaction)} title="View details">
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditTransaction(transaction)} title="Edit transaction">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrintReceipt(transaction)} title="Print receipt">
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No transactions found. Create a new transaction or try a different search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="flex justify-end mb-4">
            <Button onClick={printReceiptContent}>
              <Receipt className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
          </div>
          
          {selectedTransaction && (
            <div className="border p-6 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">RECEIPT</h2>
                <p className="text-muted-foreground">Transaction #{selectedTransaction.id.substring(0, 8)}</p>
                <p className="text-muted-foreground">
                  {format(new Date(selectedTransaction.createdAt as string), 'MMMM dd, yyyy - hh:mm a')}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="font-semibold">Customer</p>
                  <p>{selectedTransaction.customerName}</p>
                  {selectedTransaction.customerPhone && <p>{selectedTransaction.customerPhone}</p>}
                </div>
                <div>
                  <p className="font-semibold">Transaction Details</p>
                  <p>Type: <span className="capitalize">{selectedTransaction.type}</span></p>
                  <p>Register: <span className="capitalize">{selectedTransaction.registerType}</span></p>
                  <p>Status: <span className="capitalize">{selectedTransaction.status}</span></p>
                </div>
              </div>
              
              <div className="mb-6">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Purity</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name || 'Item'}</TableCell>
                        <TableCell>{item.purity || '-'}</TableCell>
                        <TableCell>{item.weight || 0} {item.weightUnit || 'g'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {(item.unitPrice || 0).toFixed(2)} {selectedTransaction.currency}
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.totalPrice || 0).toFixed(2)} {selectedTransaction.currency}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Total Amount:</span>
                  <span>{selectedTransaction.totalAmount.toFixed(2)} {selectedTransaction.currency}</span>
                </div>
                {selectedTransaction.payments && (
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Payment Method:</span>
                    <span>{selectedTransaction.payments.map(p => p.method).join(', ')}</span>
                  </div>
                )}
                {selectedTransaction.balance !== undefined && (
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Balance:</span>
                    <span>{selectedTransaction.balance.toFixed(2)} {selectedTransaction.currency}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-8 text-sm text-muted-foreground">
                <p>Thank you for your business!</p>
                <p>For any questions, please contact us.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>;
};

export default TransactionList;
