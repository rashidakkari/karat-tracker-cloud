
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReportDashboard from "@/components/reports/ReportDashboard";
import SpotCheck from "@/components/reports/SpotCheck";
import InventoryValueReport from "@/components/reports/InventoryValueReport";
import FinancialStatusReport from "@/components/reports/FinancialStatusReport";
import TransactionReport from "@/components/reports/TransactionReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { financial } = useApp();
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">Reports & Analytics</h1>
          <div className="text-sm text-muted-foreground">
            Current Gold Spot Price: <span className="font-semibold">${financial.spotPrice.toFixed(2)}</span> per troy oz
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="spot-check">Inventory Spot Check</TabsTrigger>
            <TabsTrigger value="inventory-value">Inventory Value</TabsTrigger>
            <TabsTrigger value="financial-status">Financial Status</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="pt-4">
            <ReportDashboard />
          </TabsContent>
          
          <TabsContent value="spot-check" className="pt-4">
            <SpotCheck />
          </TabsContent>
          
          <TabsContent value="inventory-value" className="pt-4">
            <InventoryValueReport />
          </TabsContent>
          
          <TabsContent value="financial-status" className="pt-4">
            <FinancialStatusReport />
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-4">
            <TransactionReport />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
