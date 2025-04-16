
import { InventoryItem } from "@/contexts/types";
import { convertToGrams, getPurityFactor } from "./goldCalculations";

/**
 * Calculate the total 24K equivalent weight for multiple inventory items
 * @param items - Array of inventory items
 * @returns Total 24K equivalent weight in grams
 */
export const calculateTotal24kWeight = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => {
    // Convert item weight to grams first
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    
    // Apply purity factor to get pure gold content
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    return total + pureGoldWeight;
  }, 0);
};

/**
 * Group inventory items by category and calculate totals
 * @param items - Array of inventory items
 * @returns Object with category totals
 */
export const getCategoryTotals = (items: InventoryItem[]): { [key: string]: number } => {
  const totals: { [key: string]: number } = {};
  
  items.forEach(item => {
    const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    
    // Convert item weight to grams and apply purity factor
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    // Add to category total
    totals[category] = (totals[category] || 0) + pureGoldWeight;
  });
  
  return totals;
};

/**
 * Get inventory items that are below the low stock threshold
 * @param items - Array of inventory items
 * @param threshold - Low stock threshold quantity (default: 2)
 * @returns Array of items below threshold
 */
export const getLowStockItems = (items: InventoryItem[], threshold: number = 2): InventoryItem[] => {
  return items.filter(item => item.quantity <= threshold);
};

/**
 * Verify if there is enough inventory for a transaction
 * @param item - Inventory item
 * @param quantity - Transaction quantity
 * @param weight - Transaction weight
 * @returns Object indicating if enough inventory is available
 */
export const verifyInventoryAvailability = (
  item: InventoryItem, 
  quantity: number, 
  weight: number
): { quantityAvailable: boolean; weightAvailable: boolean; } => {
  const TOLERANCE = 0.001; // Small tolerance for floating point comparisons
  
  return {
    quantityAvailable: item.quantity >= quantity,
    weightAvailable: item.weight >= (weight - TOLERANCE)
  };
};

/**
 * Update register cash balance based on transaction
 * @param registerType - Type of register (wholesale or retail)
 * @param amount - Amount to add or subtract
 * @param currency - Currency of the transaction
 * @param isAddition - Whether to add or subtract the amount
 * @param financialData - Current financial data
 * @returns Updated cash balance for the register
 */
export const updateRegisterBalance = (
  registerType: "wholesale" | "retail",
  amount: number,
  currency: string,
  isAddition: boolean,
  financialData: any
): { [key: string]: number } => {
  // Get the current register balance
  const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
  const currentBalance = financialData[registerKey]?.[currency] || 0;
  
  // Calculate the new balance
  const newBalance = isAddition ? currentBalance + amount : currentBalance - amount;
  
  return {
    ...financialData[registerKey],
    [currency]: Math.max(0, newBalance)
  };
};

/**
 * Update customer debt based on transaction
 * @param customerName - Name of the customer
 * @param amount - Amount to add to debt
 * @param currency - Currency of the debt
 * @param description - Description of the debt
 * @param date - Date of the transaction
 * @returns Customer debt object
 */
export const createCustomerDebt = (
  customerName: string,
  customerPhone: string | undefined,
  amount: number,
  currency: string,
  description: string,
  date: string
): any => {
  return {
    personName: customerName,
    contactInfo: customerPhone || '',
    amount: amount,
    currency: currency,
    date: date,
    dueDate: '', // Can be set later
    description: description,
    status: 'pending',
    partialPayments: []
  };
};
