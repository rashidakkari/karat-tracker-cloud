import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionItem, Payment } from '@/models/transactions';
import { InventoryItem } from '@/models/inventory';
import { 
  calculateBarBuyingPrice, 
  calculateBarSellingPrice,
  calculateJewelryBuyingPrice,
  calculateJewelrySellingPrice,
  GoldPurity,
  WeightUnit,
  getPurityFactor
} from '@/utils/goldCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Save } from 'lucide-react';
import BasicInfoSection from './form-sections/BasicInfoSection';
import PricingSection from './form-sections/PricingSection';
import ItemsSection from './form-sections/ItemsSection';
import PaymentsSection from './form-sections/PaymentsSection';
import { Currency } from '@/contexts/types';

interface TransactionFormProps {
  transaction?: Transaction;
  inventoryItems: InventoryItem[];
  currentSpotPrice: number;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  inventoryItems,
  currentSpotPrice,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Transaction>>(
    transaction || {
      id: uuidv4(),
      type: 'buy',
      customerName: '',
      registerType: 'wholesale',
      items: [],
      payments: [],
      totalAmount: 0,
      balance: 0,
      currency: 'USD' as Currency,
      spotPriceAtTransaction: currentSpotPrice,
      commission: 0,
      commissionType: 'Fixed',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'User'
    }
  );

