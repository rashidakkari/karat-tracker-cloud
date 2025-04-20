
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoldPurity, WeightUnit } from "@/models/inventory";

interface WeightSectionProps {
  weight: number;
  weightUnit: WeightUnit;
  purity: GoldPurity;
  onWeightChange: (value: number) => void;
  onWeightUnitChange: (value: WeightUnit) => void;
  onPurityChange: (value: GoldPurity) => void;
}

const WeightSection = ({
  weight,
  weightUnit,
  purity,
  onWeightChange,
  onWeightUnitChange,
  onPurityChange,
}: WeightSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="weight">Weight*</Label>
        <Input
          id="weight"
          type="number"
          step="0.001"
          min="0.001"
          value={weight}
          onChange={(e) => onWeightChange(parseFloat(e.target.value))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="weightUnit">Unit*</Label>
        <Select
          value={weightUnit}
          onValueChange={(value) => onWeightUnitChange(value as WeightUnit)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="g">Grams (g)</SelectItem>
            <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
            <SelectItem value="tola">Tola</SelectItem>
            <SelectItem value="baht">Baht</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="purity">Purity*</Label>
        <Select
          value={purity}
          onValueChange={(value) => onPurityChange(value as GoldPurity)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select purity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="999.9">999.9</SelectItem>
            <SelectItem value="995">995</SelectItem>
            <SelectItem value="22K">22K</SelectItem>
            <SelectItem value="21K">21K</SelectItem>
            <SelectItem value="18K">18K</SelectItem>
            <SelectItem value="14K">14K</SelectItem>
            <SelectItem value="9K">9K</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WeightSection;
