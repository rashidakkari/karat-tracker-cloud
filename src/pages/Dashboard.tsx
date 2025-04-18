
import React from "react";
import DashboardComponent from "@/components/dashboard/Dashboard";
import AppLayout from "@/components/layout/AppLayout";
import { useFeaturedItems } from "@/hooks/useFeaturedItems";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { featuredItems, toggleFeature } = useFeaturedItems();

  const handleToggleFeatured = (itemId: string, featured: boolean) => {
    toggleFeature(itemId, featured);
    toast.success(featured ? 'Item added to featured' : 'Item removed from featured');
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Featured Items</h2>
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
                    onClick={() => handleToggleFeatured(item.id, false)}
                  >
                    <Star className="h-4 w-4 fill-amber-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DashboardComponent />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
