
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReportDashboard from "@/components/reports/ReportDashboard";
import SpotCheck from "@/components/reports/SpotCheck";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-800">Reports & Analytics</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="dashboard">Reports Dashboard</TabsTrigger>
            <TabsTrigger value="spot-check">Inventory Spot Check</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="pt-4">
            <ReportDashboard />
          </TabsContent>
          
          <TabsContent value="spot-check" className="pt-4">
            <SpotCheck />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
