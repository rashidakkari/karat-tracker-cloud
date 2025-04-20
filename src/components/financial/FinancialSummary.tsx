import React from 'react';

interface FinancialSummaryProps {
  previousSpotPrice: number | null;
  currentSpotPrice: number | null;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ previousSpotPrice, currentSpotPrice }) => {

  const calculateSpotPriceChange = () => {
    if (typeof previousSpotPrice === 'number' && typeof currentSpotPrice === 'number') {
      const change = ((currentSpotPrice - previousSpotPrice) / previousSpotPrice) * 100;
      return Number(change.toFixed(2));
    }
    return 0;
  };

  return (
    <div>
      <h3>Financial Summary</h3>
      <p>Previous Spot Price: {previousSpotPrice}</p>
      <p>Current Spot Price: {currentSpotPrice}</p>
      <p>Spot Price Change: {calculateSpotPriceChange()}%</p>
    </div>
  );
};

export default FinancialSummary;
