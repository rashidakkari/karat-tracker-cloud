
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface OptionalSectionProps {
  location: string;
  supplier: string;
  notes: string;
  onLocationChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

const OptionalSection = ({
  location,
  supplier,
  notes,
  onLocationChange,
  onSupplierChange,
  onNotesChange,
}: OptionalSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Storage Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            value={supplier}
            onChange={(e) => onSupplierChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-20"
        />
      </div>
    </>
  );
};

export default OptionalSection;
