
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
  CurrencyCode
} from '@/utils/goldCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  PlusCircle, 
  MinusCircle, 
  Trash, 
  Save, 
  Search, 
  QrCode, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Calculator 
} from 'lucide-react';

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
  const [searchText, setSearchText] = useState<string>('');
  const [manualWeight, setManualWeight] = useState<number | undefined>(undefined);
  const [customUnitPrice, setCustomUnitPrice] = useState<number | undefined>(undefined);
  const [createDebt, setCreateDebt] = useState<boolean>(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!transaction;

  // Filter inventory items based on the register type
  useEffect(() => {
    const registerType = formData.registerType?.toLowerCase() || 'wholesale';
    const filtered = inventoryItems.filter(item => 
      (item as any).type?.toLowerCase() === registerType
    );
    setFilteredItems(filtered);
  }, [formData.registerType, inventoryItems]);

  // Calculate totals when items or payments change
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

  // Handle barcode search
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

  // Handle barcode scanner enter key
  const handleBarcodeScanned = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchByIdOrBarcode();
    }
  };

  // Handle search input change with filtering
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

  // Add item to transaction
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
    
    // Use manual weight if provided, otherwise use inventory item weight
    const itemWeight = manualWeight !== undefined ? manualWeight : inventoryItem.weight;
    
    if (itemWeight <= 0) {
      toast.error('Weight must be greater than 0');
      return;
    }
    
    let unitPrice = 0;
    const isBars = inventoryItem.category.toLowerCase() === 'bars' || inventoryItem.category.toLowerCase() === 'coins';
    const purity = inventoryItem.purity as GoldPurity;
    
    if (customUnitPrice !== undefined && customUnitPrice > 0) {
      // Use custom unit price if provided
      unitPrice = customUnitPrice;
    } else {
      // Calculate price based on formula
      if (formData.type === 'Buy') {
        unitPrice = isBars 
          ? calculateBarBuyingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995')
          : calculateJewelryBuyingPrice(currentSpotPrice, itemWeight, purity);
      } else {
        unitPrice = isBars
          ? calculateBarSellingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995', formData.commission || 0)
          : calculateJewelrySellingPrice(currentSpotPrice, itemWeight, purity, formData.commission || 0);
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
      weight: itemWeight, // Use the potentially modified weight
      weightUnit: inventoryItem.weightUnit,
      quantity: quantity,
      unitPrice: unitPrice,
      pricePerUnit: unitPrice,
      totalPrice: totalPrice,
      subtotal: totalPrice,
      currency: formData.currency as string
    };
    
    // Check if the item can be added based on inventory availability
    if (formData.type === 'Sell') {
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

  // Remove item from transaction
  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  // Add payment method
  const addPayment = () => {
    const newPayment: Payment = {
      method: 'Cash',
      amount: 0,
      currency: formData.currency as CurrencyCode
    };
    
    setPayments([...payments, newPayment]);
  };

  // Update payment details
  const updatePayment = (index: number, field: keyof Payment, value: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: value
    };
    
    setPayments(updatedPayments);
  };

  // Remove payment
  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // Update form data for a specific field
  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
      updatedAt: new Date()
    });
  };

  // Add full payment amount
  const handleAddFullPayment = () => {
    const totalAmount = formData.totalAmount || 0;
    
    if (totalAmount <= 0) {
      toast.error('No items added yet. Add items first to calculate total.');
      return;
    }
    
    // Check if we already have a payment
    if (payments.length > 0) {
      // Update first payment to full amount
      const updatedPayments = [...payments];
      updatedPayments[0] = {
        ...updatedPayments[0],
        method: 'Cash',
        amount: totalAmount,
        currency: formData.currency as CurrencyCode
      };
      setPayments(updatedPayments);
    } else {
      // Create new payment with full amount
      const newPayment: Payment = {
        method: 'Cash',
        amount: totalAmount,
        currency: formData.currency as CurrencyCode
      };
      setPayments([newPayment]);
    }
  };

  // Handle form submission
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
    
    // Determine if there's an unpaid amount that should create a debt
    const totalAmount = formData.totalAmount || 0;
    const paidAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const hasUnpaidAmount = paidAmount < totalAmount;
    
    // If there's an unpaid amount and createDebt is not checked, show warning
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

  // Focus barcode input field
  const focusBarcodeInput = () => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Auto-calculate price when relevant fields change
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
    if (formData.type === 'Buy') {
      calculatedPrice = isBars 
        ? calculateBarBuyingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995') 
        : calculateJewelryBuyingPrice(currentSpotPrice, itemWeight, purity);
    } else {
      calculatedPrice = isBars
        ? calculateBarSellingPrice(currentSpotPrice, itemWeight, purity as '999.9' | '995', formData.commission || 0)
        : calculateJewelrySellingPrice(currentSpotPrice, itemWeight, purity, formData.commission || 0);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transaction Type and Register Type */}
            <div className="flex space-x-2">
              <div className="space-y-2 flex-1">
                <Label htmlFor="type">Transaction Type*</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy (from customer)</SelectItem>
                    <SelectItem value="Sell">Sell (to customer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="registerType">Register*</Label>
                <Select
                  value={formData.registerType}
                  onValueChange={(value: any) => handleChange('registerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select register" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="flex space-x-2">
              <div className="space-y-2 flex-1">
                <Label htmlFor="customerName">Customer Name*</Label>
                <Input
                  id="customerName"
                  value={formData.customerName || ''}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone || ''}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Currency, Spot Price, and Commission Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency*</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: any) => handleChange('currency', value)}
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
                  onValueChange={(value: any) => handleChange('commissionType', value)}
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
          
          {/* Transaction Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            {/* Items Tab */}
            <TabsContent value="items" className="space-y-4 pt-4">
              {/* Item Search */}
              <div className="flex space-x-2 p-3 border rounded-md bg-secondary/10">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="itemSearch">Search Items</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="itemSearch"
                        ref={barcodeInputRef}
                        value={searchText}
                        onChange={handleSearchChange}
                        onKeyDown={handleBarcodeScanned}
                        placeholder="Search by name, ID, or scan barcode"
                      />
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={handleSearchByIdOrBarcode}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button type="button" onClick={focusBarcodeInput} variant="outline">
                      <QrCode className="h-4 w-4 mr-1" /> Scan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Item Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedItem">Select Item</Label>
                  <Select
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
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
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <Button type="button" onClick={addItem} className="mb-0.5">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
              
              {/* Custom Weight and Price Section */}
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
                      setManualWeight(value);
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
                      setCustomUnitPrice(value);
                    }}
                    placeholder="Override price"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleCalculatePrice}
                    className="flex-1 mb-0.5"
                    variant="outline"
                  >
                    <Calculator className="h-4 w-4 mr-1" /> Calculate Price
                  </Button>
                </div>
              </div>
              
              {/* Item Table */}
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
                              onClick={() => removeItem(item.id as string)}
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
            
            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <div className="flex space-x-2">
                  <Button type="button" onClick={handleAddFullPayment} variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-1" /> Full Payment
                  </Button>
                  <Button type="button" onClick={addPayment} variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Method
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <div key={index} className="flex items-end gap-2 p-3 border rounded-md bg-secondary/10">
                      {/* Payment Method */}
                      <div className="space-y-2 flex-1">
                        <Label htmlFor={`payment-method-${index}`}>Method</Label>
                        <Select
                          value={payment.method}
                          onValueChange={(value) => updatePayment(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" /> Cash
                              </span>
                            </SelectItem>
                            <SelectItem value="Gold">
                              <span className="flex items-center">
                                <Wallet className="h-4 w-4 mr-1" /> Gold
                              </span>
                            </SelectItem>
                            <SelectItem value="Credit Card">
                              <span className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-1" /> Credit Card
                              </span>
                            </SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Payment Amount */}
                      <div className="space-y-2 flex-1">
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
                      
                      {/* Payment Currency */}
                      <div className="space-y-2 flex-1">
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
                      
                      {/* Gold-specific fields */}
                      {payment.method === 'Gold' && (
                        <>
                          <div className="space-y-2 flex-1">
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
                          
                          <div className="space-y-2 flex-1">
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
                      
                      {/* Remove Payment Button */}
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
              
              {/* Create Debt Option */}
              {formData.totalAmount && formData.totalAmount > 0 && (
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="createDebt" 
                    checked={createDebt} 
                    onCheckedChange={(checked) => setCreateDebt(checked === true)} 
                  />
                  <Label htmlFor="createDebt" className="cursor-pointer">
                    {formData.type === 'Buy' ? 
                      "Create debt record (we owe the supplier)" : 
                      "Create debt record (customer owes us)"
                    }
                  </Label>
                </div>
              )}
              
              {/* Transaction Summary */}
              <div className="mt-4 p-4 border rounded-md bg-secondary/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-semibold">
                      {formData.totalAmount?.toFixed(2) || '0.00'} {formData.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <p className="text-xl font-semibold">
                      {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)} {formData.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className={`text-xl font-semibold ${formData.balance === 0 ? 'text-green-500' : 'text-amber-500'}`}>
                      {formData.balance?.toFixed(2) || '0.00'} {formData.currency}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Notes Section */}
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
        
        {/* Form Footer */}
        <CardFooter className="flex justify-between bg-secondary/30 border-t p-4 sticky bottom-0 z-10">
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
