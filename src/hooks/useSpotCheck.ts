
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';

export type RegisterFilterType = "all" | "wholesale" | "retail";
export type CategoryFilterType = "all" | "bars" | "coins" | "jewelry";

export interface EnrichedInventoryItem {
  id: string;
  name: string;
  category: string;
  type: string;
  purity: string;
  weight: number;
  weightUnit: string;
  quantity: number;
  equivalent24k: number;
  salesQuantity: number;
  salesValue: number;
  currentValuePerUnit: number;
  totalCurrentValue: number;
  isFeatured: boolean;
}

export const useSpotCheck = () => {
  const { inventory, financial, transactions, toggleItemFeature } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>("all");
  const [showSoldItems, setShowSoldItems] = useState(false);
  const [inventoryWithTransactions, setInventoryWithTransactions] = useState<EnrichedInventoryItem[]>([]);
  
  // Process transactions and inventory data
  useEffect(() => {
    // Create a map to track sold quantities by item ID
    const salesMap: Record<string, { quantity: number, value: number }> = {};
    
    // Process all sell transactions
    transactions
      .filter(t => t.type === 'sell')
      .forEach(transaction => {
        if (!salesMap[transaction.itemId]) {
          salesMap[transaction.itemId] = { quantity: 0, value: 0 };
        }
        
        salesMap[transaction.itemId].quantity += transaction.quantity;
        salesMap[transaction.itemId].value += transaction.totalPrice;
      });
    
    // Combine inventory with sales data
    const enrichedInventory = inventory.map(item => {
      const sales = salesMap[item.id] || { quantity: 0, value: 0 };
      
      // Calculate current value based on spot price
      const weightInGrams = convertToGrams(item.weight, item.weightUnit);
      const purityFactor = getPurityFactor(item.purity);
      const spotPricePerGram = financial.spotPrice / 31.1035; // Convert to price per gram
      const currentValuePerUnit = weightInGrams * purityFactor * spotPricePerGram;
      const totalCurrentValue = currentValuePerUnit * item.quantity;
      
      // Check if item is featured
      const featuredItems = financial.featuredItems || [];
      const isFeatured = featuredItems.includes(item.id);
      
      return {
        ...item,
        salesQuantity: sales.quantity,
        salesValue: sales.value,
        currentValuePerUnit,
        totalCurrentValue,
        isFeatured
      } as EnrichedInventoryItem;
    });
    
    setInventoryWithTransactions(enrichedInventory);
  }, [inventory, transactions, financial.spotPrice, financial.featuredItems]);
  
  // Filter inventory based on filters
  const filteredInventory = inventoryWithTransactions.filter(item => {
    // Register filter
    if (registerFilter !== "all" && item.type !== registerFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    
    // Sold items filter
    if (showSoldItems && item.salesQuantity === 0) {
      return false;
    }
    
    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.purity.toLowerCase().includes(query) ||
        String(item.id).toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Calculate totals
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const total24kWeight = filteredInventory.reduce((sum, item) => sum + item.equivalent24k, 0);
  const totalCurrentValue = filteredInventory.reduce((sum, item) => sum + item.totalCurrentValue, 0);
  const totalSoldQuantity = filteredInventory.reduce((sum, item) => sum + item.salesQuantity, 0);
  const totalSalesValue = filteredInventory.reduce((sum, item) => sum + item.salesValue, 0);
  
  // Get register balance
  const getRegisterBalance = (registerType: RegisterFilterType): number => {
    if (registerType === "wholesale") {
      return financial.wholesaleBalance?.USD || 0;
    } else if (registerType === "retail") {
      return financial.retailBalance?.USD || 0;
    } else {
      // For "all", combine both balances
      return (financial.wholesaleBalance?.USD || 0) + (financial.retailBalance?.USD || 0);
    }
  };
  
  // Handle starring/featuring an item
  const handleToggleFeatured = (itemId: string, currentStatus: boolean) => {
    toggleItemFeature(itemId, !currentStatus);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRegisterFilter('all');
    setCategoryFilter('all');
    setShowSoldItems(false);
  };
  
  return {
    searchQuery,
    setSearchQuery,
    registerFilter,
    setRegisterFilter,
    categoryFilter,
    setCategoryFilter,
    showSoldItems,
    setShowSoldItems,
    filteredInventory,
    totalItems,
    totalQuantity,
    total24kWeight,
    totalCurrentValue,
    totalSoldQuantity,
    totalSalesValue,
    getRegisterBalance,
    handleToggleFeatured,
    clearFilters
  };
};
