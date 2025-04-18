
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialSummary from "@/components/financial/FinancialSummary";
import BalanceManager from "@/components/financial/BalanceManager";
import ExpenseForm from "@/components/financial/ExpenseForm";
import DebtList from "@/components/financial/DebtList";
import RegisterCashManager from "@/components/financial/RegisterCashManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import DebtForm from "@/components/financial/DebtForm";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { financial } = useApp();
  const [debtDialog, setDebtDialog] = useState(false);
  const [debtType, setDebtType] = useState<'customer' | 'borrowed'>('customer');

  // Function to open debt dialog with specified type
  const openDebtDialog = (type: 'customer' | 'borrowed') => {
    setDebtType(type);
    setDebtDialog(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800">Financial Management</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="cash">Cash Balance</TabsTrigger>
            <TabsTrigger value="registers">Registers</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            <TabsTrigger value="borrowings">Borrowings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="pt-4">
            <FinancialSummary />
          </TabsContent>
          
          <TabsContent value="cash" className="pt-4">
            <BalanceManager />
          </TabsContent>
          
          <TabsContent value="registers" className="pt-4">
            <RegisterCashManager />
          </TabsContent>
          
          <TabsContent value="expenses" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Management</CardTitle>
                <CardDescription>Record and track business expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="debts" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Debt Management</CardTitle>
                  <CardDescription>Track money and gold customers owe to your business</CardDescription>
                </div>
                <Dialog open={debtDialog && debtType === 'customer'} onOpenChange={(open) => setDebtDialog(open)}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-amber-500 hover:bg-amber-600"
                      onClick={() => openDebtDialog('customer')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Customer Debt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Record New Customer Debt</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new customer debt
                      </DialogDescription>
                    </DialogHeader>
                    <DebtForm type="customer" onClose={() => setDebtDialog(false)} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <DebtList title="Customer Debts" type="customer" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="borrowings" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Borrowed Debt Management</CardTitle>
                  <CardDescription>Track money and gold your business owes to others</CardDescription>
                </div>
                <Dialog open={debtDialog && debtType === 'borrowed'} onOpenChange={(open) => setDebtDialog(open)}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-amber-500 hover:bg-amber-600"
                      onClick={() => openDebtDialog('borrowed')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Borrowed Debt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Record New Borrowed Debt</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new debt you borrowed
                      </DialogDescription>
                    </DialogHeader>
                    <DebtForm type="borrowed" onClose={() => setDebtDialog(false)} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <DebtList title="Borrowed Debts" type="borrowed" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Finance;
