
import React, { useState } from 'react';
import { InventoryItem, RegisterType } from '@/models/inventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { convertTo24K } from '@/utils/goldCalculations';
import InventorySearch from './InventorySearch';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';

interface InventoryListProps {
  registerType: RegisterType;
  items: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onViewItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  registerType,
  items,
  onAddItem,
  onEditItem,
  onViewItem,
  onDeleteItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const getCategoryCount = (category: string): number => {
    return items.filter(item => 
      item.category && item.category.toLowerCase() === category.toLowerCase()
    ).length;
  };

  const filterOptions = [
    { label: 'All', value: 'all', count: items.length },
    { label: 'Bars', value: 'bars', count: getCategoryCount('bars') },
    { label: 'Coins', value: 'coins', count: getCategoryCount('coins') },
    { label: 'Jewelry', value: 'jewelry', count: getCategoryCount('jewelry') }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === 'all' || 
      (item.category && item.category.toLowerCase() === filter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const registerTitle = registerType === 'Wholesale' ? 'Wholesale Inventory (Bars)' : 'Retail Inventory (Jewelry)';
  
  const getTotalValue = (items: InventoryItem[]): number => {
    return items.reduce((total, item) => {
      const weight24K = item.equivalent24k || convertTo24K(item.weight, item.purity);
      return total + (weight24K * (item.quantity || 1));
    }, 0);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-secondary rounded-t-lg pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">{registerTitle}</CardTitle>
            <CardDescription>
              {items.length} items · {getTotalValue(items).toFixed(2)}g in 24K equivalent
            </CardDescription>
          </div>
          <Button onClick={onAddItem} className="bg-gold hover:bg-gold-dark">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex space-x-2 mb-4">
          <InventorySearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <InventoryFilters
            options={filterOptions}
            selectedFilter={filter}
            onFilterChange={setFilter}
          />
        </div>
        
        <InventoryTable
          items={filteredItems}
          onEditItem={onEditItem}
          onViewItem={onViewItem}
          onDeleteItem={onDeleteItem}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryList;
