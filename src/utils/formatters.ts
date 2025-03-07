
import { format } from "date-fns";

// Format currency with symbol
export const formatCurrency = (
  amount: number,
  currency: "USD" | "EUR" | "GBP" | "CHF" = "USD",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string => {
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CHF: "CHF",
  };

  return `${symbols[currency]}${amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
};

// Format weight with unit
export const formatWeight = (
  weight: number,
  unit: "g" | "kg" | "oz" = "g",
  minimumFractionDigits = 2,
  maximumFractionDigits = 3
): string => {
  return `${weight.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })} ${unit}`;
};

// Format percentage
export const formatPercentage = (
  percentage: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string => {
  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}%`;
};

// Format date and time
export const formatDateTime = (dateTime: string | Date, formatStr = "MMM d, yyyy h:mm a"): string => {
  return format(new Date(dateTime), formatStr);
};

// Format date only
export const formatDate = (date: string | Date, formatStr = "MMM d, yyyy"): string => {
  return format(new Date(date), formatStr);
};

// Format time only
export const formatTime = (time: string | Date, formatStr = "h:mm a"): string => {
  return format(new Date(time), formatStr);
};

// Format purity for display
export const formatPurity = (purity: string): string => {
  return purity;
};

// Generate a truncated ID for display
export const formatId = (id: string, length = 8): string => {
  return id.substring(0, length);
};

// Convert a number to a fixed number of decimal places for display
export const toFixed = (num: number, decimals = 2): string => {
  return num.toFixed(decimals);
};
