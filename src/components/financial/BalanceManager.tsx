
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Currency } from "@/contexts/types";

const BalanceManager: React.FC = () => {
  const { financial, updateCashBalance, updateCustomerDebt, updateFactoryDebt, updateSpotPrice } = useApp();
  
  const [cashValues, setCashValues] = useState({
    USD: financial.cashBalance.USD,
    EUR: financial.cashBalance.EUR,
    GBP: financial.cashBalance.GBP,
    CHF: financial.cashBalance.CHF,
  });
  
  const [customerDebt, setCustomerDebt] = useState(financial.customerDebt);
  const [factoryDebt, setFactoryDebt] = useState(financial.factoryDebt);
  const [spotPrice, setSpotPrice] = useState(financial.spotPrice);
  
  const handleCashUpdate = (currency: Currency) => {
    updateCashBalance(currency, cashValues[currency]);
  };
  
  const handleCustomerDebtUpdate = () => {
    updateCustomerDebt(customerDebt);
  };
  
  const handleFactoryDebtUpdate = () => {
    updateFactoryDebt(factoryDebt);
  };
  
  const handleSpotPriceUpdate = () => {
    updateSpotPrice(spotPrice);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Settings</CardTitle>
        <CardDescription>Manage cash balances, debts, and spot price</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cash" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cash">Cash Balance</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            <TabsTrigger value="spotPrice">Spot Price</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cash" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(cashValues).map(([currency, amount]) => (
                <div key={currency} className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor={`cash-${currency}`} className="text-sm font-medium">
                      {currency}
                    </label>
                    <Input
                      id={`cash-${currency}`}
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setCashValues({
                        ...cashValues,
                        [currency]: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <Button
                    onClick={() => handleCashUpdate(currency as Currency)}
                    className="mt-5"
                  >
                    Update
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="debts" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="customer-debt" className="text-sm font-medium">
                  Customer Debt (USD)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="customer-debt"
                    type="number"
                    step="0.01"
                    value={customerDebt}
                    onChange={(e) => setCustomerDebt(parseFloat(e.target.value) || 0)}
                  />
                  <Button onClick={handleCustomerDebtUpdate}>Update</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="factory-debt" className="text-sm font-medium">
                  Factory Debt (USD)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="factory-debt"
                    type="number"
                    step="0.01"
                    value={factoryDebt}
                    onChange={(e) => setFactoryDebt(parseFloat(e.target.value) || 0)}
                  />
                  <Button onClick={handleFactoryDebtUpdate}>Update</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="spotPrice" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="spot-price" className="text-sm font-medium">
                Gold Spot Price (USD per troy oz)
              </label>
              <div className="flex gap-2">
                <Input
                  id="spot-price"
                  type="number"
                  step="0.01"
                  value={spotPrice}
                  onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 0)}
                />
                <Button onClick={handleSpotPriceUpdate}>Update</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BalanceManager;
