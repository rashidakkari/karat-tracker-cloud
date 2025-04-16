
import React, { useState } from 'react';
import { InventoryItem } from '@/contexts/types';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter } from "lucide-react";
import { formatWeight, formatCurrency } from '@/utils/formatters';
import { getPurityFactor, convertToGrams } from '@/utils/goldCalculations';

const SpotCheck: React.FC = () => {
  const { inventory, financial } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<"all" | "wholesale" | "retail">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bars" | "coins" | "jewelry">("all");
  
  // Filter inventory based on filters
  const filteredInventory = inventory.filter(item => {
    // Register filter
    if (registerFilter !== "all" && item.type !== registerFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
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
  const total24kWeight = filteredInventory.reduce((sum, item) => {
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    return sum + (weightInGrams * purityFactor);
  }, 0);
  
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Inventory Spot Check</h2>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
        
        <Button variant="outline" onClick={() => {
          setSearchQuery('');
          setRegisterFilter('all');
          setCategoryFilter('all');
        }}>
          Clear Filters
        </Button>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Register Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getRegisterBalance(registerFilter))}</div>
            <p className="text-xs text-muted-foreground">
              {registerFilter === "all" ? "Combined registers" : `${registerFilter} register`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Register</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">24K Equivalent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell>{item.purity}</TableCell>
                      <TableCell>{item.weight} {item.weightUnit}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatWeight(item.equivalent24k || 0)}</TableCell>
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
