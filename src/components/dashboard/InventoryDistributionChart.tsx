
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DistributionData {
  name: string;
  value: number;
}

interface InventoryDistributionChartProps {
  inventory: any[];
  registerFilter: "all" | "wholesale" | "retail";
}

const InventoryDistributionChart: React.FC<InventoryDistributionChartProps> = ({ 
  inventory, 
  registerFilter 
}) => {
  // Calculate inventory distribution for the chart
  const inventoryDistribution = React.useMemo(() => {
    const distribution = { "Bars": 0, "Coins": 0, "Jewelry": 0 };
    
    const filteredInventory = registerFilter === "all" 
      ? inventory 
      : inventory.filter(item => item.type === registerFilter);
    
    filteredInventory.forEach(item => {
      const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      distribution[category as keyof typeof distribution] += item.equivalent24k || 0;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: Math.round(value) // Round to nearest gram for better display
    }));
  }, [inventory, registerFilter]);

  const COLORS = ["#D4AF37", "#AA8C2C", "#F6E5A1"];
  
  return (
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
                  data={inventoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}g`, "24K Equivalent Weight"]}
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
  );
};

export default InventoryDistributionChart;
