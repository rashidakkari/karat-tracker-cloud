export type ItemType = 'jewelry' | 'coin' | 'bar' | 'scrap' | 'other';
export type KaratValue = 10 | 14 | 18 | 22 | 24;
export type ItemCategory = 'Bars' | 'Coins' | 'Jewelry' | 'bars' | 'coins' | 'jewelry';
export type RegisterType = 'Wholesale' | 'Retail' | 'wholesale' | 'retail';

// Update the GoldPurity type to match what's being used
export type GoldPurity = '999.9' | '995' | '22K' | '21K' | '18K' | '14K' | '9K';
export type WeightUnit = 'g' | 'oz' | 'tola' | 'baht';

export interface InventoryItem {
  id: string;
  itemType?: ItemType;
  name: string;
  description?: string;
  weight: number;
  weightUnit: WeightUnit;
  karat?: KaratValue;
  purity: GoldPurity;
  costPrice: number;
  sellingPrice?: number;
  supplier?: string;
  dateAcquired?: string; // ISO date string
  location?: string;
  imageUrl?: string;
  notes?: string;
  isAvailable?: boolean;
  tags?: string[];
  
  // Additional properties needed by the components
  category: ItemCategory;
  barcode?: string;
  quantity: number;
  costCurrency?: string;
  updatedAt?: Date;
  createdAt?: Date;
  equivalent24k?: number;
  type?: RegisterType; // Added type property
}

export interface InventoryRegister {
  id: string;
  name: string;
  items: InventoryItem[];
  lastUpdated: string; // ISO date string
}
