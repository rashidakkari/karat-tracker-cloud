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
 * Get low stock items from inventory based on a threshold
 * @param inventory - Array of inventory items
 * @param threshold - Quantity threshold for low stock (default: 2)
 * @param registerFilter - Filter by register type (optional)
 * @returns Array of low stock items
 */
export const getLowStockItems = (
  inventory: any[],
  threshold: number = 2,
  registerFilter: "all" | "wholesale" | "retail" = "all"
): any[] => {
  // First filter by register if needed
  const filteredInventory = registerFilter === "all" 
    ? inventory 
    : inventory.filter(item => item.type === registerFilter);

  // Then filter by quantity and map to model type
  return filteredInventory
    .filter(item => item.quantity <= threshold)
    .map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      weight: item.weight,
      weightUnit: (item.weightUnit === "kg" ? "g" : item.weightUnit),
      purity: item.purity,
      costPrice: item.costPrice || 0,
      category: item.category,
      quantity: item.quantity,
      equivalent24k: item.equivalent24k || 0,
      dateAcquired: item.dateAdded || '',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
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
 * Create customer debt object based on transaction
 * @param customerName - Name of the customer
 * @param customerPhone - Phone number of the customer
 * @param amount - Amount of debt
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

/**
 * Get inventory items by register type
 * @param items - Array of inventory items
 * @param registerType - Type of register (wholesale or retail)
 * @returns Array of items in the specified register
 */
export const getInventoryByRegister = (
  items: InventoryItem[], 
  registerType: "wholesale" | "retail"
): InventoryItem[] => {
  return items.filter(item => item.type?.toLowerCase() === registerType.toLowerCase());
};

/**
 * Get cash balance for a specific register
 * @param financialData - Financial data object
 * @param registerType - Type of register (wholesale or retail)
 * @returns Object with cash balances for the register
 */
export const getRegisterBalance = (
  financialData: any,
  registerType: "wholesale" | "retail"
): { [key: string]: number } => {
  const registerKey = registerType === "wholesale" ? "wholesaleBalance" : "retailBalance";
  return financialData[registerKey] || { USD: 0, EUR: 0, GBP: 0, CHF: 0 };
};

/**
 * Calculate total value of debts by type
 * @param debts - Array of debt objects
 * @param currency - Currency to calculate total in (defaults to USD)
 * @returns Total debt value in specified currency
 */
export const calculateTotalDebt = (
  debts: any[],
  currency: string = "USD"
): number => {
  return debts
    .filter(debt => debt.currency === currency && debt.status !== "paid")
    .reduce((total, debt) => {
      // Subtract any partial payments
      const partialPaymentsTotal = (debt.partialPayments || [])
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);
      
      return total + (debt.amount - partialPaymentsTotal);
    }, 0);
};
