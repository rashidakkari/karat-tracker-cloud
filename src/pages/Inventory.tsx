
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import InventoryList from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/inventory/InventoryForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { InventoryItem as ModelInventoryItem, ItemCategory } from "@/models/inventory";

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp();
  const [editingItem, setEditingItem] = useState<ModelInventoryItem | null>(null);

  // Handle saving an inventory item
  const handleSaveItem = (item: any) => {
    // Convert the category to lowercase if needed
    if (item.category === "Bars") item.category = "bars";
    if (item.category === "Coins") item.category = "coins";
    if (item.category === "Jewelry") item.category = "jewelry";
    
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

  // Map AppContext inventory items to ModelInventoryItem type
  const mappedInventory = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category as ItemCategory,
    weight: item.weight, 
    weightUnit: item.weightUnit === "kg" ? "g" : item.weightUnit, // Convert kg to g to match allowed types
    purity: item.purity,
    quantity: item.quantity,
    costPrice: typeof item.costPrice !== 'undefined' ? item.costPrice : 0,
    sellingPrice: 0,
    equivalent24k: item.equivalent24k || 0,
    description: item.description || '',
    dateAcquired: item.dateAdded || '',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })) as ModelInventoryItem[];

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
        <InventoryList 
          registerType="Wholesale" 
          items={mappedInventory} 
          onAddItem={() => setOpen(true)} 
          onEditItem={handleEditItem} 
          onViewItem={handleViewItem} 
        />
      </div>
    </AppLayout>
  );
};

export default Inventory;
