
import { WeightUnit, GoldPurity } from './goldCalculations';

/**
 * Calculate bar buying price
 */
export const calculateBarBuyingPrice = (
  spotPrice: number,
  weightInGrams: number,
  purity: '999.9' | '995',
  commission: number = 0
): number => {
  const factor = purity === '999.9' ? 32.15 : 31.99;
  return (spotPrice * factor / 1000 * weightInGrams) - commission;
};

/**
 * Calculate bar selling price
 */
export const calculateBarSellingPrice = (
  spotPrice: number,
  weightInGrams: number,
  purity: '999.9' | '995',
  commission: number = 0
): number => {
  const factor = purity === '999.9' ? 32.15 : 31.99;
  return (spotPrice * factor / 1000 * weightInGrams) + commission;
};

/**
 * Calculate jewelry buying price
 */
export const calculateJewelryBuyingPrice = (
  spotPrice: number,
  weightInGrams: number,
  purity: GoldPurity,
  commission: number = 0,
  getPurityFactor: (purity: GoldPurity) => number
): number => {
  const purityFactor = getPurityFactor(purity) / 0.995;
  return (spotPrice * 31.99 / 1000 * weightInGrams * purityFactor) - commission;
};

/**
 * Calculate jewelry selling price
 */
export const calculateJewelrySellingPrice = (
  spotPrice: number,
  weightInGrams: number,
  purity: GoldPurity,
  commission: number = 0,
  getPurityFactor: (purity: GoldPurity) => number
): number => {
  const purityFactor = getPurityFactor(purity) / 0.995;
  return (spotPrice * 32.15 / 1000 * weightInGrams * purityFactor) + (weightInGrams * commission);
};

/**
 * Calculate transaction pricing for items
 */
export const calculateTransactionPrice = (
  type: 'buy' | 'sell',
  category: 'bars' | 'coins' | 'jewelry',
  spotPrice: number,
  weight: number,
  weightUnit: WeightUnit,
  purity: GoldPurity,
  commissionRate: number = 0,
  commissionType: 'percentage' | 'flat' | 'per_gram' = 'flat',
  convertToGrams: (weight: number, unit: WeightUnit) => number,
  getPurityFactor: (purity: GoldPurity) => number
): number => {
  // Convert weight to grams for calculation
  const weightInGrams = convertToGrams(weight, weightUnit);
  const purityFactor = getPurityFactor(purity);
  
  let basePrice = 0;
  let commission = 0;
  
  // Calculate base price based on type, category and purity
  if (category === 'bars' || category === 'coins') {
    // For bars and coins
    const factor = type === 'sell' ? 32.15 : 31.99;
    basePrice = (spotPrice * factor / 1000) * weightInGrams * purityFactor;
  } else {
    // For jewelry
    if (type === 'sell') {
      // Selling to customer
      const sellingFactor = purityFactor / 0.995;
      basePrice = (spotPrice * 32.15 / 1000) * weightInGrams * sellingFactor;
    } else {
      // Buying from customer
      const buyingFactor = purityFactor / 0.995;
      basePrice = (spotPrice * 31.99 / 1000) * weightInGrams * buyingFactor;
    }
  }
  
  // Calculate commission
  if (commissionType === 'percentage') {
    commission = basePrice * (commissionRate / 100);
  } else if (commissionType === 'flat') {
    commission = commissionRate;
  } else if (commissionType === 'per_gram') {
    commission = weightInGrams * commissionRate;
  }
  
  // Apply commission based on transaction type
  return type === 'sell' ? basePrice + commission : basePrice - commission;
};

/**
 * Update inventory item weight based on transaction
 */
export const updateInventoryWeight = (
  currentWeight: number,
  weightUnit: WeightUnit,
  transactionWeight: number,
  type: 'buy' | 'sell'
): number => {
  if (type === 'buy') {
    // Buying adds to inventory
    return currentWeight + transactionWeight;
  } else {
    // Selling removes from inventory
    return Math.max(0, currentWeight - transactionWeight);
  }
};
