import React, { useState } from "react";
import { useApp, Currency } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PriceChart from "./PriceChart";
import InventoryDistributionChart from "./InventoryDistributionChart";
import RecentTransactions from "./RecentTransactions";
import LowStockAlerts from "./LowStockAlerts";
import SpotPriceUpdater from "./SpotPriceUpdater";
import DashboardStats from "./DashboardStats";
import RegisterSelector from "./RegisterSelector";
import InventorySearch from "./InventorySearch";
import { getLowStockItems } from "@/utils/inventoryUtils";

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
  
  const transactions = [];
  
  const [currency] = React.useState<Currency>("USD");
  const [registerFilter, setRegisterFilter] = useState<"all" | "wholesale" | "retail">("all");
  
  const customerDebtTotal = (financial.customerDebts || []).reduce(
    (total, debt) => total + debt.amount,
    0
  );
  
  const borrowedDebtTotal = (financial.borrowedDebts || []).reduce(
    (total, debt) => total + debt.amount,
    0
  );
  
  const filteredInventory = registerFilter === "all" 
    ? inventory 
    : inventory.filter(item => item.type === registerFilter);
  
  const total24kWeight = filteredInventory.reduce((total, item) => {
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    const pureGoldWeight = weightInGrams * purityFactor;
    return total + pureGoldWeight;
  }, 0);

  const recentTransactions = (transactions || [])
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const lowStockItems = getLowStockItems(inventory, 2, registerFilter);
  
  const getRegisterBalance = () => {
    if (registerFilter === "wholesale") {
      return financial.wholesaleBalance?.[currency] || 0;
    } else if (registerFilter === "retail") {
      return financial.retailBalance?.[currency] || 0;
    } else {
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
      
      <RegisterSelector
        registerFilter={registerFilter}
        setRegisterFilter={setRegisterFilter}
        getRegisterBalance={getRegisterBalance}
        currency={currency}
      />
      
      <DashboardStats
        spotPrice={financial.spotPrice}
        total24kWeight={total24kWeight}
        customerDebtTotal={customerDebtTotal}
        borrowedDebtTotal={borrowedDebtTotal}
        currency={currency}
        registerFilter={registerFilter}
      />
      
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
        <InventoryDistributionChart 
          inventory={inventory}
          registerFilter={registerFilter}
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentTransactions transactions={recentTransactions} />
        <LowStockAlerts items={lowStockItems} />
      </div>
    </div>
  );
};

export default Dashboard;
