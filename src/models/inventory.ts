
export type ItemType = 'jewelry' | 'coin' | 'bar' | 'scrap' | 'other';
export type KaratValue = 10 | 14 | 18 | 22 | 24;

export interface InventoryItem {
  id: string;
  itemType: ItemType;
  name: string;
  description?: string;
  weight: number;
  weightUnit: 'g' | 'oz' | 'tola' | 'baht';
  karat: KaratValue;
  purity: number; // Decimal purity (e.g., 0.999 for 24k, 0.75 for 18k)
  costPrice: number;
  sellingPrice?: number;
  supplier?: string;
  dateAcquired: string; // ISO date string
  location: string;
  imageUrl?: string;
  notes?: string;
  isAvailable: boolean;
  tags?: string[];
}

export interface InventoryRegister {
  id: string;
  name: string;
  items: InventoryItem[];
  lastUpdated: string; // ISO date string
}
