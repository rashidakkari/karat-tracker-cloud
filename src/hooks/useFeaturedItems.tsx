
import { useApp } from '@/contexts/AppContext';
import { InventoryItem } from '@/contexts/types';
import { toast } from 'sonner';

export const useFeaturedItems = () => {
  const { inventory, financial, toggleItemFeature } = useApp();

  const featuredItems = (financial.featuredItems || [])
    .map(id => inventory.find(item => item.id === id))
    .filter((item): item is InventoryItem => item !== undefined);

  const isFeatured = (itemId: string): boolean => {
    return (financial.featuredItems || []).includes(itemId);
  };

  const toggleFeature = (itemId: string, featured: boolean) => {
    toggleItemFeature(itemId, featured);
    toast.success(featured ? 'Item added to featured' : 'Item removed from featured');
  };

  return {
    featuredItems,
    toggleFeature,
    isFeatured,
  };
};
