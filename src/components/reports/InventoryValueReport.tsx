import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { getPurityValue, getPurityDisplay } from "@/utils/debtUtils";
import { convertToGrams } from "@/utils/goldCalculations";
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2pdf from 'html2pdf.js';

const InventoryValueReport: React.FC = () => {
  const { inventory, financial } = useApp();
  const [currency, setCurrency] = useState<string>("USD");
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate the total value of inventory in USD and convert to selected currency
  const calculateInventoryValue = () => {
    // For now, we're using a simple 1:1 exchange rate for demo purposes
    // In a real application, you would use actual exchange rates
    const exchangeRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      CHF: 0.90
    };
    
    const spotPrice = financial.spotPrice; // USD per troy ounce
    const spotPricePerGram = spotPrice / 31.1035; // Convert to USD per gram
    
    return inventory.map(item => {
      // Convert weight to grams for consistent calculation
      const weightInGrams = convertToGrams(item.weight, item.weightUnit);
      
      // Get purity as a decimal (e.g., 0.995, 0.916)
      const purityFactor = getPurityValue(item.purity);
      
      // Calculate pure gold content
      const pureGoldContent = weightInGrams * purityFactor;
      
      // Calculate value in USD
      const valueUSD = pureGoldContent * spotPricePerGram * item.quantity;
      
      // Convert to selected currency
      const valueInSelectedCurrency = valueUSD * (1 / (exchangeRates[currency] || 1));
      
      return {
        ...item,
        purityDisplay: getPurityDisplay(item.purity),
        pureGoldContent: pureGoldContent * item.quantity,
        valueUSD,
        valueInCurrency: valueInSelectedCurrency
      };
    });
  };
  
  const inventoryWithValues = calculateInventoryValue();
  
  // Calculate totals
  const totalItems = inventoryWithValues.reduce((total, item) => total + item.quantity, 0);
  const totalPureGold = inventoryWithValues.reduce((total, item) => total + item.pureGoldContent, 0);
  const totalValueUSD = inventoryWithValues.reduce((total, item) => total + item.valueUSD, 0);
  const totalValueInCurrency = inventoryWithValues.reduce((total, item) => total + item.valueInCurrency, 0);

  // Export the report as PDF
  const exportToPdf = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `inventory-value-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    try {
      await html2pdf().from(element).set(opt).save();
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsGenerating(false);
    }
  };

  // Print the report
  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Inventory Value Report</h2>
        <div className="flex items-center gap-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CHF">CHF (₣)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.location.reload()} className="flex gap-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" onClick={printReport} className="flex gap-2">
            <Printer size={16} />
            <span>Print</span>
          </Button>
          <Button 
            onClick={exportToPdf} 
            className="bg-amber-500 hover:bg-amber-600 text-white flex gap-2"
            disabled={isGenerating}
          >
            <FileDown size={16} />
            <span>{isGenerating ? 'Generating...' : 'Export PDF'}</span>
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-4 print:p-4">
        <div className="print:block hidden mb-8">
          <h1 className="text-2xl font-bold text-center">Inventory Value Report</h1>
          <p className="text-center text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-center">
            Gold Spot Price: {formatCurrency(financial.spotPrice)} per troy oz
          </p>
        </div>

        <Card>
          <CardHeader className="bg-muted print:bg-white">
            <CardTitle>Inventory Value Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Pure Gold Content</h3>
                <p className="text-2xl font-bold">{formatWeight(totalPureGold)}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Total Value (USD)</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalValueUSD)}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Total Value ({currency})</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalValueInCurrency)}</p>
              </div>
            </div>

            <div className="rounded-md border print:border-black">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Register</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Pure Gold (g)</TableHead>
                    <TableHead className="text-right">Value (USD)</TableHead>
                    <TableHead className="text-right">Value ({currency})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryWithValues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryWithValues.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>{item.purityDisplay}</TableCell>
                        <TableCell>{item.weight} {item.weightUnit}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatWeight(item.pureGoldContent)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valueUSD)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valueInCurrency)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryValueReport;
