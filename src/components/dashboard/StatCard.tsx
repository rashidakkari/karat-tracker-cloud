
import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

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

export default StatCard;
