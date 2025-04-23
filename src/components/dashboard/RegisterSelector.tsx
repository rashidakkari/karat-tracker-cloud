
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface RegisterSelectorProps {
  registerFilter: "all" | "wholesale" | "retail";
  setRegisterFilter: (value: "all" | "wholesale" | "retail") => void;
  getRegisterBalance: () => number;
  currency: string;
}

const RegisterSelector = ({ 
  registerFilter, 
  setRegisterFilter,
  getRegisterBalance,
  currency
}: RegisterSelectorProps) => {
  return (
    <>
      <div className="flex items-center space-x-4">
        <Select value={registerFilter} onValueChange={(value) => setRegisterFilter(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Register" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registers</SelectItem>
            <SelectItem value="wholesale">Wholesale Register</SelectItem>
            <SelectItem value="retail">Retail Register</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {registerFilter === "all" ? "Viewing all registers" : `Viewing ${registerFilter} register`}
        </span>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Register Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getRegisterBalance(), currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {registerFilter === "all" ? "Combined registers" : `${registerFilter} register`}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RegisterSelector;
