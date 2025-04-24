
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportOverview from './dashboard/ReportOverview';
import SalesAnalysis from './dashboard/SalesAnalysis';
import { Card, CardContent } from "@/components/ui/card";
import { localStorageService } from "@/services/localStorageService";
import { Transaction } from "@/models/transactions";
import { formatCurrency } from "@/utils/formatters";

const ReportDashboard = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadData = () => {
      const data = localStorageService.transactions.getTransactions() || [];
      setTransactions(data);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Calculate monthly sales data
  const salesData = React.useMemo(() => {
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
  }, [transactions]);
  
  // Calculate transaction types distribution
  const transactionTypesData = React.useMemo(() => {
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
  }, [transactions]);
  
  // Calculate profit over time
  const profitData = React.useMemo(() => {
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
  }, [transactions]);
  
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
          <ReportOverview 
            salesData={salesData}
            transactionTypesData={transactionTypesData}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <SalesAnalysis profitData={profitData} />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
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
