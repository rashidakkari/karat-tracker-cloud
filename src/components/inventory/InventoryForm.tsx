
import React, { useState } from 'react';
import { InventoryItem, ItemCategory, GoldPurity } from '@/models/inventory';
import { WeightUnit } from '@/utils/goldCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Save } from 'lucide-react';

interface InventoryFormProps {
  item?: InventoryItem;
  onSave: (item: InventoryItem) => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    item || {
      id: uuidv4(),
      name: '',
      category: 'Bars',
      purity: '995',
      weight: 0,
      weightUnit: 'g',
      quantity: 1,
      costPrice: 0,
      costCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  const isEditing = !!item;

  const handleChange = (field: keyof InventoryItem, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
      updatedAt: new Date()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Item name is required');
      return;
    }
    
    if (!formData.purity) {
      toast.error('Purity is required');
      return;
    }
    
    if (!formData.weight || formData.weight <= 0) {
      toast.error('Weight must be greater than 0');
      return;
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    // Save the inventory item
    onSave(formData as InventoryItem);
  };

  return (
    <Card className="max-h-[80vh] overflow-hidden flex flex-col">
      <CardHeader className="bg-secondary rounded-t-lg sticky top-0 z-10 p-4">
        <CardTitle className="text-xl">
          {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Essential Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name*</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={formData.category as string}
                onValueChange={(value) => handleChange('category', value as ItemCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bars">Bars</SelectItem>
                  <SelectItem value="Coins">Coins</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Weight and Purity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight*</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                min="0.001"
                value={formData.weight || ''}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weightUnit">Unit*</Label>
              <Select
                value={formData.weightUnit as string}
                onValueChange={(value) => handleChange('weightUnit', value as WeightUnit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purity">Purity*</Label>
              <Select
                value={formData.purity as string}
                onValueChange={(value) => handleChange('purity', value as GoldPurity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="999.9">999.9</SelectItem>
                  <SelectItem value="995">995</SelectItem>
                  <SelectItem value="22K">22K</SelectItem>
                  <SelectItem value="21K">21K</SelectItem>
                  <SelectItem value="18K">18K</SelectItem>
                  <SelectItem value="14K">14K</SelectItem>
                  <SelectItem value="9K">9K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Quantity and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity*</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || 1}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice || ''}
                onChange={(e) => handleChange('costPrice', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costCurrency">Currency</Label>
              <Select
                value={formData.costCurrency as string}
                onValueChange={(value) => handleChange('costCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="min-h-20"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between bg-muted/30 border-t p-4 sticky bottom-0 z-10">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Item' : 'Save Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default InventoryForm;
