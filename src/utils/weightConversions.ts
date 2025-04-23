
export type WeightUnit = 'g' | 'oz' | 'tola' | 'baht' | 'kg';

// Conversion factors to grams
const WEIGHT_CONVERSION_TO_GRAMS = {
  g: 1,
  kg: 1000,
  oz: 31.1035, // Troy ounce
  tola: 11.6638, // Indian tola
  baht: 15.244  // Thai baht
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
