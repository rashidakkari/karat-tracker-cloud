
// Export all the utility functions from the separate files
export * from './weightConversions';
export * from './purityCalculations';
export * from './goldValueCalculations';

// Import transaction price calculations
import {
  calculateBarBuyingPrice,
  calculateBarSellingPrice,
  calculateJewelryBuyingPrice,
  calculateJewelrySellingPrice,
  calculateTransactionPrice as calcTxPrice,
  updateInventoryWeight
} from './goldPriceCalculations';

import { WeightUnit } from './weightConversions';
import { GoldPurity, getPurityFactor } from './purityCalculations';
import { convertToGrams } from './weightConversions';

/**
 * Calculate transaction price wrapper function
 */
export const calculateTransactionPrice = (
  type: 'buy' | 'sell',
  category: 'bars' | 'coins' | 'jewelry',
  spotPrice: number,
  weight: number,
  weightUnit: WeightUnit,
  purity: GoldPurity,
  commissionRate: number = 0,
  commissionType: 'percentage' | 'flat' | 'per_gram' = 'flat'
): number => {
  return calcTxPrice(
    type,
    category,
    spotPrice,
    weight,
    weightUnit,
    purity,
    commissionRate,
    commissionType,
    convertToGrams,
    getPurityFactor
  );
};

// Re-export other functions
export {
  calculateBarBuyingPrice,
  calculateBarSellingPrice,
  calculateJewelryBuyingPrice,
  calculateJewelrySellingPrice,
  updateInventoryWeight
};
