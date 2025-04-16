
import { InventoryItem, generateId } from './types';
import { toast } from 'sonner';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';

// Calculate 24K equivalent weight based on purity
export const calculateEquivalent24k = (weight: number, purity: InventoryItem["purity"]): number => {
  // Convert to pure gold content using purity factor
  return weight * getPurityFactor(purity);
};

export const createInventoryService = (
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
) => {
  const addInventoryItem = (item: Omit<InventoryItem, "id" | "dateAdded" | "equivalent24k">) => {
    // Convert weight to grams for 24K equivalent calculation
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    
    // Calculate 24K equivalent using the purity factor
    const purityFactor = getPurityFactor(item.purity);
    const equivalent24k = weightInGrams * purityFactor;
    
    // Ensure we have all required fields
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      equivalent24k
    };
    
    console.log("Adding new inventory item:", newItem);
    console.log(`24K Equivalent: ${equivalent24k}g (${item.weight}${item.weightUnit} at ${item.purity} purity)`);
    
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
          if (updates.weight !== undefined || updates.purity !== undefined || updates.weightUnit !== undefined) {
            // Get the updated values or use existing values
            const weight = updates.weight !== undefined ? updates.weight : item.weight;
            const purity = updates.purity !== undefined ? updates.purity : item.purity;
            const weightUnit = updates.weightUnit !== undefined ? updates.weightUnit : item.weightUnit;
            
            // Convert to grams first
            const weightInGrams = convertToGrams(weight, weightUnit);
            
            // Calculate equivalent using purity factor
            const purityFactor = getPurityFactor(purity);
            updatedItem.equivalent24k = weightInGrams * purityFactor;
            
            console.log(`Recalculated 24K Equivalent: ${updatedItem.equivalent24k}g (${weight}${weightUnit} at ${purity} purity)`);
          } else if (updates.equivalent24k !== undefined) {
            // Use provided equivalent24k value if explicitly set
            updatedItem.equivalent24k = updates.equivalent24k;
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
