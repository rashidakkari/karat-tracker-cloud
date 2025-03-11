
import { InventoryItem } from '@/contexts/types';
import { getPurityFactor } from './goldCalculations';

// Helper function to log and debug gold calculations
export const debugInventoryCalculations = (inventory: InventoryItem[]): number => {
  console.log('--- DEBUG: INVENTORY CALCULATIONS ---');
  
  let totalPureGold = 0;
  
  inventory.forEach(item => {
    // Convert to grams first
    const weightInGrams = item.weightUnit === "kg" 
      ? item.weight * 1000 
      : item.weightUnit === "oz" 
        ? item.weight * 31.1035 
        : item.weight;
    
    // Calculate pure gold content
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    totalPureGold += pureGoldWeight;
    
    console.log({
      name: item.name,
      originalWeight: `${item.weight} ${item.weightUnit}`,
      weightInGrams: `${weightInGrams.toFixed(2)}g`,
      purity: item.purity,
      purityFactor,
      pureGoldContent: `${pureGoldWeight.toFixed(2)}g`,
      quantity: item.quantity
    });
  });
  
  console.log(`Total pure gold content: ${totalPureGold.toFixed(2)}g`);
  return totalPureGold;
};
