
import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/formatters";

interface Transaction {
  id: string;
  type: string;
  dateTime: string;
  quantity: number;
  totalPrice: number;
  currency: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
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
              {transactions.length === 0 ? (
                <p className="text-karat-500 text-center py-4">No recent transactions</p>
              ) : (
                transactions.slice(0, 5).map((tx) => (
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
              {transactions.filter(tx => tx.type === "sell").length === 0 ? (
                <p className="text-karat-500 text-center py-4">No recent sales</p>
              ) : (
                transactions
                  .filter(tx => tx.type === "sell")
                  .slice(0, 5)
                  .map((tx) => (
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
              {transactions.filter(tx => tx.type === "buy").length === 0 ? (
                <p className="text-karat-500 text-center py-4">No recent purchases</p>
              ) : (
                transactions
                  .filter(tx => tx.type === "buy")
                  .slice(0, 5)
                  .map((tx) => (
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
  );
};

export default RecentTransactions;
