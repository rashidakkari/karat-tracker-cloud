
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TransactionType } from '@/contexts/types';

interface BasicInfoSectionProps {
  type: TransactionType;
  registerType: string;
  customerName: string;
  customerPhone: string;
  onTypeChange: (value: TransactionType) => void;
  onRegisterTypeChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
}

const BasicInfoSection = ({ 
  type,
  registerType,
  customerName,
  customerPhone,
  onTypeChange,
  onRegisterTypeChange,
  onCustomerNameChange,
  onCustomerPhoneChange
}: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex space-x-2">
        <div className="space-y-2 flex-1">
          <Label htmlFor="type">Transaction Type*</Label>
          <Select
            value={type}
            onValueChange={(value: any) => onTypeChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy (from customer)</SelectItem>
              <SelectItem value="sell">Sell (to customer)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 flex-1">
          <Label htmlFor="registerType">Register*</Label>
          <Select
            value={registerType}
            onValueChange={onRegisterTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select register" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <div className="space-y-2 flex-1">
          <Label htmlFor="customerName">Customer Name*</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2 flex-1">
          <Label htmlFor="customerPhone">Customer Phone</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
