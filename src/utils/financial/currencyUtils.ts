
import { Currency } from "@/contexts/types";

/**
 * Convert amount between currencies based on exchange rates
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: Record<Currency, number>
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert from source currency to USD first (if not already USD)
  const amountInUSD = fromCurrency === "USD" 
    ? amount 
    : amount / exchangeRates[fromCurrency];
  
  // Convert from USD to target currency (if not USD)
  return toCurrency === "USD" 
    ? amountInUSD 
    : amountInUSD * exchangeRates[toCurrency];
};
