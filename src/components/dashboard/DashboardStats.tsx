
import React from "react";
import StatCard from "./StatCard";
import { formatCurrency, formatWeight } from "@/utils/formatters";
import { DollarSign, Scale, Users, CreditCard } from "lucide-react";

interface DashboardStatsProps {
  spotPrice: number;
  total24kWeight: number;
  customerDebtTotal: number;
  borrowedDebtTotal: number;
  currency: string;
  registerFilter: string;
}

const DashboardStats = ({
  spotPrice,
  total24kWeight,
  customerDebtTotal,
  borrowedDebtTotal,
  currency,
  registerFilter
}: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gold Spot Price"
        value={formatCurrency(spotPrice, "USD")}
        description="per troy ounce"
        icon={<DollarSign className="h-4 w-4" />}
        trend="up"
        trendValue="+2.3%"
        delay={0}
      />
      
      <StatCard
        title={`${registerFilter === "all" ? "Total" : registerFilter.charAt(0).toUpperCase() + registerFilter.slice(1)} Inventory (24K)`}
        value={formatWeight(total24kWeight)}
        description="across all categories"
        icon={<Scale className="h-4 w-4" />}
        delay={1}
      />
      
      <StatCard
        title="Customer Debt"
        value={formatCurrency(customerDebtTotal, currency)}
        description="customers owe you"
        icon={<Users className="h-4 w-4" />}
        delay={2}
      />
      
      <StatCard
        title="Borrowed Debt"
        value={formatCurrency(borrowedDebtTotal, currency)}
        description="you owe others"
        icon={<CreditCard className="h-4 w-4" />}
        delay={3}
      />
    </div>
  );
};

export default DashboardStats;
