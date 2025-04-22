
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";
import { formatWeight, formatCurrency } from '@/utils/formatters';
import { EnrichedInventoryItem } from '@/hooks/useSpotCheck';

interface SpotCheckTableProps {
  inventory: EnrichedInventoryItem[];
  onToggleFeatured: (itemId: string, currentStatus: boolean) => void;
}

const SpotCheckTable: React.FC<SpotCheckTableProps> = ({
  inventory,
  onToggleFeatured
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Register</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Purity</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">24K Equivalent</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead className="text-right">Sold Qty</TableHead>
            <TableHead className="text-right">Sales Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={item.isFeatured ? "text-amber-500" : "text-gray-400"} 
                    onClick={() => onToggleFeatured(item.id, item.isFeatured)}
                  >
                    <Star className="h-4 w-4" fill={item.isFeatured ? "currentColor" : "none"} />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.type}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell>{item.purity}</TableCell>
                <TableCell>{item.weight} {item.weightUnit}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatWeight(item.equivalent24k || 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.totalCurrentValue)}</TableCell>
                <TableCell className="text-right">{item.salesQuantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.salesValue)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SpotCheckTable;
