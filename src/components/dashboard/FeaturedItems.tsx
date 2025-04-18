
import React from 'react';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const FeaturedItems = () => {
  const { featuredItems, toggleFeature } = useFeaturedItems();

  if (featuredItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Featured Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
            <Star className="h-10 w-10 mb-2 opacity-20" />
            <p>No featured items</p>
            <p className="text-xs mt-1">Star items in Inventory to monitor them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Featured Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredItems.map(item => (
            <div key={item.id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.weight}{item.weightUnit} · {item.purity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFeature(item.id, false)}
                >
                  <Star className="h-4 w-4 fill-amber-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedItems;
