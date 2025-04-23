
import { Currency } from "@/contexts/types";

/**
 * Calculates the total value of all inventory items based on current spot price
 */
export const calculateTotalInventoryValue = (
  inventory: any[], 
  spotPrice: number
): number => {
  return inventory.reduce((total, item) => {
    // Convert equivalent24k from grams to troy ounces
    const troyOunces = (item.equivalent24k || 0) / 31.1035;
    // Calculate value based on spot price (USD per troy oz)
    return total + (troyOunces * spotPrice * item.quantity);
  }, 0);
};
