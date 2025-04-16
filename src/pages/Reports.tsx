
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReportDashboard from "@/components/reports/ReportDashboard";
import SpotCheck from "@/components/reports/SpotCheck";
import InventoryValueReport from "@/components/reports/InventoryValueReport";
import FinancialStatusReport from "@/components/reports/FinancialStatusReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800">Reports & Analytics</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="spot-check">Inventory Spot Check</TabsTrigger>
            <TabsTrigger value="inventory-value">Inventory Value</TabsTrigger>
            <TabsTrigger value="financial-status">Financial Status</TabsTrigger>
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
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
