
import AppLayout from "@/components/layout/AppLayout";
import InventoryList from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InventoryForm from "@/components/inventory/InventoryForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { InventoryItem } from "@/models/inventory";

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp();

  const handleSaveItem = (item: InventoryItem) => {
    if (item.id) {
      updateInventoryItem(item.id, item);
    } else {
      addInventoryItem(item as any);
    }
    setOpen(false);
  };

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
                onSave={handleSaveItem} 
                onCancel={() => setOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
        <InventoryList 
          registerType="Wholesale" 
          items={inventory} 
          onAddItem={() => setOpen(true)} 
          onEditItem={(item) => {}} 
          onViewItem={(item) => {}} 
        />
      </div>
    </AppLayout>
  );
};

export default Inventory;
