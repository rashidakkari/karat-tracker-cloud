
import { format } from "date-fns";

/**
 * Format currency with proper symbol and locale
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = "USD"
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

/**
 * Format weight with proper unit
 */
export const formatWeight = (
  weight: number | undefined,
  unit: string = "g"
): string => {
  if (weight === undefined) return "0g";
  
  const roundedWeight = Math.round(weight * 100) / 100;
  return `${roundedWeight}${unit}`;
};

/**
 * Format date and time
 */
export const formatDateTime = (dateTimeStr: string): string => {
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return format(date, "MMM d, yyyy h:mm a");
  } catch (e) {
    console.error("Error formatting date:", e, dateTimeStr);
    return dateTimeStr || "Unknown date";
  }
};

/**
 * Format date only
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return format(date, "MMM d, yyyy");
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateStr || "Unknown date";
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Format profit ratio
 */
export const formatProfitRatio = (profit: number, cost: number): string => {
  if (cost === 0) return "∞";
  const ratio = (profit / cost) * 100;
  return `${ratio.toFixed(2)}%`;
};
