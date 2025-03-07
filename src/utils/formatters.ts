
/**
 * Formats a number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formats a weight with unit
 */
export const formatWeight = (
  weight: number,
  unit: string = 'g',
  precision: number = 2
): string => {
  return `${weight.toFixed(precision)} ${unit}`;
};

/**
 * Formats a date
 */
export const formatDate = (
  date: string | Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formats a percentage
 */
export const formatPercentage = (
  value: number,
  precision: number = 2
): string => {
  return `${(value * 100).toFixed(precision)}%`;
};

/**
 * Shortens a number (e.g., 1,000 -> 1K)
 */
export const shortenNumber = (
  num: number,
  precision: number = 1
): string => {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];

  const found = map.find(x => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision);
    return formatted + found.suffix;
  }

  return num.toString();
};

/**
 * Formats a karat value
 */
export const formatKarat = (
  karat: number
): string => {
  return `${karat}K`;
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  format: string = 'xxx-xxx-xxxx'
): string => {
  let formatted = format;
  const digits = phoneNumber.replace(/\D/g, '');
  
  for (let i = 0; i < digits.length && i < format.replace(/[^x]/g, '').length; i++) {
    formatted = formatted.replace('x', digits[i]);
  }
  
  return formatted;
};
