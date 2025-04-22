
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatWeight } from '@/utils/formatters';
import { RegisterFilterType } from '@/hooks/useSpotCheck';

interface SpotCheckSummaryProps {
  totalItems: number;
  totalQuantity: number;
  total24kWeight: number;
  totalCurrentValue: number;
  totalSoldQuantity: number;
  totalSalesValue: number;
  registerBalance: number;
  registerFilter: RegisterFilterType;
}

const SpotCheckSummary: React.FC<SpotCheckSummaryProps> = ({
  totalItems,
  totalQuantity,
  total24kWeight,
  totalCurrentValue,
  totalSoldQuantity,
  totalSalesValue,
  registerBalance,
  registerFilter
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Items Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total unique items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Units across all items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">24K Gold Equivalent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(total24kWeight)}</div>
            <p className="text-xs text-muted-foreground">
              Total pure gold content
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
            <p className="text-xs text-muted-foreground">
              Based on spot price
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Sold Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSoldQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Items sold to date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Sales Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Register Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(registerBalance)}</div>
          <p className="text-xs text-muted-foreground">
            {registerFilter === "all" ? "Combined registers" : `${registerFilter} register`}
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default SpotCheckSummary;
