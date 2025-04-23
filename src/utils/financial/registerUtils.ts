
/**
 * Get register balance based on filter type and currency
 */
export const getRegisterBalance = (
  registerType: "all" | "wholesale" | "retail",
  financialData: {
    wholesaleBalance?: { [key: string]: number };
    retailBalance?: { [key: string]: number };
  },
  currency: string
): number => {
  if (registerType === "wholesale") {
    return financialData.wholesaleBalance?.[currency] || 0;
  } else if (registerType === "retail") {
    return financialData.retailBalance?.[currency] || 0;
  } else {
    const wholesaleBalance = financialData.wholesaleBalance?.[currency] || 0;
    const retailBalance = financialData.retailBalance?.[currency] || 0;
    return wholesaleBalance + retailBalance;
  }
};
