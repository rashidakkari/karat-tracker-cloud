
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatters";

interface SalesAnalysisProps {
  profitData: any[];
}

const SalesAnalysis: React.FC<SalesAnalysisProps> = ({ profitData }) => {
  return (
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
  );
};

export default SalesAnalysis;
