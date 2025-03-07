
export type ItemType = 'jewelry' | 'coin' | 'bar' | 'scrap' | 'other';
export type KaratValue = 10 | 14 | 18 | 22 | 24;
export type ItemCategory = 'Bars' | 'Coins' | 'Jewelry';
export type RegisterType = 'Wholesale' | 'Retail';
export type GoldPurity = '999.9' | '995' | '22K' | '21K' | '18K' | '14K' | '9K';

export interface InventoryItem {
  id: string;
  itemType?: ItemType;
  name: string;
  description?: string;
  weight: number;
  weightUnit: 'g' | 'oz' | 'tola' | 'baht';
  karat?: KaratValue;
  purity: GoldPurity; // Updated to match GoldPurity type
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
}

export interface InventoryRegister {
  id: string;
  name: string;
  items: InventoryItem[];
  lastUpdated: string; // ISO date string
}
