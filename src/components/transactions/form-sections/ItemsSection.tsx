
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, QrCode, Calculator, PlusCircle, MinusCircle } from 'lucide-react';
import { InventoryItem, TransactionItem } from '@/models/inventory';
import { toast } from 'sonner';

interface ItemsSectionProps {
  selectedItems: TransactionItem[];
  filteredItems: InventoryItem[];
  selectedItemId: string;
  quantity: number;
  manualWeight?: number;
  customUnitPrice?: number;
  onSelectedItemChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onManualWeightChange: (value: number | undefined) => void;
  onCustomUnitPriceChange: (value: number | undefined) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onCalculatePrice: () => void;
  searchText: string;
}

const ItemsSection = ({
  selectedItems,
  filteredItems,
  selectedItemId,
  quantity,
  manualWeight,
  customUnitPrice,
  onSelectedItemChange,
  onQuantityChange,
  onManualWeightChange,
  onCustomUnitPriceChange,
  onSearchChange,
  onSearchSubmit,
  onAddItem,
  onRemoveItem,
  onCalculatePrice,
  searchText
}: ItemsSectionProps) => {
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);

  const handleBarcodeScanned = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 p-3 border rounded-md bg-secondary/10">
        <div className="flex-1 space-y-2">
          <Label htmlFor="itemSearch">Search Items</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="itemSearch"
                ref={barcodeInputRef}
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleBarcodeScanned}
                placeholder="Search by name, ID, or scan barcode"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={onSearchSubmit}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              type="button" 
              onClick={() => barcodeInputRef.current?.focus()} 
              variant="outline"
            >
              <QrCode className="h-4 w-4 mr-1" /> Scan
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="selectedItem">Select Item</Label>
          <Select
            value={selectedItemId}
            onValueChange={onSelectedItemChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {filteredItems.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} - {item.purity} - {item.weight}{item.weightUnit} ({item.quantity} available)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <Button type="button" onClick={onAddItem} className="mb-0.5">
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 border rounded-md bg-secondary/10">
        <div className="space-y-2">
          <Label htmlFor="manualWeight">
            Custom Weight (g) <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="manualWeight"
            type="number"
            step="0.001"
            min="0"
            value={manualWeight !== undefined ? manualWeight : ''}
            onChange={(e) => {
              const value = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
              onManualWeightChange(value);
            }}
            placeholder="Override weight"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customPrice">
            Custom Unit Price <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="customPrice"
            type="number"
            step="0.01"
            min="0"
            value={customUnitPrice !== undefined ? customUnitPrice : ''}
            onChange={(e) => {
              const value = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
              onCustomUnitPriceChange(value);
            }}
            placeholder="Override price"
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            type="button" 
            onClick={onCalculatePrice}
            className="flex-1 mb-0.5"
            variant="outline"
          >
            <Calculator className="h-4 w-4 mr-1" /> Calculate Price
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.purity}</TableCell>
                  <TableCell>
                    {item.weight} {item.weightUnit}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice?.toFixed(2)} {item.currency}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalPrice?.toFixed(2)} {item.currency}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id as string)}
                    >
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No items added yet. Select an item and add it to the transaction.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemsSection;
