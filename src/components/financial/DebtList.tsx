
import React, { useState } from 'react';
import { useApp, Currency } from "@/contexts/AppContext";
import { formatCurrency } from "@/utils/formatters";
import { calculateRemainingDebt, Debt } from "@/utils/debtUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { CreditCard, DollarSign, Search, Filter } from "lucide-react";

interface DebtListProps {
  title: string;
  type: 'customer' | 'borrowed';
}

const DebtList: React.FC<DebtListProps> = ({ title, type }) => {
  const { financial, recordDebtPayment, addDebtRecord } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [currentDebt, setCurrentDebt] = useState<Debt | null>(null);
  
  // New debt form state
  const [newDebt, setNewDebt] = useState({
    personName: '',
    contactInfo: '',
    amount: '',
    description: '',
    currency: 'USD',
    dueDate: ''
  });
  
  // Payment form state
  const [payment, setPayment] = useState({
    amount: ''
  });
  
  // Get the appropriate debts array based on type
  const debts = type === 'customer' 
    ? financial.customerDebts || [] 
    : financial.borrowedDebts || [];
  
  // Filter debts based on search and status
  const filteredDebts = debts.filter(debt => {
    // Status filter
    if (statusFilter !== 'all' && debt.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        debt.personName.toLowerCase().includes(query) ||
        (debt.description && debt.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Calculate totals
  const totalDebt = filteredDebts.reduce((sum, debt) => {
    return sum + calculateRemainingDebt(debt);
  }, 0);
  
  // Handle adding a new debt
  const handleAddDebt = () => {
    if (!newDebt.personName.trim()) {
      toast.error("Person name is required");
      return;
    }
    
    if (!newDebt.amount || isNaN(parseFloat(newDebt.amount)) || parseFloat(newDebt.amount) <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    
    try {
      addDebtRecord(
        newDebt.personName,
        newDebt.contactInfo,
        parseFloat(newDebt.amount),
        newDebt.currency,
        newDebt.description || `${type === 'customer' ? 'Customer debt' : 'Borrowed debt'}`,
        type,
        newDebt.dueDate || undefined
      );
      
      setNewDebt({
        personName: '',
        contactInfo: '',
        amount: '',
        description: '',
        currency: 'USD',
        dueDate: ''
      });
      
      setIsAddingDebt(false);
      toast.success("Debt added successfully");
    } catch (error) {
      toast.error("Failed to add debt");
      console.error(error);
    }
  };
  
  // Handle recording a payment
  const handleRecordPayment = () => {
    if (!currentDebt) {
      toast.error("No debt selected");
      return;
    }
    
    if (!payment.amount || isNaN(parseFloat(payment.amount)) || parseFloat(payment.amount) <= 0) {
      toast.error("Payment amount must be a positive number");
      return;
    }
    
    try {
      recordDebtPayment(
        currentDebt.id,
        parseFloat(payment.amount),
        type
      );
      
      setPayment({ amount: '' });
      setCurrentDebt(null);
      setIsAddingPayment(false);
      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Failed to record payment");
      console.error(error);
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-amber-500">Partial</Badge>;
      default:
        return <Badge className="bg-red-500">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">{title}</h3>
          {type === 'customer' ? (
            <CreditCard className="w-4 h-4 text-amber-500" />
          ) : (
            <DollarSign className="w-4 h-4 text-amber-500" />
          )}
        </div>
        
        <Button onClick={() => setIsAddingDebt(true)}>
          Add {type === 'customer' ? 'Customer' : 'Borrowed'} Debt
        </Button>
      </div>
      
      <div className="bg-muted p-3 rounded-md">
        <div className="font-medium">Total: {formatCurrency(totalDebt)}</div>
        <div className="text-sm text-muted-foreground">
          {filteredDebts.length} {filteredDebts.length === 1 ? 'record' : 'records'} found
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            placeholder={`Search ${type} debts...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="w-[150px]">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full">
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>Status: {statusFilter}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partially_paid">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Debt table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDebts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No debts found
                </TableCell>
              </TableRow>
            ) : (
              filteredDebts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">
                    {debt.personName}
                    {debt.contactInfo && (
                      <div className="text-xs text-muted-foreground">{debt.contactInfo}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(debt.amount, debt.currency as Currency)}
                    {debt.status === 'partially_paid' && (
                      <div className="text-xs text-muted-foreground">
                        Remaining: {formatCurrency(calculateRemainingDebt(debt), debt.currency as Currency)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(debt.date).toLocaleDateString()}
                    {debt.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(debt.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{debt.description}</TableCell>
                  <TableCell>{getStatusBadge(debt.status)}</TableCell>
                  <TableCell className="text-right">
                    {debt.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentDebt(debt);
                          setIsAddingPayment(true);
                        }}
                      >
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Debt Dialog */}
      <Dialog open={isAddingDebt} onOpenChange={setIsAddingDebt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {type === 'customer' ? 'Customer' : 'Borrowed'} Debt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="personName">Person Name</Label>
              <Input
                id="personName"
                value={newDebt.personName}
                onChange={(e) => setNewDebt({ ...newDebt, personName: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactInfo">Contact Info</Label>
              <Input
                id="contactInfo"
                value={newDebt.contactInfo}
                onChange={(e) => setNewDebt({ ...newDebt, contactInfo: e.target.value })}
                placeholder="Phone or email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newDebt.amount}
                  onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newDebt.currency}
                  onValueChange={(value) => setNewDebt({ ...newDebt, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newDebt.description}
                onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                placeholder="Describe the debt"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={newDebt.dueDate}
                onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDebt(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDebt}>Add Debt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Record Payment Dialog */}
      <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {currentDebt && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Debt Details</Label>
                <div className="bg-muted p-3 rounded-md">
                  <div><strong>Person:</strong> {currentDebt.personName}</div>
                  <div><strong>Original Amount:</strong> {formatCurrency(currentDebt.amount, currentDebt.currency as Currency)}</div>
                  <div><strong>Remaining:</strong> {formatCurrency(calculateRemainingDebt(currentDebt), currentDebt.currency as Currency)}</div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtList;
