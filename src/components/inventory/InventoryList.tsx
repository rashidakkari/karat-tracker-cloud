
import React, { useState } from 'react';
import { InventoryItem, RegisterType, GoldPurity } from '@/models/inventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { convertTo24K } from '@/utils/goldCalculations';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryListProps {
  registerType: RegisterType;
  items: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onViewItem: (item: InventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  registerType,
  items,
  onAddItem,
  onEditItem,
  onViewItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = items.filter(item => {
    // Apply search term filter
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Apply category filter
    const matchesFilter = filter === 'all' || 
      (item.category && item.category.toLowerCase() === filter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const registerTitle = registerType === 'Wholesale' ? 'Wholesale Inventory (Bars)' : 'Retail Inventory (Jewelry)';
  
  const getTotalValue = (items: InventoryItem[]): number => {
    return items.reduce((total, item) => {
      const weight24K = convertTo24K(item.weight, item.purity);
      return total + (weight24K * (item.quantity || 1));
    }, 0);
  };

  const getCategoryCount = (category: string): number => {
    return items.filter(item => 
      item.category && item.category.toLowerCase() === category.toLowerCase()
    ).length;
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
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, barcode or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex space-x-2">
            <Badge 
              className={cn(
                "px-3 py-1 cursor-pointer", 
                filter === 'all' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80"
              )}
              onClick={() => setFilter('all')}
            >
              All ({items.length})
            </Badge>
            <Badge 
              className={cn(
                "px-3 py-1 cursor-pointer", 
                filter === 'bars' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80"
              )}
              onClick={() => setFilter('bars')}
            >
              Bars ({getCategoryCount('bars')})
            </Badge>
            <Badge 
              className={cn(
                "px-3 py-1 cursor-pointer", 
                filter === 'coins' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80"
              )}
              onClick={() => setFilter('coins')}
            >
              Coins ({getCategoryCount('coins')})
            </Badge>
            <Badge 
              className={cn(
                "px-3 py-1 cursor-pointer", 
                filter === 'jewelry' ? "bg-gold hover:bg-gold-dark" : "bg-secondary text-primary hover:bg-secondary/80"
              )}
              onClick={() => setFilter('jewelry')}
            >
              Jewelry ({getCategoryCount('jewelry')})
            </Badge>
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purity</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">24K Equivalent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.purity}</TableCell>
                    <TableCell>
                      {item.weight} {item.weightUnit}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {(convertTo24K(item.weight, item.purity) * (item.quantity || 1)).toFixed(3)}g
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewItem(item)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditItem(item)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No items found. Add some inventory or try a different search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryList;
