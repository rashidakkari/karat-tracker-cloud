
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface InventoryFiltersProps {
  options: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const InventoryFilters = ({ options, selectedFilter, onFilterChange }: InventoryFiltersProps) => {
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <Badge
          key={option.value}
          className={cn(
            "px-3 py-1 cursor-pointer",
            selectedFilter === option.value
              ? "bg-gold hover:bg-gold-dark"
              : "bg-secondary text-primary hover:bg-secondary/80"
          )}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label} ({option.count})
        </Badge>
      ))}
    </div>
  );
};

export default InventoryFilters;
