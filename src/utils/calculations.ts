
// Currency conversion rates (to be replaced by real-time data in a production app)
const currencyRates = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.80,
  CHF: 0.90,
};

// Purity conversion factors
export const purityFactors = {
  "999.9": 0.9999,
  "995": 0.995,
  "22K": {
    buying: 0.900,
    selling: 0.916 / 0.995,
  },
  "21K": {
    buying: 0.865,
    selling: 0.875 / 0.995,
  },
  "18K": {
    buying: 0.74,
    selling: 0.75 / 0.995,
  },
  "14K": {
    buying: 0.570,
    selling: 0.583 / 0.995,
  },
  "9K": {
    buying: 0.360,
    selling: 0.375 / 0.995,
  },
};

// Convert between currencies
export function convertCurrency(amount: number, from: keyof typeof currencyRates, to: keyof typeof currencyRates): number {
  const inUSD = amount / currencyRates[from];
  return inUSD * currencyRates[to];
}

// Calculate Swiss bars price (999.9)
export function calculateSwissBarsPrice(
  spotPrice: number,
  weight: number,
  commission: number,
  commissionType: "percentage" | "flat" | "per_gram"
): number {
  const basePrice = spotPrice * 32.15 / 1000 * weight;
  
  if (commissionType === "percentage") {
    return basePrice * (1 + commission / 100);
  } else if (commissionType === "flat") {
    return basePrice + commission;
  } else {
    // Per gram commission
    return basePrice + (weight * commission);
  }
}

// Calculate local bars price (995)
export function calculateLocalBarsPrice(
  spotPrice: number,
  weight: number,
  commission: number,
  commissionType: "percentage" | "flat" | "per_gram"
): number {
  const basePrice = spotPrice * 31.99 / 1000 * weight;
  
  if (commissionType === "percentage") {
    return basePrice * (1 + commission / 100);
  } else if (commissionType === "flat") {
    return basePrice + commission;
  } else {
    // Per gram commission
    return basePrice + (weight * commission);
  }
}

// Calculate jewelry selling price
export function calculateJewelrySellingPrice(
  spotPrice: number,
  weight: number,
  purity: "22K" | "21K" | "18K" | "14K" | "9K",
  commission: number
): number {
  // Spot price × 32.15 × selling_purity_factor/995 × weight + (weight × commission_per_gram)
  const purityFactor = purityFactors[purity].selling;
  const basePrice = spotPrice * 32.15 * purityFactor * weight;
  
  return basePrice + (weight * commission);
}

// Calculate jewelry buying price
export function calculateJewelryBuyingPrice(
  spotPrice: number,
  weight: number,
  purity: "22K" | "21K" | "18K" | "14K" | "9K"
): number {
  // Spot price × 31.99 × buying_purity_factor/1000 × weight
  const purityFactor = purityFactors[purity].buying;
  return spotPrice * 31.99 * purityFactor * weight;
}

// Calculate weight in 24K equivalent
export function calculate24KEquivalent(weight: number, purity: string): number {
  switch (purity) {
    case "999.9":
      return weight * 0.9999;
    case "995":
      return weight * 0.995;
    case "22K":
      return weight * 0.916;
    case "21K":
      return weight * 0.875;
    case "18K":
      return weight * 0.75;
    case "14K":
      return weight * 0.583;
    case "9K":
      return weight * 0.375;
    default:
      return weight;
  }
}

// Convert 995 to 999.9
export function convert995To9999(weight: number): number {
  return weight / 0.995;
}
