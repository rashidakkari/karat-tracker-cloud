
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/contexts/types';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Star, Printer, FileBarChart } from "lucide-react";
import { formatWeight, formatCurrency } from '@/utils/formatters';
import { getPurityFactor, convertToGrams } from '@/utils/goldCalculations';
import { Checkbox } from '@/components/ui/checkbox';

const SpotCheck: React.FC = () => {
  const { inventory, financial, transactions, toggleItemFeature } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<"all" | "wholesale" | "retail">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bars" | "coins" | "jewelry">("all");
  const [showSoldItems, setShowSoldItems] = useState(false);
  const [inventoryWithTransactions, setInventoryWithTransactions] = useState<any[]>([]);
  
  // Process transactions and inventory data
  useEffect(() => {
    // Create a map to track sold quantities by item ID
    const salesMap: Record<string, { quantity: number, value: number }> = {};
    
    // Process all sell transactions
    transactions
      .filter(t => t.type === 'sell')
      .forEach(transaction => {
        if (!salesMap[transaction.itemId]) {
          salesMap[transaction.itemId] = { quantity: 0, value: 0 };
        }
        
        salesMap[transaction.itemId].quantity += transaction.quantity;
        salesMap[transaction.itemId].value += transaction.totalPrice;
      });
    
    // Combine inventory with sales data
    const enrichedInventory = inventory.map(item => {
      const sales = salesMap[item.id] || { quantity: 0, value: 0 };
      
      // Calculate current value based on spot price
      const weightInGrams = convertToGrams(item.weight, item.weightUnit);
      const purityFactor = getPurityFactor(item.purity);
      const spotPricePerGram = financial.spotPrice / 31.1035; // Convert to price per gram
      const currentValuePerUnit = weightInGrams * purityFactor * spotPricePerGram;
      const totalCurrentValue = currentValuePerUnit * item.quantity;
      
      // Check if item is featured
      const featuredItems = financial.featuredItems || [];
      const isFeatured = featuredItems.includes(item.id);
      
      return {
        ...item,
        salesQuantity: sales.quantity,
        salesValue: sales.value,
        currentValuePerUnit,
        totalCurrentValue,
        isFeatured
      };
    });
    
    setInventoryWithTransactions(enrichedInventory);
  }, [inventory, transactions, financial.spotPrice, financial.featuredItems]);
  
  // Filter inventory based on filters
  const filteredInventory = inventoryWithTransactions.filter(item => {
    // Register filter
    if (registerFilter !== "all" && item.type !== registerFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    
    // Sold items filter
    if (showSoldItems && item.salesQuantity === 0) {
      return false;
    }
    
    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.purity.toLowerCase().includes(query) ||
        item.barcode?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Calculate totals
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const total24kWeight = filteredInventory.reduce((sum, item) => sum + item.equivalent24k, 0);
  const totalCurrentValue = filteredInventory.reduce((sum, item) => sum + item.totalCurrentValue, 0);
  const totalSoldQuantity = filteredInventory.reduce((sum, item) => sum + item.salesQuantity, 0);
  const totalSalesValue = filteredInventory.reduce((sum, item) => sum + item.salesValue, 0);
  
  // Get register balance
  const getRegisterBalance = (registerType: "wholesale" | "retail" | "all"): number => {
    if (registerType === "wholesale") {
      return financial.wholesaleBalance?.USD || 0;
    } else if (registerType === "retail") {
      return financial.retailBalance?.USD || 0;
    } else {
      // For "all", combine both balances
      return (financial.wholesaleBalance?.USD || 0) + (financial.retailBalance?.USD || 0);
    }
  };
  
  // Handle starring/featuring an item
  const handleToggleFeatured = (itemId: string, currentStatus: boolean) => {
    toggleItemFeature(itemId, !currentStatus);
  };
  
  // Handle printing the spot check report
  const handlePrintReport = () => {
    window.print();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Inventory Spot Check</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="w-[180px]">
          <Select value={registerFilter} onValueChange={(value) => setRegisterFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Register" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registers</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-[180px]">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bars">Bars</SelectItem>
              <SelectItem value="coins">Coins</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="sold-items" 
            checked={showSoldItems}
            onCheckedChange={(checked) => setShowSoldItems(checked === true)}
          />
          <label
            htmlFor="sold-items"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show only sold items
          </label>
        </div>
        
        <Button variant="outline" onClick={() => {
          setSearchQuery('');
          setRegisterFilter('all');
          setCategoryFilter('all');
          setShowSoldItems(false);
        }}>
          Clear Filters
        </Button>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Items Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total unique items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Units across all items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">24K Gold Equivalent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(total24kWeight)}</div>
            <p className="text-xs text-muted-foreground">
              Total pure gold content
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
            <p className="text-xs text-muted-foreground">
              Based on spot price
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Sold Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSoldQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Items sold to date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Sales Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Register balance */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Register Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(getRegisterBalance(registerFilter))}</div>
          <p className="text-xs text-muted-foreground">
            {registerFilter === "all" ? "Combined registers" : `${registerFilter} register`}
          </p>
        </CardContent>
      </Card>
      
      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Register</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">24K Equivalent</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Sold Qty</TableHead>
                  <TableHead className="text-right">Sales Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-4">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={item.isFeatured ? "text-amber-500" : "text-gray-400"} 
                          onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                        >
                          <Star className="h-4 w-4" fill={item.isFeatured ? "currentColor" : "none"} />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell>{item.purity}</TableCell>
                      <TableCell>{item.weight} {item.weightUnit}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatWeight(item.equivalent24k || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalCurrentValue)}</TableCell>
                      <TableCell className="text-right">{item.salesQuantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.salesValue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotCheck;
