
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import InventoryList from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/inventory/InventoryForm";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { InventoryItem as ModelInventoryItem, ItemCategory } from "@/models/inventory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp();
  const [editingItem, setEditingItem] = useState<ModelInventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<"wholesale" | "retail">("wholesale");

  // Handle saving an inventory item
  const handleSaveItem = (item: any) => {
    // Convert the category to lowercase if needed
    if (item.category === "Bars") item.category = "bars";
    if (item.category === "Coins") item.category = "coins";
    if (item.category === "Jewelry") item.category = "jewelry";
    
    // Set the type based on the active tab
    item.type = activeTab;
    
    if (item.id) {
      updateInventoryItem(item.id, item);
    } else {
      addInventoryItem(item);
    }
    setOpen(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: ModelInventoryItem) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleViewItem = (item: ModelInventoryItem) => {
    console.log("Viewing item:", item);
    // You could implement a view modal here
  };

  // Map AppContext inventory items to ModelInventoryItem type and filter by type
  const mapAndFilterInventory = (type: "wholesale" | "retail") => {
    return inventory
      .filter(item => item.type === type)
      .map(item => {
        // Define the mapped item with the correct type structure
        const mappedItem: ModelInventoryItem = {
          id: item.id,
          name: item.name,
          category: item.category as ItemCategory,
          weight: item.weight, 
          weightUnit: item.weightUnit === "kg" ? "g" : item.weightUnit as "g" | "oz" | "tola" | "baht", 
          purity: item.purity,
          quantity: item.quantity,
          // The costPrice field in the model is required
          costPrice: 0, // Default value
          sellingPrice: 0,
          equivalent24k: item.equivalent24k || 0,
          description: item.description || '',
          dateAcquired: item.dateAdded || '',
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // If the item from context has costPrice, use it with proper type checking
        if ('costPrice' in item && typeof item.costPrice === 'number') {
          mappedItem.costPrice = item.costPrice;
        }
        
        return mappedItem;
      });
  };

  const wholesaleInventory = mapAndFilterInventory("wholesale");
  const retailInventory = mapAndFilterInventory("retail");

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">Inventory Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <InventoryForm 
                item={editingItem || undefined}
                onSave={handleSaveItem} 
                onCancel={() => {
                  setOpen(false);
                  setEditingItem(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "wholesale" | "retail")} className="mb-6">
          <TabsList className="w-full max-w-md grid grid-cols-2">
            <TabsTrigger value="wholesale">Wholesale Inventory</TabsTrigger>
            <TabsTrigger value="retail">Retail Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wholesale" className="mt-4">
            <InventoryList 
              registerType="Wholesale" 
              items={wholesaleInventory} 
              onAddItem={() => setOpen(true)} 
              onEditItem={handleEditItem} 
              onViewItem={handleViewItem} 
            />
          </TabsContent>
          
          <TabsContent value="retail" className="mt-4">
            <InventoryList 
              registerType="Retail" 
              items={retailInventory} 
              onAddItem={() => setOpen(true)} 
              onEditItem={handleEditItem} 
              onViewItem={handleViewItem} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Inventory;
