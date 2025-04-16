
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { Currency, RegisterCashEntry, generateId } from '@/contexts/types';
import { PlusCircle, MinusCircle, Coins, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

const RegisterCashManager: React.FC = () => {
  const { financial, updateFinancial } = useApp();
  const [registerType, setRegisterType] = useState<"wholesale" | "retail">("wholesale");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal">("deposit");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    // Create a new register cash entry
    const newEntry: RegisterCashEntry = {
      id: generateId(),
      registerType,
      currency,
      amount,
      date: new Date().toISOString(),
      description,
      type: transactionType
    };

    // Update the register balance
    const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
    const currentBalance = financial[registerKey]?.[currency] || 0;
    const newBalance = transactionType === "deposit" 
      ? currentBalance + amount 
      : Math.max(0, currentBalance - amount);

    // Update financial data
    updateFinancial({
      [registerKey]: {
        ...(financial[registerKey] || {}),
        [currency]: newBalance
      },
      registerCashEntries: [...(financial.registerCashEntries || []), newEntry]
    });

    // Reset form
    setAmount(0);
    setDescription("");

    toast.success(`${transactionType === "deposit" ? "Deposit to" : "Withdrawal from"} ${registerType} register recorded`);
  };

  // Filter register cash entries
  const filteredEntries = (financial.registerCashEntries || [])
    .filter(entry => {
      if (searchQuery.trim() === "") return true;
      
      return (
        entry.registerType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get current balance for the selected register and currency
  const getCurrentBalance = () => {
    const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
    return financial[registerKey]?.[currency] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Register Cash Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-type">Register</Label>
                  <Select value={registerType} onValueChange={(value) => setRegisterType(value as "wholesale" | "retail")}>
                    <SelectTrigger id="register-type">
                      <SelectValue placeholder="Select register" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Wholesale Register</SelectItem>
                      <SelectItem value="retail">Retail Register</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction-type">Transaction Type</Label>
                  <Select value={transactionType} onValueChange={(value) => setTransactionType(value as "deposit" | "withdrawal")}>
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
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
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount || ""}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this transaction"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Current balance for {registerType} register ({currency}): 
                  <span className="font-semibold ml-1">{formatCurrency(getCurrentBalance())}</span>
                </p>
                
                <Button 
                  type="submit"
                  className={transactionType === "deposit" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
                >
                  {transactionType === "deposit" ? (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Deposit Cash
                    </>
                  ) : (
                    <>
                      <MinusCircle className="mr-2 h-4 w-4" />
                      Withdraw Cash
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Register Balances</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">Wholesale Register</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">USD</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.wholesaleBalance?.USD || 0)}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">EUR</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.wholesaleBalance?.EUR || 0, "EUR")}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">GBP</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.wholesaleBalance?.GBP || 0, "GBP")}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">CHF</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.wholesaleBalance?.CHF || 0, "CHF")}</p>
              </Card>
            </div>
            
            <h3 className="font-semibold mb-2">Retail Register</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">USD</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.retailBalance?.USD || 0)}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">EUR</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.retailBalance?.EUR || 0, "EUR")}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">GBP</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.retailBalance?.GBP || 0, "GBP")}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">CHF</p>
                <p className="text-lg font-semibold">{formatCurrency(financial.retailBalance?.CHF || 0, "CHF")}</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Cash Transactions</span>
            <div className="relative w-60">
              <Input
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Register</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No register cash transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{entry.registerType}</TableCell>
                      <TableCell>
                        <span className={entry.type === "deposit" ? "text-green-600" : "text-amber-600"}>
                          {entry.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.amount, entry.currency)}
                      </TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCashManager;
