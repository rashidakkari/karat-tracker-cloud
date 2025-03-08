
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import FinancialSummary from "@/components/financial/FinancialSummary";
import ExpenseForm from "@/components/financial/ExpenseForm";
import BalanceManager from "@/components/financial/BalanceManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";

const Finance: React.FC = () => {
  const { financial } = useApp();
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-3xl font-bold">Financial Management</h1>
        
        <div className="mb-8">
          <FinancialSummary />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <ExpenseForm />
          </div>
          
          <div>
            <BalanceManager />
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">Recent Expenses</h2>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financial.expenses.length > 0 ? (
                  financial.expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10) // Show only last 10 expenses
                    .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="capitalize">{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No expenses recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Finance;
