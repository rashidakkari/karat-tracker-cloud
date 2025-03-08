
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { calculateTotalInventoryValue, summarizeExpensesByCategory } from "@/utils/financialUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const FinancialSummary: React.FC = () => {
  const { inventory, financial, transactions } = useApp();
  
  const inventoryValue = calculateTotalInventoryValue(inventory, financial.spotPrice);
  const expensesByCategory = summarizeExpensesByCategory(financial.expenses);
  
  // Prepare data for pie chart
  const expensesChartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: COLORS[index % COLORS.length]
  }));
  
  // Calculate total assets (inventory value + cash)
  const totalCashUsd = financial.cashBalance.USD 
    + financial.cashBalance.EUR * 1.1  // Example conversion rates
    + financial.cashBalance.GBP * 1.27
    + financial.cashBalance.CHF * 1.13;
  
  const totalAssets = inventoryValue + totalCashUsd;
  const totalLiabilities = financial.customerDebt + financial.factoryDebt;
  const netWorth = totalAssets - totalLiabilities;
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="assets">Assets & Liabilities</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gold Spot Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financial.spotPrice.toFixed(2)}/oz</div>
                <p className="text-xs text-muted-foreground">Troy ounce in USD</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${inventoryValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on current spot price</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${netWorth.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
                <CardDescription>Inventory and Cash</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Inventory Value:</span>
                    <span className="font-medium">${inventoryValue.toFixed(2)}</span>
                  </div>
                  {Object.entries(financial.cashBalance).map(([currency, amount]) => (
                    <div key={currency} className="flex justify-between">
                      <span>Cash ({currency}):</span>
                      <span className="font-medium">{amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Assets:</span>
                    <span>${totalAssets.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Liabilities</CardTitle>
                <CardDescription>Debts and Obligations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Customer Debt:</span>
                    <span className="font-medium">${financial.customerDebt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Factory Debt:</span>
                    <span className="font-medium">${financial.factoryDebt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Liabilities:</span>
                    <span>${totalLiabilities.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Distribution of recent expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {expensesChartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-60 items-center justify-center">
                  <p className="text-muted-foreground">No expense data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialSummary;
