
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

const Transactions = () => {
  const [open, setOpen] = useState(false);

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">Transactions</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <PlusIcon className="mr-2 h-4 w-4" /> New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <TransactionForm onComplete={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <TransactionList />
      </div>
    </AppLayout>
  );
};

export default Transactions;
