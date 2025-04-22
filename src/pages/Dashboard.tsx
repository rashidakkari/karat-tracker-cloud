
import React from "react";
import DashboardComponent from "@/components/dashboard/Dashboard";
import AppLayout from "@/components/layout/AppLayout";
import FeaturedItems from "@/components/dashboard/FeaturedItems";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <FeaturedItems />
        <div className="mt-6">
          <DashboardComponent />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
