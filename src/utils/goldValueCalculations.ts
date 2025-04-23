
import { WeightUnit } from './weightConversions';
import { GoldPurity } from './purityCalculations';
import { convertToGrams } from './weightConversions';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF';

/**
 * Calculate gold value based on weight, purity, and spot price
 */
export const calculateGoldValue = (
  weight: number, 
  purity: number, 
  spotPricePerGram: number, 
  unit: WeightUnit = 'g'
): number => {
  // First convert to grams if necessary
  const weightInGrams = unit === 'g' ? weight : convertToGrams(weight, unit);
  
  // Calculate pure gold content and multiply by spot price
  return weightInGrams * purity * spotPricePerGram;
};

/**
 * Calculate retail price with markup
 */
export const calculateRetailPrice = (
  baseValue: number, 
  markupPercentage: number
): number => {
  return baseValue * (1 + markupPercentage / 100);
};

/**
 * Calculate spot price per gram from price per ounce
 */
export const spotPricePerGram = (pricePerOunce: number): number => {
  return pricePerOunce / 31.1035;
};

/**
 * Calculate the melt value of gold items
 */
export const calculateMeltValue = (
  weight: number,
  purity: number,
  spotPricePerGram: number,
  unit: WeightUnit = 'g'
): number => {
  return calculateGoldValue(weight, purity, spotPricePerGram, unit);
};

/**
 * Calculate estimated profit
 */
export const calculateProfit = (
  sellingPrice: number,
  costPrice: number
): number => {
  return sellingPrice - costPrice;
};
