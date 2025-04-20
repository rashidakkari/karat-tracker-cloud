
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/formatters';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface FinancialSummaryProps {
  previousSpotPrice?: number | null;
  currentSpotPrice?: number | null;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ 
  previousSpotPrice: propsPreviousPrice, 
  currentSpotPrice: propsCurrentPrice 
}) => {
  const { financial } = useApp();
  const [previousSpotPrice, setPreviousSpotPrice] = useState<number | null>(propsPreviousPrice || null);
  const currentSpotPrice = propsCurrentPrice || financial.spotPrice;

  // Store current price as previous when it changes
  useEffect(() => {
    if (financial.spotPrice && financial.spotPrice !== previousSpotPrice && previousSpotPrice !== null) {
      setPreviousSpotPrice(financial.spotPrice);
    } else if (previousSpotPrice === null && financial.spotPrice) {
      // Initialize with a slightly lower value for demonstration if not provided
      setPreviousSpotPrice(financial.spotPrice * 0.99);
    }
  }, [financial.spotPrice]);

  const calculateSpotPriceChange = () => {
    if (typeof previousSpotPrice === 'number' && typeof currentSpotPrice === 'number' && previousSpotPrice > 0) {
      const change = ((currentSpotPrice - previousSpotPrice) / previousSpotPrice) * 100;
      return Number(change.toFixed(2));
    }
    return 0;
  };

  const priceChange = calculateSpotPriceChange();
  const isPriceUp = priceChange >= 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Gold Spot Price</CardTitle>
          <CardDescription>Current price per troy ounce</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentSpotPrice || 0, 'USD')}
          </div>
          <div className="flex items-center pt-1">
            {isPriceUp ? (
              <ArrowUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={isPriceUp ? "text-emerald-500" : "text-red-500"}>
              {priceChange}%
            </span>
            <span className="text-muted-foreground text-xs ml-2">from previous price</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          <CardDescription>Total across currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(financial.cashBalance?.USD || 0, 'USD')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Customer Debts</CardTitle>
          <CardDescription>Amount customers owe you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(financial.customerDebt || 0, 'USD')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Factory Debts</CardTitle>
          <CardDescription>Amount you owe to others</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(financial.factoryDebt || 0, 'USD')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
