
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const InventorySearch = ({ searchTerm, onSearchChange }: InventorySearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, barcode or ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

export default InventorySearch;
