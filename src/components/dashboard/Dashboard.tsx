
import React, { useState } from "react";
import { useApp, Currency } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PriceChart from "./PriceChart";
import InventoryDistributionChart from "./InventoryDistributionChart";
import RecentTransactions from "./RecentTransactions";
import LowStockAlerts from "./LowStockAlerts";
import SpotPriceUpdater from "./SpotPriceUpdater";
import { InventoryItem as ModelInventoryItem } from "@/models/inventory";
import { getPurityFactor, convertToGrams } from "@/utils/goldCalculations";
import DashboardStats from "./DashboardStats";
import RegisterSelector from "./RegisterSelector";
import InventorySearch from "./InventorySearch";

// Mock spot price history data
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
  
  // Initialize empty transactions array to prevent filter errors
  const transactions = [];
  
  const [currency] = React.useState<Currency>("USD");
  const [registerFilter, setRegisterFilter] = useState<"all" | "wholesale" | "retail">("all");
  
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
    return total + pureGoldWeight;
  }, 0);

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
      <RegisterSelector
        registerFilter={registerFilter}
        setRegisterFilter={setRegisterFilter}
        getRegisterBalance={getRegisterBalance}
        currency={currency}
      />
      
      {/* Dashboard Stats */}
      <DashboardStats
        spotPrice={financial.spotPrice}
        total24kWeight={total24kWeight}
        customerDebtTotal={customerDebtTotal}
        borrowedDebtTotal={borrowedDebtTotal}
        currency={currency}
        registerFilter={registerFilter}
      />
      
      {/* Inventory Spot Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Inventory Spot Check</CardTitle>
        </CardHeader>
        <CardContent>
          <InventorySearch inventory={inventory} />
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
