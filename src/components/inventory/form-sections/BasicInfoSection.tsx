
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCategory } from "@/models/inventory";

interface BasicInfoSectionProps {
  name: string;
  category: string;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory) => void;
}

const BasicInfoSection = ({ name, category, onNameChange, onCategoryChange }: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name*</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category*</Label>
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value as ItemCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bars">Bars</SelectItem>
            <SelectItem value="Coins">Coins</SelectItem>
            <SelectItem value="Jewelry">Jewelry</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicInfoSection;
