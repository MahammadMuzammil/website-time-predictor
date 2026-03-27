import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Smartphone, Banknote, Building2, CreditCard, MoreHorizontal } from "lucide-react";
import { addTransaction } from "@/lib/transaction-store";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { value: "PhonePe", label: "PhonePe", icon: <Smartphone className="h-4 w-4" /> },
  { value: "Google Pay", label: "GPay", icon: <CreditCard className="h-4 w-4" /> },
  { value: "Hand Cash", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
  { value: "Bank Transfer", label: "Bank", icon: <Building2 className="h-4 w-4" /> },
  { value: "Other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];

const AddTransactionDialog = ({ memberId, onAdded }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Hand Cash");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    addTransaction({
      memberId,
      amount: numAmount,
      type: "paid",
      paymentMethod,
      description: description.trim() || "Payment",
      date,
    });
    toast({ title: `Transaction added — ₹${numAmount.toLocaleString()}` });
    setAmount("");
    setDescription("");
    setPaymentMethod("Hand Cash");
    setDate(new Date().toISOString().split("T")[0]);
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {paymentMethods.map((pm) => (
                <Button
                  key={pm.value}
                  type="button"
                  variant={paymentMethod === pm.value ? "default" : "outline"}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs"
                  onClick={() => setPaymentMethod(pm.value)}
                >
                  {pm.icon}
                  {pm.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly installment"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
