
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OptionalSectionProps {
  location: string;
  supplier: string;
  notes: string;
  tags?: string[];
  onLocationChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onTagsChange?: (tags: string[]) => void;
}

const OptionalSection = ({
  location,
  supplier,
  notes,
  tags = [],
  onLocationChange,
  onSupplierChange,
  onNotesChange,
  onTagsChange,
}: OptionalSectionProps) => {
  const [tagInput, setTagInput] = useState<string>('');
  
  const handleAddTag = () => {
    if (tagInput.trim() !== '' && onTagsChange) {
      const newTags = [...tags, tagInput.trim()];
      onTagsChange(newTags);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    if (onTagsChange) {
      const newTags = tags.filter(tag => tag !== tagToRemove);
      onTagsChange(newTags);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
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
      
      {onTagsChange && (
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex space-x-2">
            <Input
              id="tags"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button 
              type="button" 
              size="sm" 
              onClick={handleAddTag}
              variant="outline"
              disabled={tagInput.trim() === ''}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                  variant="secondary"
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
      
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
