
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoldPurity, WeightUnit, CurrencyCode } from '@/utils/goldCalculations';
import { 
  calculateBarBuyingPrice, 
  calculateBarSellingPrice,
  calculateJewelryBuyingPrice,
  calculateJewelrySellingPrice,
  convertToGrams,
  convertFromGrams,
  convertTo24K
} from '@/utils/goldCalculations';
import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';

interface PriceCalculatorProps {
  spotPrice: number;
  onUpdateSpotPrice: (price: number) => void;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({ spotPrice, onUpdateSpotPrice }) => {
  const [localSpotPrice, setLocalSpotPrice] = useState<number>(spotPrice);
  const [activeTab, setActiveTab] = useState<string>('gold-bars');
  
  // Gold Bars Calculation
  const [barWeight, setBarWeight] = useState<number>(1);
  const [barWeightUnit, setBarWeightUnit] = useState<WeightUnit>('g');
  const [barPurity, setBarPurity] = useState<'999.9' | '995'>('999.9');
  const [barCommission, setBarCommission] = useState<number>(0);
  const [barBuyingPrice, setBarBuyingPrice] = useState<number>(0);
  const [barSellingPrice, setBarSellingPrice] = useState<number>(0);
  const [barCurrency, setBarCurrency] = useState<CurrencyCode>('USD');
  
  // Jewelry Calculation
  const [jewelryWeight, setJewelryWeight] = useState<number>(1);
  const [jewelryWeightUnit, setJewelryWeightUnit] = useState<WeightUnit>('g');
  const [jewelryPurity, setJewelryPurity] = useState<GoldPurity>('22K');
  const [jewelryCommission, setJewelryCommission] = useState<number>(0);
  const [jewelryBuyingPrice, setJewelryBuyingPrice] = useState<number>(0);
  const [jewelrySellingPrice, setJewelrySellingPrice] = useState<number>(0);
  const [jewelryCurrency, setJewelryCurrency] = useState<CurrencyCode>('USD');
  
  // Weight Conversion
  const [conversionWeight, setConversionWeight] = useState<number>(1);
  const [conversionFromUnit, setConversionFromUnit] = useState<WeightUnit>('g');
  const [conversionToUnit, setConversionToUnit] = useState<WeightUnit>('oz');
  const [conversionResult, setConversionResult] = useState<number>(0);
  
  // Purity Conversion
  const [purityWeight, setPurityWeight] = useState<number>(1);
  const [purityType, setPurityType] = useState<GoldPurity>('22K');
  const [purityResult, setPurityResult] = useState<number>(0);

  useEffect(() => {
    // Set the local spot price when the prop changes
    setLocalSpotPrice(spotPrice);
  }, [spotPrice]);

  // Calculate gold bar prices
  useEffect(() => {
    const weightInGrams = convertToGrams(barWeight, barWeightUnit);
    const buyPrice = calculateBarBuyingPrice(localSpotPrice, weightInGrams, barPurity, barCommission);
    const sellPrice = calculateBarSellingPrice(localSpotPrice, weightInGrams, barPurity, barCommission);
    
    setBarBuyingPrice(buyPrice);
    setBarSellingPrice(sellPrice);
  }, [localSpotPrice, barWeight, barWeightUnit, barPurity, barCommission]);

  // Calculate jewelry prices
  useEffect(() => {
    const weightInGrams = convertToGrams(jewelryWeight, jewelryWeightUnit);
    const buyPrice = calculateJewelryBuyingPrice(localSpotPrice, weightInGrams, jewelryPurity, jewelryCommission);
    const sellPrice = calculateJewelrySellingPrice(localSpotPrice, weightInGrams, jewelryPurity, jewelryCommission);
    
    setJewelryBuyingPrice(buyPrice);
    setJewelrySellingPrice(sellPrice);
  }, [localSpotPrice, jewelryWeight, jewelryWeightUnit, jewelryPurity, jewelryCommission]);

  // Calculate weight conversion
  useEffect(() => {
    const weightInGrams = convertToGrams(conversionWeight, conversionFromUnit);
    const result = convertFromGrams(weightInGrams, conversionToUnit);
    setConversionResult(result);
  }, [conversionWeight, conversionFromUnit, conversionToUnit]);

  // Calculate purity conversion
  useEffect(() => {
    const result = convertTo24K(purityWeight, purityType);
    setPurityResult(result);
  }, [purityWeight, purityType]);

  const handleUpdateSpotPrice = () => {
    onUpdateSpotPrice(localSpotPrice);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-secondary rounded-t-lg pb-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Gold Price Calculator</CardTitle>
            <CardDescription>
              Calculate prices, convert weights and purities
            </CardDescription>
          </div>
          <Calculator className="h-8 w-8 text-gold" />
        </div>
        
        <div className="mt-4 flex items-end gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="spot-price">Current Gold Spot Price (USD per Troy Oz)</Label>
            <Input
              id="spot-price"
              type="number"
              step="0.01"
              min="0"
              value={localSpotPrice}
              onChange={(e) => setLocalSpotPrice(parseFloat(e.target.value))}
              className="font-medium text-lg"
            />
          </div>
          <Button onClick={handleUpdateSpotPrice} className="mb-0.5 bg-gold hover:bg-gold-dark">
            <RefreshCw className="mr-2 h-4 w-4" /> Update Spot Price
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="gold-bars">Gold Bars</TabsTrigger>
            <TabsTrigger value="jewelry">Jewelry</TabsTrigger>
            <TabsTrigger value="weight-converter">Weight Converter</TabsTrigger>
            <TabsTrigger value="purity-converter">Purity Converter</TabsTrigger>
          </TabsList>
          
          {/* Gold Bars Calculator */}
          <TabsContent value="gold-bars" className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bar-weight">Weight</Label>
                <Input
                  id="bar-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={barWeight}
                  onChange={(e) => setBarWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bar-weight-unit">Unit</Label>
                <Select
                  value={barWeightUnit}
                  onValueChange={(value) => setBarWeightUnit(value as WeightUnit)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bar-purity">Purity</Label>
                <Select
                  value={barPurity}
                  onValueChange={(value) => setBarPurity(value as '999.9' | '995')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="999.9">999.9 (Swiss)</SelectItem>
                    <SelectItem value="995">995 (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bar-commission">Commission ({barCurrency})</Label>
                <Input
                  id="bar-commission"
                  type="number"
                  step="0.01"
                  min="0"
                  value={barCommission}
                  onChange={(e) => setBarCommission(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bar-currency">Currency</Label>
                <Select
                  value={barCurrency}
                  onValueChange={(value) => setBarCurrency(value as CurrencyCode)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Buying Price</CardTitle>
                  <CardDescription>
                    From Customer (Using {barPurity === '999.9' ? '32.15' : '31.99'} factor)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{barBuyingPrice.toFixed(2)} {barCurrency}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Selling Price</CardTitle>
                  <CardDescription>
                    To Customer (Using {barPurity === '999.9' ? '32.15' : '31.99'} factor)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{barSellingPrice.toFixed(2)} {barCurrency}</p>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="bg-gold/10 mt-4">
              <AlertDescription>
                Calculation: (Spot Price × {barPurity === '999.9' ? '32.15' : '31.99'}/1000 × Weight) + Commission
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          {/* Jewelry Calculator */}
          <TabsContent value="jewelry" className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jewelry-weight">Weight</Label>
                <Input
                  id="jewelry-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={jewelryWeight}
                  onChange={(e) => setJewelryWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jewelry-weight-unit">Unit</Label>
                <Select
                  value={jewelryWeightUnit}
                  onValueChange={(value) => setJewelryWeightUnit(value as WeightUnit)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jewelry-purity">Purity</Label>
                <Select
                  value={jewelryPurity}
                  onValueChange={(value) => setJewelryPurity(value as GoldPurity)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="999.9">999.9</SelectItem>
                    <SelectItem value="995">995</SelectItem>
                    <SelectItem value="22K">22K</SelectItem>
                    <SelectItem value="21K">21K</SelectItem>
                    <SelectItem value="18K">18K</SelectItem>
                    <SelectItem value="14K">14K</SelectItem>
                    <SelectItem value="9K">9K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jewelry-commission">Commission per gram ({jewelryCurrency})</Label>
                <Input
                  id="jewelry-commission"
                  type="number"
                  step="0.01"
                  min="0"
                  value={jewelryCommission}
                  onChange={(e) => setJewelryCommission(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jewelry-currency">Currency</Label>
                <Select
                  value={jewelryCurrency}
                  onValueChange={(value) => setJewelryCurrency(value as CurrencyCode)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Buying Price</CardTitle>
                  <CardDescription>
                    From Customer (Using buying purity factor)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{jewelryBuyingPrice.toFixed(2)} {jewelryCurrency}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Selling Price</CardTitle>
                  <CardDescription>
                    To Customer (Using selling purity factor)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{jewelrySellingPrice.toFixed(2)} {jewelryCurrency}</p>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="bg-gold/10 mt-4">
              <AlertDescription>
                <p>Buying: (Spot Price × 31.99/1000 × Weight × Purity Factor)</p>
                <p>Selling: (Spot Price × 32.15/1000 × Weight × Purity Factor) + (Weight × Commission Per Gram)</p>
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          {/* Weight Converter */}
          <TabsContent value="weight-converter" className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conversion-weight">Weight</Label>
                <Input
                  id="conversion-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={conversionWeight}
                  onChange={(e) => setConversionWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conversion-from-unit">From Unit</Label>
                <Select
                  value={conversionFromUnit}
                  onValueChange={(value) => setConversionFromUnit(value as WeightUnit)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <ArrowRight className="h-8 w-8 text-gold" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conversion-result">Result</Label>
                <Input
                  id="conversion-result"
                  type="number"
                  value={conversionResult.toFixed(5)}
                  readOnly
                  className="font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conversion-to-unit">To Unit</Label>
                <Select
                  value={conversionToUnit}
                  onValueChange={(value) => setConversionToUnit(value as WeightUnit)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="oz">Troy Ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Alert className="bg-secondary/30 mt-4">
              <AlertDescription>
                <p>Conversion Factors:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>1 kg = 1,000 g</li>
                  <li>1 troy oz = 31.1035 g</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          {/* Purity Converter */}
          <TabsContent value="purity-converter" className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purity-weight">Weight (g)</Label>
                <Input
                  id="purity-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={purityWeight}
                  onChange={(e) => setPurityWeight(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purity-type">Purity</Label>
                <Select
                  value={purityType}
                  onValueChange={(value) => setPurityType(value as GoldPurity)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="999.9">999.9</SelectItem>
                    <SelectItem value="995">995</SelectItem>
                    <SelectItem value="22K">22K</SelectItem>
                    <SelectItem value="21K">21K</SelectItem>
                    <SelectItem value="18K">18K</SelectItem>
                    <SelectItem value="14K">14K</SelectItem>
                    <SelectItem value="9K">9K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <ArrowRight className="h-8 w-8 text-gold" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purity-result">Equivalent in 24K (995)</Label>
                <Input
                  id="purity-result"
                  type="number"
                  value={purityResult.toFixed(5)}
                  readOnly
                  className="font-medium text-lg"
                />
              </div>
            </div>
            
            <Alert className="bg-gold/10 mt-4">
              <AlertDescription>
                <p>Purity Conversion Factors:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>999.9 to 995: Weight / 0.995</li>
                  <li>22K: Buying (Weight × 0.900), Selling (Weight × 0.916/0.995)</li>
                  <li>21K: Buying (Weight × 0.865), Selling (Weight × 0.875/0.995)</li>
                  <li>18K: Buying (Weight × 0.740), Selling (Weight × 0.750/0.995)</li>
                  <li>14K: Buying (Weight × 0.570), Selling (Weight × 0.583/0.995)</li>
                  <li>9K: Buying (Weight × 0.360), Selling (Weight × 0.375/0.995)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;
