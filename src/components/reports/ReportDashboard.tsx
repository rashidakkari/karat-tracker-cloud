
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { localStorageService } from "@/services/localStorageService";
import { Transaction } from "@/models/transactions";
import { formatCurrency } from "@/utils/formatters";

const ReportDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = () => {
      const data = localStorageService.transactions.getTransactions() || [];
      setTransactions(data);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Calculate monthly sales data
  const getMonthlySalesData = () => {
    const salesByMonth: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      salesByMonth[monthKey] = 0;
    }
    
    // Aggregate sales by month
    transactions
      .filter(t => t.type === 'sale')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (salesByMonth[monthKey] !== undefined) {
          salesByMonth[monthKey] += transaction.totalAmount;
        }
      });
    
    return Object.entries(salesByMonth).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        total: value
      };
    });
  };
  
  // Calculate transaction types distribution
  const getTransactionTypesData = () => {
    const counts: Record<string, number> = { 
      sale: 0, 
      purchase: 0, 
      exchange: 0 
    };
    
    transactions.forEach(transaction => {
      if (counts[transaction.type] !== undefined) {
        counts[transaction.type]++;
      }
    });
    
    return Object.entries(counts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  };
  
  // Calculate profit over time
  const getProfitOverTimeData = () => {
    const profitByMonth: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      profitByMonth[monthKey] = 0;
    }
    
    // Calculate profit (simplistic approach)
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (profitByMonth[monthKey] !== undefined) {
        if (transaction.type === 'sale') {
          profitByMonth[monthKey] += transaction.profit || 0;
        }
      }
    });
    
    return Object.entries(profitByMonth).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        profit: value
      };
    });
  };
  
  // Format data for charts
  const salesData = getMonthlySalesData();
  const transactionTypesData = getTransactionTypesData();
  const profitData = getProfitOverTimeData();
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reports...</div>;
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'sale')
                      .reduce((sum, t) => sum + t.totalAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'purchase')
                      .reduce((sum, t) => sum + t.totalAmount, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    transactions
                      .reduce((sum, t) => sum + (t.profit || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={salesData}
                  categories={['total']}
                  index="name"
                  colors={['amber']}
                  valueFormatter={(value) => formatCurrency(value)}
                  className="h-72"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart
                  data={transactionTypesData}
                  category="value"
                  index="name"
                  colors={['amber', 'blue', 'green']}
                  className="h-72"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <LineChart
                data={profitData}
                categories={['profit']}
                index="name"
                colors={['green']}
                valueFormatter={(value) => formatCurrency(value)}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64">
                Inventory analysis charts coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportDashboard;