  const [selectedItems, setSelectedItems] = useState<TransactionItem[]>(transaction?.items || []);
  const [payments, setPayments] = useState<Payment[]>(transaction?.payments || []);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('items');
  const [searchText, setSearchText] = useState<string>('');
  const [manualWeight, setManualWeight] = useState<number | undefined>(undefined);
  const [customUnitPrice, setCustomUnitPrice] = useState<number | undefined>(undefined);
  const [createDebt, setCreateDebt] = useState<boolean>(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!transaction;

  useEffect(() => {
    const registerType = formData.registerType?.toLowerCase() || 'wholesale';
    const filtered = inventoryItems.filter(item => 
      (item as any).type?.toLowerCase() === registerType
    );
    setFilteredItems(filtered);
  }, [formData.registerType, inventoryItems]);

  useEffect(() => {
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const paidAmount = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      items: selectedItems,
      payments: payments,
      totalAmount: totalAmount,
      balance: totalAmount - paidAmount
    }));
  }, [selectedItems, payments]);

  const handleSearchByIdOrBarcode = () => {
    if (!searchText.trim()) {
      toast.error('Please enter an item ID or scan a barcode');
      return;
    }

    const foundItem = filteredItems.find(
      item => item.id === searchText.trim() || item.barcode === searchText.trim()
    );

    if (foundItem) {
      setSelectedItemId(foundItem.id);
      toast.success(`Found: ${foundItem.name}`);
    } else {
      toast.error('No item found with that ID or barcode');
    }
  };

  const handleBarcodeScanned = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchByIdOrBarcode();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    
    if (searchValue.trim().length >= 2) {
      const lowercaseSearch = searchValue.toLowerCase();
      const matches = filteredItems.filter(item => 
        item.name.toLowerCase().includes(lowercaseSearch) ||
        item.id.toLowerCase().includes(lowercaseSearch) ||
        (item.barcode && item.barcode.toLowerCase().includes(lowercaseSearch))
      );
      
      if (matches.length === 1) {
        setSelectedItemId(matches[0].id);
      }
    }
  };

  const addItem = () => {
    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    const inventoryItem = filteredItems.find(item => item.id === selectedItemId);
    if (!inventoryItem) {
      toast.error('Selected item not found in inventory');
      return;
    }
    
    const itemWeight = manualWeight !== undefined ? manualWeight : inventoryItem.weight;
    
    if (itemWeight <= 0) {
      toast.error('Weight must be greater than 0');
      return;
    }
    
    let unitPrice = 0;
    const isBars = inventoryItem.category.toLowerCase() === 'bars' || inventoryItem.category.toLowerCase() === 'coins';
    const purity = inventoryItem.purity as GoldPurity;
    
    if (customUnitPrice !== undefined && customUnitPrice > 0) {
      unitPrice = customUnitPrice;
    } else {
      if (formData.type === 'buy') {
        unitPrice = isBars 
          ? calculateBarBuyingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995')
          : calculateJewelryBuyingPrice(currentSpotPrice, itemWeight, purity, 0, getPurityFactor);
      } else {
        unitPrice = isBars
          ? calculateBarSellingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995', formData.commission || 0)
          : calculateJewelrySellingPrice(currentSpotPrice, itemWeight, purity, formData.commission || 0, getPurityFactor);
      }
    }
    
    const totalPrice = unitPrice * quantity;
    
    const newItem: TransactionItem = {
      id: uuidv4(),
      inventoryItemId: inventoryItem.id,
      inventoryItem: inventoryItem,
      name: inventoryItem.name,
      category: inventoryItem.category,
      purity: inventoryItem.purity,
      weight: itemWeight,
      weightUnit: inventoryItem.weightUnit,
      quantity: quantity,
      unitPrice: unitPrice,
      pricePerUnit: unitPrice,
      totalPrice: totalPrice,
      subtotal: totalPrice,
      currency: formData.currency as string
    };
    
    if (formData.type === 'sell') {
      if (inventoryItem.quantity < quantity) {
        toast.error(`Not enough quantity available. Only ${inventoryItem.quantity} in stock.`);
        return;
      }
    }
    
    setSelectedItems([...selectedItems, newItem]);
    setSelectedItemId('');
    setQuantity(1);
    setManualWeight(undefined);
    setCustomUnitPrice(undefined);
    setSearchText('');
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const addPayment = () => {
    const newPayment: Payment = {
      method: 'Cash',
      amount: 0,
      currency: formData.currency as Currency
    };
    
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (index: number, field: keyof Payment, value: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: value
    };
    
    setPayments(updatedPayments);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
      updatedAt: new Date()
    });
  };

  const handleAddFullPayment = () => {
    const totalAmount = formData.totalAmount || 0;
    
    if (totalAmount <= 0) {
      toast.error('No items added yet. Add items first to calculate total.');
      return;
    }
    
    if (payments.length > 0) {
      const updatedPayments = [...payments];
      updatedPayments[0] = {
        ...updatedPayments[0],
        method: 'Cash',
        amount: totalAmount,
        currency: formData.currency as Currency
      };
      setPayments(updatedPayments);
    } else {
      const newPayment: Payment = {
        method: 'Cash',
        amount: totalAmount,
        currency: formData.currency as Currency
      };
      setPayments([newPayment]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || formData.customerName.trim() === '') {
      toast.error('Customer name is required');
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error('At least one item is required');
      return;
    }
    
    const totalAmount = formData.totalAmount || 0;
    const paidAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const hasUnpaidAmount = paidAmount < totalAmount;
    
    if (hasUnpaidAmount && !createDebt) {
      toast.warning('Transaction has unpaid amount. Please check "Create Debt" to continue or add full payment.');
      return;
    }
    
    const finalTransaction: Transaction = {
      ...formData as Transaction,
      items: selectedItems,
      payments: payments,
      status: payments.length > 0 && !hasUnpaidAmount ? 'Completed' : 'Pending'
    };
    
    onSave(finalTransaction);
  };

  const focusBarcodeInput = () => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleCalculatePrice = () => {
    if (!selectedItemId) {
      toast.error('Please select an item first');
      return;
    }
    
    const item = filteredItems.find(i => i.id === selectedItemId);
    if (!item) return;
    
    const itemWeight = manualWeight !== undefined ? manualWeight : item.weight;
    const isBars = item.category.toLowerCase() === 'bars' || item.category.toLowerCase() === 'coins';
    const purity = item.purity as GoldPurity;
    
    let calculatedPrice = 0;
    if (formData.type === 'buy') {
      calculatedPrice = isBars 
        ? calculateBarBuyingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995') 
        : calculateJewelryBuyingPrice(currentSpotPrice, itemWeight, purity, 0, getPurityFactor);
    } else {
      calculatedPrice = isBars
        ? calculateBarSellingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995', formData.commission || 0)
        : calculateJewelrySellingPrice(currentSpotPrice, itemWeight, purity, formData.commission || 0, getPurityFactor);
    }
    
    setCustomUnitPrice(calculatedPrice);
    toast.success(`Calculated price: ${calculatedPrice.toFixed(2)} ${formData.currency}`);
  };

  return (
    <Card className="shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      <CardHeader className="bg-secondary/80 sticky top-0 z-10 p-4">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>{isEditing ? 'Edit Transaction' : 'New Transaction'}</span>
          <div className="text-sm font-normal flex items-center">
            <span className="mr-2">Spot Price:</span>
            <span className="font-bold">${currentSpotPrice}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          <BasicInfoSection
            type={formData.type || 'buy'}
            registerType={formData.registerType || 'wholesale'}
            customerName={formData.customerName || ''}
            customerPhone={formData.customerPhone || ''}
            onTypeChange={(value) => handleChange('type', value)}
            onRegisterTypeChange={(value) => handleChange('registerType', value)}
            onCustomerNameChange={(value) => handleChange('customerName', value)}
            onCustomerPhoneChange={(value) => handleChange('customerPhone', value)}
          />
          
          <PricingSection
            currency={formData.currency as Currency || 'USD'}
            spotPrice={formData.spotPriceAtTransaction || currentSpotPrice}
            commission={formData.commission || 0}
            commissionType={formData.commissionType || 'Fixed'}
            onCurrencyChange={(value) => handleChange('currency', value)}
            onSpotPriceChange={(value) => handleChange('spotPriceAtTransaction', value)}
            onCommissionChange={(value) => handleChange('commission', value)}
            onCommissionTypeChange={(value) => handleChange('commissionType', value)}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="space-y-4 pt-4">
              <ItemsSection
                selectedItems={selectedItems}
                filteredItems={filteredItems}
                selectedItemId={selectedItemId}
                quantity={quantity}
                manualWeight={manualWeight}
                customUnitPrice={customUnitPrice}
                onSelectedItemChange={setSelectedItemId}
                onQuantityChange={setQuantity}
                onManualWeightChange={setManualWeight}
                onCustomUnitPriceChange={setCustomUnitPrice}
                onSearchChange={setSearchText}
                onSearchSubmit={handleSearchByIdOrBarcode}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onCalculatePrice={handleCalculatePrice}
                searchText={searchText}
              />
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4 pt-4">
              <PaymentsSection
                payments={payments}
                type={formData.type || 'buy'}
                totalAmount={formData.totalAmount || 0}
                balance={formData.balance || 0}
                currency={formData.currency as Currency || 'USD'}
                createDebt={createDebt}
                onPaymentsChange={setPayments}
                onCreateDebtChange={setCreateDebt}
                onAddFullPayment={handleAddFullPayment}
              />
            </TabsContent>
          </Tabs>
          
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
            {isEditing ? 'Update Transaction' : 'Complete Transaction'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TransactionForm;
