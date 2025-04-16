
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialSummary from "@/components/financial/FinancialSummary";
import BalanceManager from "@/components/financial/BalanceManager";
import ExpenseForm from "@/components/financial/ExpenseForm";
import DebtList from "@/components/financial/DebtList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { financial } = useApp();

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800">Financial Management</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="cash">Cash Balance</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="customer-debt">Customer Debt</TabsTrigger>
            <TabsTrigger value="borrowed-debt">Borrowed Debt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="pt-4">
            <FinancialSummary />
          </TabsContent>
          
          <TabsContent value="cash" className="pt-4">
            <BalanceManager />
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
          
          <TabsContent value="customer-debt" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Debt Management</CardTitle>
                <CardDescription>Track money customers owe to your business</CardDescription>
              </CardHeader>
              <CardContent>
                <DebtList title="Customer Debts" type="customer" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="borrowed-debt" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Borrowed Debt Management</CardTitle>
                <CardDescription>Track money your business owes to others</CardDescription>
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
