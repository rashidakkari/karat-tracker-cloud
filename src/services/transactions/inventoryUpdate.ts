
import { InventoryItem, Transaction } from '@/contexts/types';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';
import { toast } from 'sonner';

export const updateInventoryForTransaction = (
  transaction: Transaction,
  inventoryItem: InventoryItem,
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
) => {
  const transactionQuantity = transaction.quantity || 0;
  let newQuantity = inventoryItem.quantity;
  let newWeight = inventoryItem.weight;
  
  // Calculate weight per unit for proportional weight adjustment
  const weightPerUnit = inventoryItem.quantity > 0 ? inventoryItem.weight / inventoryItem.quantity : 0;
  // Calculate total weight being transacted
  const totalWeightChange = transactionQuantity * weightPerUnit;
  
  if (transaction.type === 'buy') {
    newQuantity = inventoryItem.quantity + transactionQuantity;
    newWeight = inventoryItem.weight + totalWeightChange;
  } else {
    newQuantity = Math.max(0, inventoryItem.quantity - transactionQuantity);
    newWeight = Math.max(0, inventoryItem.weight - totalWeightChange);
  }
  
  // Recalculate 24K equivalent
  const weightInGrams = convertToGrams(newWeight, inventoryItem.weightUnit);
  const purityFactor = getPurityFactor(inventoryItem.purity);
  const newEquivalent24k = weightInGrams * purityFactor;
  
  updateInventoryItem(inventoryItem.id, {
    quantity: newQuantity,
    weight: newWeight,
    equivalent24k: newEquivalent24k
  });
  
  console.log(`Updated inventory for ${inventoryItem.name}:`);
  console.log(`- New Quantity: ${newQuantity}`);
  console.log(`- New Weight: ${newWeight}${inventoryItem.weightUnit}`);
  console.log(`- New 24K Equivalent: ${newEquivalent24k}g`);
};
