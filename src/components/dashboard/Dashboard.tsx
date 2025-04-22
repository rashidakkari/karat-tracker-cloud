
import React, { useState } from "react";
import { useApp, Currency } from "@/contexts/AppContext";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { DollarSign, Scale, Users, CreditCard } from "lucide-react";
import StatCard from "./StatCard";
import PriceChart from "./PriceChart";
import InventoryDistributionChart from "./InventoryDistributionChart";
import RecentTransactions from "./RecentTransactions";
import LowStockAlerts from "./LowStockAlerts";
import SpotPriceUpdater from "./SpotPriceUpdater";
import { InventoryItem as ModelInventoryItem } from "@/models/inventory";
import { getPurityFactor, convertToGrams } from "@/utils/goldCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const spotPriceHistory = [
  { date: "Jan", price: 1950 },
  { date: "Feb", price: 1980 },
  { date: "Mar", price: 2050 },
  { date: "Apr", price: 2150 },
  { date: "May", price: 2100 },
  { date: "Jun", price: 2200 },
  { date: "Jul", price: 2250 },
];

const Dashboard: React.FC = () => {
  const { inventory, financial, updateSpotPrice } = useApp();
  // Initialize transactions to prevent the filter error
  const transactions = [];
  const [currency] = React.useState<Currency>("USD");
  const [registerFilter, setRegisterFilter] = useState<"all" | "wholesale" | "retail">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  
  // Get customer debts and borrowed debts totals
  const customerDebtTotal = (financial.customerDebts || []).reduce(
    (total, debt) => total + debt.amount,
    0
  );
  
  const borrowedDebtTotal = (financial.borrowedDebts || []).reduce(
    (total, debt) => total + debt.amount,
    0
  );
  
  // Filter inventory by register type if needed
  const filteredInventory = registerFilter === "all" 
    ? inventory 
    : inventory.filter(item => item.type === registerFilter);
  
  // Calculate inventory distribution for the chart
  const inventoryDistribution = React.useMemo(() => {
    const distribution = { "Bars": 0, "Coins": 0, "Jewelry": 0 };
    
    filteredInventory.forEach(item => {
      const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      distribution[category as keyof typeof distribution] += item.equivalent24k || 0;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: Math.round(value) // Round to nearest gram for better display
    }));
  }, [filteredInventory]);
  
  const COLORS = ["#D4AF37", "#AA8C2C", "#F6E5A1"];
  
  // Calculate total 24K equivalent weight
  const total24kWeight = filteredInventory.reduce((total, item) => {
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    console.log(`Item: ${item.name}, Weight: ${item.weight}${item.weightUnit}, In grams: ${weightInGrams}g, Purity: ${item.purity}, Factor: ${purityFactor}, Pure gold: ${pureGoldWeight}g`);
    
    return total + pureGoldWeight;
  }, 0);
  
  console.log(`Total 24K equivalent weight: ${total24kWeight}g`);

  // Get recent transactions from the last 7 days - safely handle undefined transactions
  const recentTransactions = (transactions || [])
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  // Map inventory items to model format for low stock alerts
  const mapToModelInventoryItem = (item: typeof inventory[0]): ModelInventoryItem => {
    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      weight: item.weight,
      weightUnit: (item.weightUnit === "kg" ? "g" : item.weightUnit) as "g" | "oz" | "tola" | "baht",
      purity: item.purity,
      costPrice: item.costPrice || 0,
      category: item.category as any,
      quantity: item.quantity,
      equivalent24k: item.equivalent24k || 0,
      dateAcquired: item.dateAdded || '',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };
  
  // Get items with low stock for alerts
  const lowStockItems = filteredInventory
    .filter(item => item.quantity <= 2)
    .map(mapToModelInventoryItem);
  
  // Handle search and spotcheck functionality
  const searchResults = searchQuery.trim() !== "" 
    ? inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  // Pin/unpin items for the dashboard
  const togglePinItem = (itemId: string) => {
    setPinnedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Get all pinned items
  const pinnedItemsDetails = inventory.filter(item => pinnedItems.includes(item.id));
  
  // Get the register balance based on selected type
  const getRegisterBalance = () => {
    if (registerFilter === "wholesale") {
      return financial.wholesaleBalance?.[currency] || 0;
    } else if (registerFilter === "retail") {
      return financial.retailBalance?.[currency] || 0;
    } else {
      // For "all", sum both registers
      const wholesaleBalance = financial.wholesaleBalance?.[currency] || 0;
      const retailBalance = financial.retailBalance?.[currency] || 0;
      return wholesaleBalance + retailBalance;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-karat-900">Dashboard</h1>
          <p className="text-karat-600 mt-1">Welcome to your gold trading dashboard</p>
        </div>
        
        <SpotPriceUpdater currentPrice={financial.spotPrice} onUpdate={updateSpotPrice} />
      </div>
      
      {/* Register selector */}
      <div className="flex items-center space-x-4">
        <Select value={registerFilter} onValueChange={(value) => setRegisterFilter(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Register" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registers</SelectItem>
            <SelectItem value="wholesale">Wholesale Register</SelectItem>
            <SelectItem value="retail">Retail Register</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {registerFilter === "all" ? "Viewing all registers" : `Viewing ${registerFilter} register`}
        </span>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gold Spot Price"
          value={formatCurrency(financial.spotPrice, "USD")}
          description="per troy ounce"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
          trendValue="+2.3%"
          delay={0}
        />
        
        <StatCard
          title={`${registerFilter === "all" ? "Total" : registerFilter.charAt(0).toUpperCase() + registerFilter.slice(1)} Inventory (24K)`}
          value={formatWeight(total24kWeight)}
          description="across all categories"
          icon={<Scale className="h-4 w-4" />}
          delay={1}
        />
        
        <StatCard
          title="Customer Debt"
          value={formatCurrency(customerDebtTotal, currency)}
          description="customers owe you"
          icon={<Users className="h-4 w-4" />}
          delay={2}
        />
        
        <StatCard
          title="Borrowed Debt"
          value={formatCurrency(borrowedDebtTotal, currency)}
          description="you owe others"
          icon={<CreditCard className="h-4 w-4" />}
          delay={3}
        />
      </div>
      
      {/* Cash balance card */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Register Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getRegisterBalance(), currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {registerFilter === "all" ? "Combined registers" : `${registerFilter} register`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Spot check functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Inventory Spot Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Input 
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          
          {searchQuery && searchResults.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Search Results</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.category} • {item.purity} • {item.weight}{item.weightUnit} • Qty: {item.quantity}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => togglePinItem(item.id)}
                    >
                      {pinnedItems.includes(item.id) ? "Unpin" : "Pin"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {pinnedItemsDetails.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Pinned Items</h4>
              <div className="space-y-2">
                {pinnedItemsDetails.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-md bg-amber-50">
                    <div>
                      <div className="font-medium flex items-center">
                        {item.name}
                        <Badge className="ml-2" variant={item.type === "wholesale" ? "outline" : "default"}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.category} • {item.purity} • {item.weight}{item.weightUnit}
                      </div>
                      <div className="text-sm font-medium">
                        Quantity: {item.quantity} • 24K Equivalent: {formatWeight(item.equivalent24k || 0)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => togglePinItem(item.id)}
                    >
                      Unpin
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PriceChart data={spotPriceHistory} />
        <InventoryDistributionChart data={inventoryDistribution} colors={COLORS} />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentTransactions transactions={recentTransactions} />
        <LowStockAlerts items={lowStockItems} />
      </div>
    </div>
  );
};

export default Dashboard;
