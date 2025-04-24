
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportOverview from './dashboard/ReportOverview';
import SalesAnalysis from './dashboard/SalesAnalysis';
import { Card, CardContent } from "@/components/ui/card";
import { localStorageService } from "@/services/localStorageService";
import { useReportData } from "@/hooks/useReportData";

const ReportDashboard = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadData = () => {
      const data = localStorageService.transactions.getTransactions() || [];
      setTransactions(data);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const { salesData, transactionTypesData, profitData } = useReportData(transactions);
  
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
