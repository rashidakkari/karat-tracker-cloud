
// Gold purity conversion utilities and price calculations

export type GoldPurity = '999.9' | '995' | '22K' | '21K' | '18K' | '14K' | '9K';
export type WeightUnit = 'g' | 'kg' | 'oz';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF';

// Purity factor mappings
export const purityFactors = {
  '999.9': 0.9999,
  '995': 0.995,
  '22K': {
    buying: 0.900,
    selling: 0.916 / 0.995
  },
  '21K': {
    buying: 0.865,
    selling: 0.875 / 0.995
  },
  '18K': {
    buying: 0.74,
    selling: 0.75 / 0.995
  },
  '14K': {
    buying: 0.570,
    selling: 0.583 / 0.995
  },
  '9K': {
    buying: 0.360,
    selling: 0.375 / 0.995
  }
};

// Convert weight to grams based on unit
export const convertToGrams = (weight: number, unit: WeightUnit): number => {
  switch (unit) {
    case 'kg':
      return weight * 1000;
    case 'oz':
      return weight * 31.1035;
    case 'g':
    default:
      return weight;
  }
};

// Convert weight from grams to specified unit
export const convertFromGrams = (weightInGrams: number, targetUnit: WeightUnit): number => {
  switch (targetUnit) {
    case 'kg':
      return weightInGrams / 1000;
    case 'oz':
      return weightInGrams / 31.1035;
    case 'g':
    default:
      return weightInGrams;
  }
};

// Convert gold weight to 24K equivalent (995 standard)
export const convertTo24K = (weight: number, purity: GoldPurity): number => {
  if (purity === '999.9') {
    return weight / 0.995; // Convert 999.9 to 995 standard
  }
  
  if (purity === '995') {
    return weight;
  }
  
  // For karat gold, use the selling factor for true 24K equivalent
  const purityFactor = typeof purityFactors[purity] === 'object' 
    ? (purityFactors[purity] as {selling: number}).selling 
    : (purityFactors[purity] as number);
    
  return weight * purityFactor;
};

// Calculate gold bar buying price
export const calculateBarBuyingPrice = (
  spotPrice: number,
  weight: number,
  purity: '999.9' | '995',
  commission: number = 0
): number => {
  const factor = purity === '999.9' ? 32.15 : 31.99;
  return (spotPrice * factor / 1000 * weight) + commission;
};

// Calculate gold bar selling price
export const calculateBarSellingPrice = (
  spotPrice: number,
  weight: number,
  purity: '999.9' | '995',
  commission: number = 0
): number => {
  const factor = purity === '999.9' ? 32.15 : 31.99;
  return (spotPrice * factor / 1000 * weight) + commission;
};

// Calculate jewelry buying price
export const calculateJewelryBuyingPrice = (
  spotPrice: number,
  weight: number,
  purity: GoldPurity,
  commission: number = 0
): number => {
  if (purity === '999.9' || purity === '995') {
    return calculateBarBuyingPrice(spotPrice, weight, purity, commission);
  }
  
  const purityFactor = (purityFactors[purity] as {buying: number}).buying;
  return (spotPrice * 31.99 / 1000 * weight * purityFactor) + commission;
};

// Calculate jewelry selling price with per-gram commission
export const calculateJewelrySellingPrice = (
  spotPrice: number,
  weight: number,
  purity: GoldPurity,
  commissionPerGram: number = 0
): number => {
  if (purity === '999.9' || purity === '995') {
    return (spotPrice * 32.15 / 1000 * weight) + (weight * commissionPerGram);
  }
  
  const purityFactor = (purityFactors[purity] as {selling: number}).selling;
  return (spotPrice * 32.15 / 1000 * weight * purityFactor) + (weight * commissionPerGram);
};

// Currency conversion (assuming base is USD)
export const convertCurrency = (
  amountUSD: number,
  targetCurrency: CurrencyCode,
  exchangeRates: Record<CurrencyCode, number>
): number => {
  if (targetCurrency === 'USD') return amountUSD;
  return amountUSD * exchangeRates[targetCurrency];
};
