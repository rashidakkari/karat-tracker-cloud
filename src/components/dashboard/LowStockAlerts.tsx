
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWeight } from "@/utils/formatters";
import { InventoryItem } from "@/models/inventory";

interface LowStockAlertsProps {
  items: InventoryItem[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ items }) => {
  return (
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
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-karat-700 font-medium">All items in stock</p>
              <p className="text-karat-500 text-sm mt-1">No low stock alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
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
  );
};

export default LowStockAlerts;
