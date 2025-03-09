
import { InventoryItem, generateId } from './types';
import { toast } from 'sonner';

// Calculate 24K equivalent weight based on purity
export const calculateEquivalent24k = (weight: number, purity: InventoryItem["purity"]): number => {
  switch (purity) {
    case "999.9":
      return weight; // Pure gold
    case "995":
      return weight * 0.995; // 995 fine gold
    case "22K":
      return weight * 0.916; // 22K = 91.6% pure
    case "21K":
      return weight * 0.875; // 21K = 87.5% pure
    case "18K":
      return weight * 0.75; // 18K = 75% pure
    case "14K":
      return weight * 0.583; // 14K = 58.3% pure
    case "9K":
      return weight * 0.375; // 9K = 37.5% pure
    default:
      return weight;
  }
};

export const createInventoryService = (
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
) => {
  const addInventoryItem = (item: Omit<InventoryItem, "id" | "dateAdded" | "equivalent24k">) => {
    // Ensure we have all required fields
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      equivalent24k: calculateEquivalent24k(item.weight, item.purity)
    };
    
    console.log("Adding new inventory item:", newItem);
    
    setInventory(prev => {
      const updated = [...prev, newItem];
      console.log("Updated inventory:", updated);
      return updated;
    });
    
    toast.success(`Added ${item.name} to inventory`);
  };
  
  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    console.log("Updating inventory item:", id, updates);
    
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          // Recalculate 24K equivalent if weight or purity changed
          if (updates.weight || updates.purity) {
            updatedItem.equivalent24k = calculateEquivalent24k(
              updates.weight || item.weight,
              updates.purity || item.purity
            );
          }
          return updatedItem;
        }
        return item;
      });
      
      console.log("Updated inventory after update:", updated);
      return updated;
    });
    
    toast.success("Inventory item updated");
  };
  
  const removeInventoryItem = (id: string) => {
    console.log("Removing inventory item:", id);
    
    setInventory(prev => {
      const updated = prev.filter(item => item.id !== id);
      console.log("Updated inventory after removal:", updated);
      return updated;
    });
    
    toast.success("Inventory item removed");
  };

  return {
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    calculateEquivalent24k
  };
};

export type InventoryService = ReturnType<typeof createInventoryService>;
