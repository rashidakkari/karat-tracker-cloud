
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

// Sample data for the spot price history chart
const spotPriceHistory = [
  { date: "Jan", price: 1950 },
  { date: "Feb", price: 1980 },
  { date: "Mar", price: 2050 },
  { date: "Apr", price: 2150 },
  { date: "May", price: 2100 },
  { date: "Jun", price: 2200 },
  { date: "Jul", price: 2250 },
];

// Sample data for the inventory distribution chart
const inventoryData = [
  { name: "Bars", value: 60 },
  { name: "Jewelry", value: 30 },
  { name: "Coins", value: 10 },
];

// Colors for the inventory distribution chart
const COLORS = ["#D4AF37", "#AA8C2C", "#F6E5A1"];

const Dashboard: React.FC = () => {
  const { inventory, transactions, financial, updateSpotPrice } = useApp();
  const [currency] = React.useState<Currency>("USD");
  
  // Corrected total24kWeight calculation to properly account for all items
  const total24kWeight = inventory.reduce((total, item) => {
    // Convert to 24K equivalent weight first (pure gold content)
    let purityFactor = 0;
    
    switch (item.purity) {
      case "999.9":
        purityFactor = 0.9999;
        break;
      case "995":
        purityFactor = 0.995;
        break;
      case "22K":
        purityFactor = 0.916;
        break;
      case "21K":
        purityFactor = 0.875;
        break;
      case "18K":
        purityFactor = 0.75;
        break;
      case "14K":
        purityFactor = 0.583;
        break;
      case "9K":
        purityFactor = 0.375;
        break;
      default:
        purityFactor = 0.995; // Default to 995 if unknown
    }
    
    // Calculate pure gold content in the item
    const pureGoldWeight = item.weight * purityFactor;
    
    // Convert to 995 standard (this step is optional)
    // We can just sum the pure gold content directly
    return total + pureGoldWeight;
  }, 0);

  const recentTransactions = transactions
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const lowStockItems = inventory.filter(item => item.quantity <= 2);
  
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
