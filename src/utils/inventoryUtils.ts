
import { InventoryItem } from "@/contexts/types";
import { convertToGrams, getPurityFactor } from "./goldCalculations";

/**
 * Calculate the total 24K equivalent weight for multiple inventory items
 * @param items - Array of inventory items
 * @returns Total 24K equivalent weight in grams
 */
export const calculateTotal24kWeight = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => {
    // Convert item weight to grams first
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    
    // Apply purity factor to get pure gold content
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    return total + pureGoldWeight;
  }, 0);
};

/**
 * Group inventory items by category and calculate totals
 * @param items - Array of inventory items
 * @returns Object with category totals
 */
export const getCategoryTotals = (items: InventoryItem[]): { [key: string]: number } => {
  const totals: { [key: string]: number } = {};
  
  items.forEach(item => {
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    
    // Convert item weight to grams and apply purity factor
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    // Add to category total
    totals[category] = (totals[category] || 0) + pureGoldWeight;
  });
  
  return totals;
};

/**
 * Get inventory items that are below the low stock threshold
 * @param items - Array of inventory items
 * @param threshold - Low stock threshold quantity (default: 2)
 * @returns Array of items below threshold
 */
export const getLowStockItems = (items: InventoryItem[], threshold: number = 2): InventoryItem[] => {
  return items.filter(item => item.quantity <= threshold);
};

/**
 * Verify if there is enough inventory for a transaction
 * @param item - Inventory item
 * @param quantity - Transaction quantity
 * @param weight - Transaction weight
 * @returns Object indicating if enough inventory is available
 */
export const verifyInventoryAvailability = (
  item: InventoryItem, 
  quantity: number, 
  weight: number
): { quantityAvailable: boolean; weightAvailable: boolean; } => {
  const TOLERANCE = 0.001; // Small tolerance for floating point comparisons
  
  return {
    quantityAvailable: item.quantity >= quantity,
    weightAvailable: item.weight >= (weight - TOLERANCE)
  };
};
