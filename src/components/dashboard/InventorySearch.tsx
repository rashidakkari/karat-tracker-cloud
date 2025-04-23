
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/contexts/types";

interface InventorySearchProps {
  inventory: InventoryItem[];
}

const InventorySearch = ({ inventory }: InventorySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  
  // Search functionality
  const searchResults = searchQuery.trim() !== "" 
    ? inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Toggle pin status for items
  const togglePinItem = (itemId: string) => {
    setPinnedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Get details for all pinned items
  const pinnedItemsDetails = inventory.filter(item => pinnedItems.includes(item.id));
  
  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      
      {searchQuery && searchResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Search Results</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {searchResults.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category} • {item.purity} • {item.weight}{item.weightUnit} • Qty: {item.quantity}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => togglePinItem(item.id)}
                >
                  {pinnedItems.includes(item.id) ? "Unpin" : "Pin"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {pinnedItemsDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Pinned Items</h4>
          <div className="space-y-2">
            {pinnedItemsDetails.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-md bg-amber-50">
                <div>
                  <div className="font-medium flex items-center">
                    {item.name}
                    <Badge className="ml-2" variant={item.type === "wholesale" ? "outline" : "default"}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.category} • {item.purity} • {item.weight}{item.weightUnit}
                  </div>
                  <div className="text-sm font-medium">
                    Quantity: {item.quantity} • 24K Equivalent: {item.equivalent24k || 0}g
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => togglePinItem(item.id)}
                >
                  Unpin
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default InventorySearch;
