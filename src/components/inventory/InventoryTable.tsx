
import React from 'react';
import { InventoryItem } from '@/models/inventory';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { convertTo24K } from '@/utils/goldCalculations';

interface InventoryTableProps {
  items: InventoryItem[];
  onEditItem: (item: InventoryItem) => void;
  onViewItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const InventoryTable = ({ items, onEditItem, onViewItem, onDeleteItem }: InventoryTableProps) => {
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);

  return (
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
          {items.length > 0 ? (
            items.map((item) => (
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
                  {((item.equivalent24k || convertTo24K(item.weight, item.purity)) * (item.quantity || 1)).toFixed(3)}g
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewItem(item)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditItem(item)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => setItemToDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this inventory item. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          if (itemToDelete) {
                            onDeleteItem(itemToDelete);
                            setItemToDelete(null);
                          }
                        }} className="bg-red-500 hover:bg-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
  );
};

export default InventoryTable;
