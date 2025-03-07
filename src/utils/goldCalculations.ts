
export type WeightUnit = 'g' | 'oz' | 'tola' | 'baht' | 'kg';
export type GoldPurity = '999.9' | '995' | '22K' | '21K' | '18K' | '14K' | '9K';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF';

// Conversion factors to grams
const WEIGHT_CONVERSION_TO_GRAMS = {
  g: 1,
  kg: 1000,
  oz: 31.1035, // Troy ounce
  tola: 11.6638, // Indian tola
  baht: 15.244  // Thai baht
};

// Purity by karat
export const KARAT_TO_PURITY = {
  24: 0.999,
  22: 0.916,
  18: 0.75,
  14: 0.585,
  10: 0.417
};

/**
 * Convert weight between different units
 */
export const convertWeight = (
  weight: number, 
  fromUnit: WeightUnit, 
  toUnit: WeightUnit
): number => {
  // Convert to grams first
  const weightInGrams = weight * WEIGHT_CONVERSION_TO_GRAMS[fromUnit];
  // Then convert to target unit
  return weightInGrams / WEIGHT_CONVERSION_TO_GRAMS[toUnit];
};

/**
 * Calculate pure gold content
 */
export const calculatePureGoldContent = (
  weight: number, 
  purity: number, 
  unit: WeightUnit = 'g'
): number => {
  return weight * purity;
};

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
  const weightInGrams = unit === 'g' ? weight : convertWeight(weight, unit, 'g');
  
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
 * Convert between karat and purity
 */
export const karatToPurity = (karat: number): number => {
  return karat / 24;
};

export const purityToKarat = (purity: number): number => {
  return Math.round(purity * 24);
};

/**
 * Calculate spot price per gram from price per ounce
 */
export const spotPricePerGram = (pricePerOunce: number): number => {
  return pricePerOunce / WEIGHT_CONVERSION_TO_GRAMS.oz;
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

/**
 * Convert to grams from any unit
 */
export const convertToGrams = (
  weight: number,
  unit: WeightUnit
): number => {
  return weight * WEIGHT_CONVERSION_TO_GRAMS[unit];
};

/**
 * Convert from grams to any unit
 */
export const convertFromGrams = (
  weightInGrams: number,
  toUnit: WeightUnit
): number => {
  return weightInGrams / WEIGHT_CONVERSION_TO_GRAMS[toUnit];
};

/**
 * Get purity factor from GoldPurity string
 */
export const getPurityFactor = (purity: GoldPurity): number => {
  switch (purity) {
    case '999.9':
      return 0.9999;
    case '995':
      return 0.995;
    case '22K':
      return 0.916;
    case '21K':
      return 0.875;
    case '18K':
      return 0.75;
    case '14K':
      return 0.583;
    case '9K':
      return 0.375;
    default:
      return 0.995;
  }
};

/**
 * Convert gold weight to 24K equivalent
 */
export const convertTo24K = (
  weight: number,
  purity: GoldPurity
): number => {
  return weight * getPurityFactor(purity);
};

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
  commission: number = 0
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
  commission: number = 0
): number => {
  const purityFactor = getPurityFactor(purity) / 0.995;
  return (spotPrice * 32.15 / 1000 * weightInGrams * purityFactor) + (weightInGrams * commission);
};
