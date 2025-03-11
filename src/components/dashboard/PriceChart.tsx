
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
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
                data={data}
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
  );
};

export default PriceChart;
