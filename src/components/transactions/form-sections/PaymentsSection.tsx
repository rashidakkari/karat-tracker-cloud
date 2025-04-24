
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Wallet, CreditCard, PlusCircle, Trash } from 'lucide-react';
import { Payment } from '@/models/transactions';
import { Currency } from '@/contexts/types';

interface PaymentsSectionProps {
  payments: Payment[];
  type: 'buy' | 'sell';
  totalAmount: number;
  balance: number;
  currency: Currency;
  createDebt: boolean;
  onPaymentsChange: (payments: Payment[]) => void;
  onCreateDebtChange: (value: boolean) => void;
  onAddFullPayment: () => void;
}

const PaymentsSection = ({
  payments,
  type,
  totalAmount,
  balance,
  currency,
  createDebt,
  onPaymentsChange,
  onCreateDebtChange,
  onAddFullPayment
}: PaymentsSectionProps) => {
  const addPayment = () => {
    const newPayment: Payment = {
      method: 'Cash',
      amount: 0,
      currency: currency
    };
    onPaymentsChange([...payments, newPayment]);
  };

  const updatePayment = (index: number, field: keyof Payment, value: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: value
    };
    onPaymentsChange(updatedPayments);
  };

  const removePayment = (index: number) => {
    onPaymentsChange(payments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Payment Methods</h3>
        <div className="flex space-x-2">
          <Button type="button" onClick={onAddFullPayment} variant="outline" size="sm">
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
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="createDebt" 
          checked={createDebt} 
          onCheckedChange={(checked) => onCreateDebtChange(checked === true)} 
        />
        <Label htmlFor="createDebt" className="cursor-pointer">
          {type === 'buy' ? 
            "Create debt record (we owe the supplier)" : 
            "Create debt record (customer owes us)"
          }
        </Label>
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-secondary/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-semibold">
              {totalAmount?.toFixed(2) || '0.00'} {currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-xl font-semibold">
              {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)} {currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining Balance</p>
            <p className={`text-xl font-semibold ${balance === 0 ? 'text-green-500' : 'text-amber-500'}`}>
              {balance?.toFixed(2) || '0.00'} {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSection;
