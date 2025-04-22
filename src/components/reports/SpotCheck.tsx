
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileBarChart } from "lucide-react";
import { useSpotCheck } from '@/hooks/useSpotCheck';
import SpotCheckFilters from './SpotCheckFilters';
import SpotCheckSummary from './SpotCheckSummary';
import SpotCheckTable from './SpotCheckTable';

const SpotCheck: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    registerFilter,
    setRegisterFilter,
    categoryFilter,
    setCategoryFilter,
    showSoldItems,
    setShowSoldItems,
    filteredInventory,
    totalItems,
    totalQuantity,
    total24kWeight,
    totalCurrentValue,
    totalSoldQuantity,
    totalSalesValue,
    getRegisterBalance,
    handleToggleFeatured,
    clearFilters
  } = useSpotCheck();
  
  // Handle printing the spot check report
  const handlePrintReport = () => {
    window.print();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Inventory Spot Check</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <SpotCheckFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        registerFilter={registerFilter}
        setRegisterFilter={setRegisterFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        showSoldItems={showSoldItems}
        setShowSoldItems={setShowSoldItems}
        clearFilters={clearFilters}
      />
      
      {/* Summary cards */}
      <SpotCheckSummary
        totalItems={totalItems}
        totalQuantity={totalQuantity}
        total24kWeight={total24kWeight}
        totalCurrentValue={totalCurrentValue}
        totalSoldQuantity={totalSoldQuantity}
        totalSalesValue={totalSalesValue}
        registerBalance={getRegisterBalance(registerFilter)}
        registerFilter={registerFilter}
      />
      
      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          <SpotCheckTable 
            inventory={filteredInventory}
            onToggleFeatured={handleToggleFeatured}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotCheck;
