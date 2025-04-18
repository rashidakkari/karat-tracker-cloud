import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { calculateTotalDebtAmount, calculateTotalGoldDebtAmount } from '@/utils/debtUtils';
import html2pdf from 'html2pdf.js';
import { convertToGrams, getPurityFactor } from '@/utils/goldCalculations';

const FinancialStatusReport: React.FC = () => {
  const { inventory, financial } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const calculateTotalInventoryValue = () => {
    const spotPrice = financial.spotPrice; // USD per troy ounce
    const spotPricePerGram = spotPrice / 31.1035; // Convert to USD per gram
    
    return inventory.reduce((total, item) => {
      const weightInGrams = convertToGrams(item.weight, item.weightUnit);
      const purityFactor = getPurityFactor(item.purity);
      const pureGoldContent = weightInGrams * purityFactor;
      const valueUSD = pureGoldContent * spotPricePerGram * item.quantity;
      
      return total + valueUSD;
    }, 0);
  };
  
  const calculateTotalRegisterBalance = () => {
    const wholesaleUSD = financial.wholesaleBalance?.USD || 0;
    const retailUSD = financial.retailBalance?.USD || 0;
    return wholesaleUSD + retailUSD;
  };
  
  const customerDebtAmount = calculateTotalDebtAmount(
    financial.customerDebts || [], 
    'customer', 
    undefined
  );
  
  const borrowedDebtAmount = calculateTotalDebtAmount(
    financial.borrowedDebts || [], 
    'borrowed', 
    undefined
  );
  
  const customerGoldDebtAmount = calculateTotalGoldDebtAmount(
    financial.customerDebts || [],
    'customer',
    undefined
  );
  
  const borrowedGoldDebtAmount = calculateTotalGoldDebtAmount(
    financial.borrowedDebts || [],
    'borrowed',
    undefined
  );
  
  const totalInventoryValue = calculateTotalInventoryValue();
  const totalRegisterBalance = calculateTotalRegisterBalance();
  const totalAssets = totalInventoryValue + totalRegisterBalance + customerDebtAmount;
  const totalLiabilities = borrowedDebtAmount;
  const netWorth = totalAssets - totalLiabilities;
  
  const exportToPdf = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `financial-status-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      await html2pdf().from(element).set(opt).save();
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Financial Status Report</h2>
        <div className="flex items-center gap-2">
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
          <h1 className="text-2xl font-bold text-center">Financial Status Report</h1>
          <p className="text-center text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-center">
            Gold Spot Price: {formatCurrency(financial.spotPrice)} per troy oz
          </p>
        </div>
        
        <Card>
          <CardHeader className="bg-muted print:bg-white">
            <CardTitle>Financial Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Total Assets</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalAssets)}</p>
                <p className="text-xs text-muted-foreground">Inventory + Cash + Receivables</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Total Liabilities</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</p>
                <p className="text-xs text-muted-foreground">Borrowed Debts</p>
              </div>
              <div className="bg-green-100 p-4 rounded-md print:border">
                <h3 className="text-sm font-medium text-muted-foreground">Net Worth</h3>
                <p className="text-2xl font-bold">{formatCurrency(netWorth)}</p>
                <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Assets</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Type</TableHead>
                      <TableHead className="text-right">Value (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Inventory Value</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalInventoryValue)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cash in Registers</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalRegisterBalance)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customer Debts (Cash)</TableCell>
                      <TableCell className="text-right">{formatCurrency(customerDebtAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customer Debts (Gold)</TableCell>
                      <TableCell className="text-right">
                        {customerGoldDebtAmount > 0 ? `${formatWeight(customerGoldDebtAmount)}` : 'None'}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>Total Assets</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Liabilities</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Liability Type</TableHead>
                      <TableHead className="text-right">Value (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Borrowed Debts (Cash)</TableCell>
                      <TableCell className="text-right">{formatCurrency(borrowedDebtAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Borrowed Debts (Gold)</TableCell>
                      <TableCell className="text-right">
                        {borrowedGoldDebtAmount > 0 ? `${formatWeight(borrowedGoldDebtAmount)}` : 'None'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expenses Payable</TableCell>
                      <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>Total Liabilities</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 rounded-md border border-amber-200 print:border-black">
              <h3 className="font-semibold mb-2">Notes</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>This report reflects the financial status as of {new Date().toLocaleDateString()}</li>
                <li>Gold value is calculated based on the current spot price of {formatCurrency(financial.spotPrice)} per troy oz</li>
                <li>Customer gold debts and borrowed gold debts are shown in weight (grams) and not included in the cash totals</li>
                <li>For more detailed analysis, please refer to the Inventory Value Report and Transaction Reports</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialStatusReport;
