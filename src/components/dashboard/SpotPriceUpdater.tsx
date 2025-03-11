
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SpotPriceUpdaterProps {
  currentPrice: number;
  onUpdate: (price: number) => void;
}

const SpotPriceUpdater: React.FC<SpotPriceUpdaterProps> = ({ 
  currentPrice, 
  onUpdate 
}) => {
  const [newSpotPrice, setNewSpotPrice] = useState<string>(currentPrice.toString());
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  const handleUpdateSpotPrice = () => {
    const price = parseFloat(newSpotPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid spot price");
      return;
    }
    
    setIsUpdatingPrice(true);
    setTimeout(() => {
      onUpdate(price);
      setIsUpdatingPrice(false);
      toast.success("Spot price updated");
    }, 500);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <span className="text-sm text-karat-600 mr-2">Spot Price:</span>
        <input
          type="text"
          value={newSpotPrice}
          onChange={(e) => setNewSpotPrice(e.target.value)}
          className="w-24 h-9 rounded-md border border-karat-200 px-3 py-1 text-sm"
        />
      </div>
      <Button 
        onClick={handleUpdateSpotPrice}
        disabled={isUpdatingPrice}
        className="bg-gold hover:bg-gold-dark text-white"
        size="sm"
      >
        {isUpdatingPrice ? "Updating..." : "Update"}
      </Button>
    </div>
  );
};

export default SpotPriceUpdater;
