
import AppLayout from "@/components/layout/AppLayout";
import ReportDashboard from "@/components/reports/ReportDashboard";

const Reports = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Reports & Analytics</h1>
        <ReportDashboard />
      </div>
    </AppLayout>
  );
};

export default Reports;
