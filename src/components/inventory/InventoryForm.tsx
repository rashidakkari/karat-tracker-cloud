
import React, { useState } from 'react';
import { InventoryItem, ItemCategory, GoldPurity, WeightUnit } from '@/models/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Save } from 'lucide-react';
import BasicInfoSection from './form-sections/BasicInfoSection';
import WeightSection from './form-sections/WeightSection';
import QuantitySection from './form-sections/QuantitySection';
import OptionalSection from './form-sections/OptionalSection';
import { Currency } from '@/contexts/types';

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
      tags: [],
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
          <BasicInfoSection
            name={formData.name || ''}
            category={formData.category as ItemCategory}
            onNameChange={(value) => handleChange('name', value)}
            onCategoryChange={(value) => handleChange('category', value as ItemCategory)}
          />
          
          <WeightSection
            weight={formData.weight || 0}
            weightUnit={formData.weightUnit || 'g'}
            purity={formData.purity || '995'}
            onWeightChange={(value) => handleChange('weight', value)}
            onWeightUnitChange={(value) => handleChange('weightUnit', value)}
            onPurityChange={(value) => handleChange('purity', value)}
          />
          
          <QuantitySection
            quantity={formData.quantity || 1}
            costPrice={formData.costPrice || 0}
            costCurrency={formData.costCurrency || 'USD'}
            onQuantityChange={(value) => handleChange('quantity', value)}
            onCostPriceChange={(value) => handleChange('costPrice', value)}
            onCostCurrencyChange={(value) => handleChange('costCurrency', value)}
          />
          
          <OptionalSection
            location={formData.location || ''}
            supplier={formData.supplier || ''}
            notes={formData.notes || ''}
            tags={formData.tags || []}
            onLocationChange={(value) => handleChange('location', value)}
            onSupplierChange={(value) => handleChange('supplier', value)}
            onNotesChange={(value) => handleChange('notes', value)}
            onTagsChange={(value) => handleChange('tags', value)}
          />
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
