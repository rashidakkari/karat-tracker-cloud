
import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

interface Transaction {
  id: string;
  dateTime: string;
  type: string;
  totalPrice: number;
  customer?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="col-span-2"
    >
      <Card className="overflow-hidden border-karat-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-karat-700 font-medium">No recent transactions</p>
              <p className="text-karat-500 text-sm mt-1">
                Transactions from the last 7 days will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border-b border-karat-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-karat-900">
                      {tx.type === "buy" ? "Purchase" : "Sale"}
                    </p>
                    <p className="text-xs text-karat-600 mt-1">
                      {formatDateTime(tx.dateTime)}
                      {tx.customer ? ` • ${tx.customer}` : ""}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      tx.type === "buy" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {tx.type === "buy" ? "-" : "+"}
                    {formatCurrency(tx.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentTransactions;
