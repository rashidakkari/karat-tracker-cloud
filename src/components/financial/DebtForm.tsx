
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';

interface DebtFormProps {
  type: 'customer' | 'borrowed';
  onClose: () => void;
}

const formSchema = z.object({
  personName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  contactInfo: z.string().optional(),
  amount: z.coerce.number().min(0, {
    message: "Amount must be a positive number.",
  }),
  currency: z.string().min(1, {
    message: "Please select a currency.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  dueDate: z.string().optional(),
  includeGold: z.boolean().default(false),
  goldAmount: z.coerce.number().optional(),
  goldPurity: z.string().optional(),
  goldWeightUnit: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DebtForm: React.FC<DebtFormProps> = ({ type, onClose }) => {
  const { addDebt } = useApp();
  const [includeGold, setIncludeGold] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personName: '',
      contactInfo: '',
      amount: 0,
      currency: 'USD',
      description: '',
      dueDate: '',
      includeGold: false,
      goldAmount: 0,
      goldPurity: '999.9',
      goldWeightUnit: 'g',
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      // Create a debt object with the form data
      const debtData = {
        personName: data.personName,
        contactInfo: data.contactInfo,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        type: type,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        goldAmount: data.includeGold ? data.goldAmount : undefined,
        goldPurity: data.includeGold ? data.goldPurity : undefined,
        goldWeightUnit: data.includeGold ? data.goldWeightUnit : undefined
      };
      
      // Call addDebt with the debt object
      addDebt(debtData);
      
      toast.success(`${type === 'customer' ? 'Customer' : 'Borrowed'} debt recorded successfully`);
      onClose();
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("Failed to record debt. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="personName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type === 'customer' ? 'Customer Name' : 'Lender Name'}</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Input placeholder="Phone or email (optional)" {...field} />
              </FormControl>
              <FormDescription>Optional contact details for this person</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CHF">CHF (₣)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="includeGold"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Include Gold Debt</FormLabel>
                <FormDescription>
                  Also record gold as part of this debt
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIncludeGold(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {includeGold && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="goldAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gold Amount</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goldPurity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gold Purity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="999.9">999.9 (24K)</SelectItem>
                      <SelectItem value="995">995</SelectItem>
                      <SelectItem value="916">916 (22K)</SelectItem>
                      <SelectItem value="875">875 (21K)</SelectItem>
                      <SelectItem value="750">750 (18K)</SelectItem>
                      <SelectItem value="583">583 (14K)</SelectItem>
                      <SelectItem value="375">375 (9K)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goldWeightUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Due Date (Optional)</Label>
          <DatePicker date={dueDate} setDate={setDueDate} />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter details about this debt" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
            Record {type === 'customer' ? 'Customer' : 'Borrowed'} Debt
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DebtForm;
