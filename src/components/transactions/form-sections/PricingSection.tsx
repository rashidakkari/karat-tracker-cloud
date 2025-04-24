
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Currency } from '@/contexts/types';

interface PricingSectionProps {
  currency: Currency;
  spotPrice: number;
  commission: number;
  commissionType: string;
  onCurrencyChange: (value: Currency) => void;
  onSpotPriceChange: (value: number) => void;
  onCommissionChange: (value: number) => void;
  onCommissionTypeChange: (value: string) => void;
}

const PricingSection = ({
  currency,
  spotPrice,
  commission,
  commissionType,
  onCurrencyChange,
  onSpotPriceChange,
  onCommissionChange,
  onCommissionTypeChange
}: PricingSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency*</Label>
        <Select
          value={currency}
          onValueChange={onCurrencyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="CHF">CHF</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="spotPrice">Spot Price*</Label>
        <Input
          id="spotPrice"
          type="number"
          step="0.01"
          min="0"
          value={spotPrice}
          onChange={(e) => onSpotPriceChange(parseFloat(e.target.value))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="commission">Commission</Label>
        <div className="flex space-x-2">
          <Input
            id="commission"
            type="number"
            step="0.01"
            min="0"
            value={commission}
            onChange={(e) => onCommissionChange(parseFloat(e.target.value))}
          />
          <Select
            value={commissionType}
            onValueChange={onCommissionTypeChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fixed">Fixed</SelectItem>
              <SelectItem value="Percentage">Percentage</SelectItem>
              <SelectItem value="PerGram">Per Gram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
