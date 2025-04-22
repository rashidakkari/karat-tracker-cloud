import React, { createContext, useContext, useEffect } from "react";
import { InventoryItem, Transaction, FinancialData, STORAGE_KEYS, Currency } from './types';
import { useInventory } from '@/hooks/useInventory';
import { useFinancial } from '@/hooks/useFinancial';
import { calculateTransactionPrice } from "@/utils/goldCalculations";
import { toast } from "sonner";

// Create the context
const AppContext = createContext<any | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    inventory,
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  } = useInventory();

  const {
    financial,
    setFinancial,
    updateSpotPrice,
    updateCashBalance,
    addDebt,
    addRegisterCashEntry,
    updateFinancial,
  } = useFinancial();

  // Local state for featured items (instead of useFeaturedItems)
  const [featuredItems, setFeaturedItems] = React.useState<string[]>([]);

  // Toggle an inventory item's featured status
  const toggleItemFeature = (id: string) => {
    setFeaturedItems((prev) => 
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };
  const isFeatured = (id: string) => featuredItems.includes(id);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedInventory = localStorage.getItem(STORAGE_KEYS.inventory);
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      }

      const storedFinancial = localStorage.getItem(STORAGE_KEYS.financial);
      if (storedFinancial) {
        const parsedFinancial = JSON.parse(storedFinancial);
        setFinancial(parsedFinancial);
      }

      const storedFeatured = localStorage.getItem("karatcloud_featuredItems");
      if (storedFeatured) {
        setFeaturedItems(JSON.parse(storedFeatured));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast.error("Failed to load application data");
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    localStorage.setItem(STORAGE_KEYS.financial, JSON.stringify(financial));
    localStorage.setItem("karatcloud_featuredItems", JSON.stringify(featuredItems));
  }, [inventory, financial, featuredItems]);

  // Wrapper for calculatePrice that safely handles category param
  const calculatePrice = (
    type: 'buy' | 'sell',
    category: string,
    spotPrice: number,
    weight: number,
    weightUnit: 'g' | 'oz' | 'tola' | 'baht' | 'kg',
    purity: "999.9" | "995" | "22K" | "21K" | "18K" | "14K" | "9K",
    commissionRate: number,
    commissionType: 'percentage' | 'flat' | 'per_gram'
  ) => {
    let normalizedCategory: 'bars' | 'coins' | 'jewelry' = 'jewelry';
    if (category.toLowerCase().includes('bar')) {
      normalizedCategory = 'bars';
    } else if (category.toLowerCase().includes('coin')) {
      normalizedCategory = 'coins';
    }
    return calculateTransactionPrice(
      type,
      normalizedCategory,
      spotPrice,
      weight,
      weightUnit,
      purity,
      commissionRate,
      commissionType
    );
  };

  return (
    <AppContext.Provider
      value={{
        inventory,
        financial,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        updateSpotPrice,
        updateCashBalance,
        addDebt,
        addRegisterCashEntry,
        updateFinancial,
        calculatePrice,
        toggleItemFeature,
        featuredItems,
        isFeatured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// Re-export types for convenience
export type { InventoryItem, Transaction, FinancialData, Currency };
