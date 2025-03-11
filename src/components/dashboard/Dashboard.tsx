import React, { useState, useEffect } from "react";
import { useApp, Currency } from "@/contexts/AppContext";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, DollarSign, Scale, Users, Factory, Coins, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

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

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <Card className="overflow-hidden border-karat-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-karat-600">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-karat-100 flex items-center justify-center text-karat-700">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-karat-900">{value}</div>
          {(description || trend) && (
            <div className="flex items-center mt-1">
              {trend && (
                <span
                  className={`mr-1 ${
                    trend === "up"
                      ? "text-green-600"
                      : trend === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {trend === "up" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : trend === "down" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : null}
                </span>
              )}
              <p
                className={`text-xs ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-karat-500"
                }`}
              >
                {trendValue ? trendValue : ""} {description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { inventory, transactions, financial, updateSpotPrice } = useApp();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [newSpotPrice, setNewSpotPrice] = useState<string>(financial.spotPrice.toString());
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  
  const total24kWeight = inventory.reduce((total, item) => {
    const weightIn995 = item.purity === "999.9" 
      ? (item.weight * 0.995) // Convert from 999.9 to 995
      : (item.equivalent24k * 0.995); // Convert from 24K to 995
    return total + weightIn995;
  }, 0);

  const recentTransactions = transactions
    .filter(tx => {
      const txDate = new Date(tx.dateTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const salesValue = recentTransactions
    .filter(tx => tx.type === "sell")
    .reduce((total, tx) => total + tx.totalPrice, 0);
  
  const purchasesValue = recentTransactions
    .filter(tx => tx.type === "buy")
    .reduce((total, tx) => total + tx.totalPrice, 0);
  
  const lowStockItems = inventory.filter(item => item.quantity <= 2);
  
  const handleUpdateSpotPrice = () => {
    const price = parseFloat(newSpotPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid spot price");
      return;
    }
    
    setIsUpdatingPrice(true);
    setTimeout(() => {
      updateSpotPrice(price);
      setIsUpdatingPrice(false);
      toast.success("Spot price updated");
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-karat-900">Dashboard</h1>
          <p className="text-karat-600 mt-1">Welcome to your gold trading dashboard</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <span className="text-sm text-karat-600 mr-2">Spot Price:</span>
            <input
              type="text"
              value={newSpotPrice}
              onChange={(e) => setNewSpotPrice(e.target.value)}
              className="w-24 h-9 rounded-md border border-karat-200 px-3 py-1 text-sm"
            />
          </div>
          <Button 
            onClick={handleUpdateSpotPrice}
            disabled={isUpdatingPrice}
            className="bg-gold hover:bg-gold-dark text-white"
            size="sm"
          >
            {isUpdatingPrice ? "Updating..." : "Update"}
          </Button>
        </div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-karat-100 h-full">
            <CardHeader>
              <CardTitle>Gold Price Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={spotPriceHistory}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                      }}
                      formatter={(value: number) => [`$${value}`, "Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#D4AF37", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#D4AF37", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-karat-100 h-full">
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Percentage"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="overflow-hidden border-karat-100">
            <CardHeader className="pb-3">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="purchases">Purchases</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-2">
                  {recentTransactions.length === 0 ? (
                    <p className="text-karat-500 text-center py-4">No recent transactions</p>
                  ) : (
                    recentTransactions.slice(0, 5).map((tx, index) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-karat-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              tx.type === "buy" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {tx.type === "buy" ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUp className="h-4 w-4" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-karat-900">
                              {tx.type === "buy" ? "Purchase" : "Sale"} #{tx.id.substring(0, 6)}
                            </p>
                            <p className="text-xs text-karat-500">
                              {new Date(tx.dateTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-karat-900">
                            {formatCurrency(tx.totalPrice, tx.currency)}
                          </p>
                          <p className="text-xs text-karat-500">Quantity: {tx.quantity}</p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-2">
                  {recentTransactions.filter(tx => tx.type === "sell").length === 0 ? (
                    <p className="text-karat-500 text-center py-4">No recent sales</p>
                  ) : (
                    recentTransactions
                      .filter(tx => tx.type === "sell")
                      .slice(0, 5)
                      .map((tx, index) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-karat-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                              <ArrowUp className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-karat-900">
                                Sale #{tx.id.substring(0, 6)}
                              </p>
                              <p className="text-xs text-karat-500">
                                {new Date(tx.dateTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-karat-900">
                              {formatCurrency(tx.totalPrice, tx.currency)}
                            </p>
                            <p className="text-xs text-karat-500">Quantity: {tx.quantity}</p>
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>
                
                <TabsContent value="purchases" className="space-y-2">
                  {recentTransactions.filter(tx => tx.type === "buy").length === 0 ? (
                    <p className="text-karat-500 text-center py-4">No recent purchases</p>
                  ) : (
                    recentTransactions
                      .filter(tx => tx.type === "buy")
                      .slice(0, 5)
                      .map((tx, index) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-karat-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                              <ArrowDown className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-karat-900">
                                Purchase #{tx.id.substring(0, 6)}
                              </p>
                              <p className="text-xs text-karat-500">
                                {new Date(tx.dateTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-karat-900">
                              {formatCurrency(tx.totalPrice, tx.currency)}
                            </p>
                            <p className="text-xs text-karat-500">Quantity: {tx.quantity}</p>
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-karat-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Low Stock Alerts</CardTitle>
                <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Coins className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-karat-700 font-medium">All items in stock</p>
                  <p className="text-karat-500 text-sm mt-1">No low stock alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-karat-900">{item.name}</p>
                          <p className="text-xs text-karat-600 mt-1">
                            {item.category} • {item.purity}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-amber-600">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="mt-2 text-xs flex justify-between text-karat-600">
                        <span>Weight: {formatWeight(item.weight, item.weightUnit)}</span>
                        <span>24K Equiv: {formatWeight(item.equivalent24k)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
