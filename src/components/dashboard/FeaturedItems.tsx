
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatWeight, formatCurrency } from '@/utils/formatters';
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPurityFactor, convertToGrams } from '@/utils/goldCalculations';

const FeaturedItems: React.FC = () => {
  const { getFeaturedItems, financial } = useApp();
  const navigate = useNavigate();
  
  // Get all featured items
  const featuredItems = getFeaturedItems();
  
  // Navigate to spot check page
  const handleGoToSpotCheck = () => {
    navigate('/reports');
  };
  
  // Calculate current value of items
  const calculateItemValue = (item: any) => {
    const weightInGrams = convertToGrams(item.weight, item.weightUnit);
    const purityFactor = getPurityFactor(item.purity);
    const spotPricePerGram = financial.spotPrice / 31.1035; // Convert to price per gram
    return weightInGrams * purityFactor * spotPricePerGram * item.quantity;
  };
  
  if (featuredItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex justify-between items-center">
            <span>Featured Inventory Items</span>
            <Button size="sm" variant="outline" onClick={handleGoToSpotCheck} className="flex items-center gap-1">
              <span>Spot Check</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
            <Star className="h-10 w-10 mb-2 opacity-20" />
            <p>No featured items</p>
            <p className="text-xs mt-1">Star items in the Inventory Spot Check to monitor them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Featured Inventory Items</span>
          <Button size="sm" variant="outline" onClick={handleGoToSpotCheck} className="flex items-center gap-1">
            <span>Spot Check</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Register</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">24K Equiv.</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featuredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} - {item.purity}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatWeight(item.equivalent24k || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(calculateItemValue(item))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedItems;
