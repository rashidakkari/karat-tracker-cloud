
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, PieChart } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatters";

interface ReportOverviewProps {
  salesData: any[];
  transactionTypesData: any[];
}

const ReportOverview: React.FC<ReportOverviewProps> = ({ 
  salesData, 
  transactionTypesData 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
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
  );
};

export default ReportOverview;
