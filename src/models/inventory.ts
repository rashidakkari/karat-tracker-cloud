
import { GoldPurity, WeightUnit } from "../utils/goldCalculations";

export type ItemCategory = 'Bars' | 'Coins' | 'Jewelry';

export interface InventoryItem {
  id: string;
  barcode?: string;
  name: string;
  category: ItemCategory;
  purity: GoldPurity;
  weight: number;
  weightUnit: WeightUnit;
  quantity: number;
  costPrice: number;
  costCurrency: string;
  location?: string;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
}

export type RegisterType = 'Wholesale' | 'Retail';

export interface InventoryRegister {
  type: RegisterType;
  items: InventoryItem[];
}

// Helper function to calculate total 24K equivalent for an item
export const calculateItemValue24K = (item: InventoryItem): number => {
  // This logic should use the goldCalculations utility functions
  // to convert the item's weight to 24K equivalent based on purity
  // Implementation will go here
  return 0;
};

// Helper function to calculate total 24K equivalent for a register
export const calculateRegisterValue24K = (register: InventoryRegister): number => {
  return register.items.reduce((total, item) => total + calculateItemValue24K(item), 0);
};
