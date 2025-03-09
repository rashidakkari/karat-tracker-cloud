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
  const filteredTransactions = transactions.filter(transaction => {
    // Apply search term
    const matchesSearch = transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply transaction type filter
    const matchesTypeFilter = filter === 'all' || transaction.type.toLowerCase() === filter.toLowerCase();

    // Apply register filter
    const matchesRegisterFilter = registerFilter === 'all' || transaction.registerType.toLowerCase() === registerFilter.toLowerCase();
    return matchesSearch && matchesTypeFilter && matchesRegisterFilter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
          <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-wrap gap-2">
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
              {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => <TableRow key={transaction.id} className="hover:bg-secondary/20">
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'hh:mm a')}
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
                        <Button variant="ghost" size="icon" onClick={() => onPrintReceipt(transaction)} title="Print receipt" className="add the function of these bottons">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>) : <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No transactions found. Create a new transaction or try a different search.
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
};
export default TransactionList;