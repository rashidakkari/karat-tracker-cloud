
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Currency } from "@/contexts/types";

interface QuantitySectionProps {
  quantity: number;
  costPrice: number;
  costCurrency: string;
  onQuantityChange: (value: number) => void;
  onCostPriceChange: (value: number) => void;
  onCostCurrencyChange: (value: Currency) => void;
}

const QuantitySection = ({
  quantity,
  costPrice,
  costCurrency,
  onQuantityChange,
  onCostPriceChange,
  onCostCurrencyChange,
}: QuantitySectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity*</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="costPrice">Cost Price</Label>
        <Input
          id="costPrice"
          type="number"
          step="0.01"
          min="0"
          value={costPrice}
          onChange={(e) => onCostPriceChange(parseFloat(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="costCurrency">Currency</Label>
        <Select
          value={costCurrency}
          onValueChange={onCostCurrencyChange}
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
    </div>
  );
};

export default QuantitySection;
