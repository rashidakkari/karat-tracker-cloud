
import { AppLayout } from "@/components/layout/AppLayout";
import { PriceCalculator } from "@/components/calculator/PriceCalculator";

const Calculator = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Gold Price Calculator</h1>
        <PriceCalculator />
      </div>
    </AppLayout>
  );
};

export default Calculator;
