import React from "react";
import { useApp, Currency } from "@/contexts/AppContext";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { DollarSign, Scale, Users, Factory } from "lucide-react";
import StatCard from "./StatCard";
import PriceChart from "./PriceChart";
import InventoryDistributionChart from "./InventoryDistributionChart";
import RecentTransactions from "./RecentTransactions";
import LowStockAlerts from "./LowStockAlerts";
import SpotPriceUpdater from "./SpotPriceUpdater";
import { InventoryItem as ModelInventoryItem } from "@/models/inventory";
import { getPurityFactor, convertToGrams } from "@/utils/goldCalculations";

const spotPriceHistory = [
  { date: "Jan", price: 1950 },
  { date: "Feb", price: 1980 },
  { date: "Mar", price: 2050 },
  { date: "Apr", price: 2150 },
  { date: "May", price: 2100 },
  { date: "Jun", price: 2200 },
  { date: "Jul", price: 2250 },
];

const inventoryData = [
  { name: "Bars", value: 60 },
  { name: "Jewelry", value: 30 },
  { name: "Coins", value: 10 },
];

const COLORS = ["#D4AF37", "#AA8C2C", "#F6E5A1"];

const Dashboard: React.FC = () => {
  const { inventory, transactions, financial, updateSpotPrice } = useApp();
  const [currency] = React.useState<Currency>("USD");
  
  const total24kWeight = inventory.reduce((total, item) => {
    const weightInGrams = item.weightUnit === "kg" 
      ? item.weight * 1000
      : item.weightUnit === "oz" 
        ? item.weight * 31.1035
        : item.weight;
    
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    
    console.log(`Item: ${item.name}, Weight: ${item.weight}${item.weightUnit}, In grams: ${weightInGrams}g, Purity: ${item.purity}, Factor: ${purityFactor}, Pure gold: ${pureGoldWeight}g`);
    
    return total + pureGoldWeight;
  }, 0);
  
  console.log(`Total 24K equivalent weight: ${total24kWeight}g`);

  const recentTransactions = transactions
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
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
  
  const lowStockItems = inventory
    .filter(item => item.quantity <= 2)
    .map(mapToModelInventoryItem);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-karat-900">Dashboard</h1>
          <p className="text-karat-600 mt-1">Welcome to your gold trading dashboard</p>
        </div>
        
        <SpotPriceUpdater currentPrice={financial.spotPrice} onUpdate={updateSpotPrice} />
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
          title="Total Inventory (24K)"
          value={formatWeight(total24kWeight)}
          description="across all categories"
          icon={<Scale className="h-4 w-4" />}
          delay={1}
        />
        
        <StatCard
          title="Customer Debt"
          value={formatCurrency(financial.customerDebt, currency)}
          icon={<Users className="h-4 w-4" />}
          delay={2}
        />
        
        <StatCard
          title="Factory Debt"
          value={formatCurrency(financial.factoryDebt, currency)}
          icon={<Factory className="h-4 w-4" />}
          delay={3}
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PriceChart data={spotPriceHistory} />
        <InventoryDistributionChart data={inventoryData} colors={COLORS} />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentTransactions transactions={recentTransactions} />
        <LowStockAlerts items={lowStockItems} />
      </div>
    </div>
  );
};

export default Dashboard;
