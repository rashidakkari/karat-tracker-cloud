import React, { useState, useEffect } from 'react';
import { Transaction, TransactionItem, Payment, TransactionType } from '@/models/transactions';
import { InventoryItem } from '@/models/inventory';
import { CurrencyCode, GoldPurity, WeightUnit } from '@/utils/goldCalculations';
import { 
  calculateBarBuyingPrice, 
  calculateBarSellingPrice,
  calculateJewelryBuyingPrice,
  calculateJewelrySellingPrice
} from '@/utils/goldCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, MinusCircle, Trash } from 'lucide-react';

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
      type: 'Buy',
      customerName: '',
      registerType: 'Wholesale',
      items: [],
      payments: [],
      totalAmount: 0,
      balance: 0,
      currency: 'USD',
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
  
  const isEditing = !!transaction;

  useEffect(() => {
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const paidAmount = payments.reduce((sum, payment) => {
      if (payment.method === 'Gold') {
        return sum + (payment.amount || 0);
      }
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

  const addItem = () => {
    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    const inventoryItem = inventoryItems.find(item => item.id === selectedItemId);
    if (!inventoryItem) {
      toast.error('Selected item not found in inventory');
      return;
    }
    
    let unitPrice = 0;
    const isBars = inventoryItem.category === 'Bars' || inventoryItem.category === 'Coins';
    const purity = inventoryItem.purity as GoldPurity;
    
    if (formData.type === 'Buy') {
      unitPrice = isBars 
        ? calculateBarBuyingPrice(currentSpotPrice, inventoryItem.weight, purity as '999.9' | '995')
        : calculateJewelryBuyingPrice(currentSpotPrice, inventoryItem.weight, purity);
    } else {
      unitPrice = isBars
        ? calculateBarSellingPrice(currentSpotPrice, inventoryItem.weight, purity as '999.9' | '995', formData.commission || 0)
        : calculateJewelrySellingPrice(currentSpotPrice, inventoryItem.weight, purity, formData.commission || 0);
    }
    
    const totalPrice = unitPrice * quantity;
    
    const newItem: TransactionItem = {
      id: uuidv4(),
      inventoryItemId: inventoryItem.id,
      inventoryItem: inventoryItem,
      name: inventoryItem.name,
      category: inventoryItem.category,
      purity: inventoryItem.purity,
      weight: inventoryItem.weight,
      weightUnit: inventoryItem.weightUnit,
      quantity: quantity,
      unitPrice: unitPrice,
      pricePerUnit: unitPrice,
      totalPrice: totalPrice,
      subtotal: totalPrice,
      currency: formData.currency as string
    };
    
    setSelectedItems([...selectedItems, newItem]);
    setSelectedItemId('');
    setQuantity(1);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const addPayment = () => {
    const newPayment: Payment = {
      method: 'Cash',
      amount: 0,
      currency: formData.currency as CurrencyCode
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
    
    const finalTransaction: Transaction = {
      ...formData as Transaction,
      items: selectedItems,
      payments: payments,
      status: payments.length > 0 && formData.balance === 0 ? 'Completed' : 'Pending'
    };
    
    onSave(finalTransaction);
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-secondary rounded-t-lg">
        <CardTitle className="text-xl">
          {isEditing ? 'Edit Transaction' : 'New Transaction'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy (from customer)</SelectItem>
                  <SelectItem value="Sell">Sell (to customer)</SelectItem>
                  <SelectItem value="Exchange">Exchange</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registerType">Register*</Label>
              <Select
                value={formData.registerType}
                onValueChange={(value) => handleChange('registerType', value as 'Wholesale' | 'Retail')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select register" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wholesale">Wholesale (Bars)</SelectItem>
                  <SelectItem value="Retail">Retail (Jewelry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name*</Label>
              <Input
                id="customerName"
                value={formData.customerName || ''}
                onChange={(e) => handleChange('customerName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone || ''}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency*</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value as CurrencyCode)}
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
            
            <div className="space-y-2">
              <Label htmlFor="spotPrice">Spot Price*</Label>
              <Input
                id="spotPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.spotPriceAtTransaction || currentSpotPrice}
                onChange={(e) => handleChange('spotPriceAtTransaction', parseFloat(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">Commission</Label>
              <div className="flex space-x-2">
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.commission || 0}
                  onChange={(e) => handleChange('commission', parseFloat(e.target.value))}
                />
                <Select
                  value={formData.commissionType}
                  onValueChange={(value) => handleChange('commissionType', value as 'Percentage' | 'Fixed' | 'PerGram')}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="PerGram">Per Gram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="space-y-4 pt-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="selectedItem">Select Item</Label>
                  <Select
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - {item.purity} - {item.weight}{item.weightUnit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 w-[100px]">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <Button type="button" onClick={addItem} className="mb-0.5">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Purity</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.length > 0 ? (
                      selectedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.purity}</TableCell>
                          <TableCell>
                            {item.weight} {item.weightUnit}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice.toFixed(2)} {item.currency}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.totalPrice.toFixed(2)} {item.currency}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
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
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <Button type="button" onClick={addPayment} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Payment
                </Button>
              </div>
              
              <div className="space-y-4">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <div key={index} className="flex items-end gap-2 p-3 border rounded-md bg-secondary/10">
                      <div className="space-y-2 flex-[2]">
                        <Label htmlFor={`payment-method-${index}`}>Method</Label>
                        <Select
                          value={payment.method}
                          onValueChange={(value) => updatePayment(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            <SelectItem value="Credit">Credit</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 flex-[1]">
                        <Label htmlFor={`payment-amount-${index}`}>Amount</Label>
                        <Input
                          id={`payment-amount-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={payment.amount || ''}
                          onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2 flex-[1]">
                        <Label htmlFor={`payment-currency-${index}`}>Currency</Label>
                        <Select
                          value={payment.currency}
                          onValueChange={(value) => updatePayment(index, 'currency', value)}
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
                      
                      {payment.method === 'Gold' && (
                        <>
                          <div className="space-y-2 flex-[1]">
                            <Label htmlFor={`payment-gold-weight-${index}`}>Weight</Label>
                            <Input
                              id={`payment-gold-weight-${index}`}
                              type="number"
                              step="0.001"
                              min="0"
                              value={payment.goldWeight || ''}
                              onChange={(e) => updatePayment(index, 'goldWeight', parseFloat(e.target.value))}
                            />
                          </div>
                          
                          <div className="space-y-2 flex-[1]">
                            <Label htmlFor={`payment-gold-purity-${index}`}>Purity</Label>
                            <Select
                              value={payment.goldPurity}
                              onValueChange={(value) => updatePayment(index, 'goldPurity', value)}
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
                        </>
                      )}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePayment(index)}
                        className="mb-0.5"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    No payments added yet. Add a payment method to complete the transaction.
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-4 border rounded-md bg-secondary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-semibold">
                      {formData.totalAmount?.toFixed(2) || '0.00'} {formData.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className={`text-xl font-semibold ${formData.balance === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formData.balance?.toFixed(2) || '0.00'} {formData.currency}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="min-h-24"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gold hover:bg-gold-dark">
            {isEditing ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TransactionForm;
