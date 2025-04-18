
import { useApp } from '@/contexts/AppContext';
import { InventoryItem } from '@/contexts/types';

export const useFeaturedItems = () => {
  const { inventory, financial, toggleItemFeature } = useApp();

  const featuredItems = (financial.featuredItems || [])
    .map(id => inventory.find(item => item.id === id))
    .filter((item): item is InventoryItem => item !== undefined);

  const isFeatured = (itemId: string): boolean => {
    return (financial.featuredItems || []).includes(itemId);
  };

  return {
    featuredItems,
    toggleFeature: toggleItemFeature,
    isFeatured,
  };
};
