
export type GoldPurity = '999.9' | '995' | '22K' | '21K' | '18K' | '14K' | '9K';

// Purity by karat
export const KARAT_TO_PURITY = {
  24: 0.999,
  22: 0.916,
  18: 0.75,
  14: 0.585,
  10: 0.417
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
 * Convert between karat and purity
 */
export const karatToPurity = (karat: number): number => {
  return karat / 24;
};

export const purityToKarat = (purity: number): number => {
  return Math.round(purity * 24);
};

/**
 * Calculate pure gold content
 */
export const calculatePureGoldContent = (
  weight: number, 
  purity: number
): number => {
  return weight * purity;
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
