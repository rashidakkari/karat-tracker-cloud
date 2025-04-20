
import { useState } from 'react';
import { InventoryItem } from '@/models/inventory';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';
import { toast } from 'sonner';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Calculate 24K equivalent based on weight and purity
  const calculate24kEquivalent = (weight: number, purity: InventoryItem["purity"]): number => {
    const weightInGrams = convertToGrams(weight, "g");
    return weightInGrams * getPurityFactor(purity);
  };

  const addInventoryItem = (item: Omit<InventoryItem, "id" | "dateAcquired" | "equivalent24k">) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      dateAcquired: new Date().toISOString(),
      equivalent24k: calculate24kEquivalent(item.weight, item.purity),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setInventory(prev => [...prev, newItem]);
    toast.success('Item added to inventory');
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            ...updates, 
            updatedAt: new Date(),
            equivalent24k: updates.weight || updates.purity 
              ? calculate24kEquivalent(
                  updates.weight || item.weight,
                  updates.purity || item.purity
                )
              : item.equivalent24k
          }
        : item
    ));
    toast.success('Item updated');
  };

  const removeInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from inventory');
  };

  return {
    inventory,
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  };
};

// Helper function to generate ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
