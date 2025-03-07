
import { AppLayout } from "@/components/layout/AppLayout";
import { InventoryList } from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

const Inventory = () => {
  const [open, setOpen] = useState(false);

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
              <InventoryForm onComplete={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <InventoryList />
      </div>
    </AppLayout>
  );
};

export default Inventory;
