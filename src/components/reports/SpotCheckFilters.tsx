
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from "lucide-react";
import { RegisterFilterType, CategoryFilterType } from '@/hooks/useSpotCheck';

interface SpotCheckFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  registerFilter: RegisterFilterType;
  setRegisterFilter: (filter: RegisterFilterType) => void;
  categoryFilter: CategoryFilterType;
  setCategoryFilter: (filter: CategoryFilterType) => void;
  showSoldItems: boolean;
  setShowSoldItems: (show: boolean) => void;
  clearFilters: () => void;
}

const SpotCheckFilters: React.FC<SpotCheckFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  registerFilter,
  setRegisterFilter,
  categoryFilter,
  setCategoryFilter,
  showSoldItems,
  setShowSoldItems,
  clearFilters
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      </div>
      
      <div className="w-[180px]">
        <Select value={registerFilter} onValueChange={(value) => setRegisterFilter(value as RegisterFilterType)}>
          <SelectTrigger>
            <SelectValue placeholder="Register" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registers</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-[180px]">
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilterType)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bars">Bars</SelectItem>
            <SelectItem value="coins">Coins</SelectItem>
            <SelectItem value="jewelry">Jewelry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="sold-items" 
          checked={showSoldItems}
          onCheckedChange={(checked) => setShowSoldItems(checked === true)}
        />
        <label
          htmlFor="sold-items"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show only sold items
        </label>
      </div>
      
      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
};

export default SpotCheckFilters;
