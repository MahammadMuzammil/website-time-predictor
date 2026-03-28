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
import { Plus } from "lucide-react";
import { addInstallment } from "@/lib/installment-store";
import { useToast } from "@/hooks/use-toast";

const CreateInstallmentDialog = ({ memberId, onAdded, trigger }) => {
  const [open, setOpen] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  const reset = () => {
    setTargetAmount(""); setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    if (!numTarget || numTarget <= 0) {
      toast({ title: "Enter a valid target amount", variant: "destructive" });
      return;
    }
    addInstallment({
      memberId,
      targetAmount: numTarget,
      amount: 0,
      description: description.trim() || "Installment",
      date,
    });
    toast({ title: `Installment created — Target ₹${numTarget.toLocaleString()}` });
    reset();
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Installment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Installment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inst-date">Date</Label>
              <Input id="inst-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inst-target">Target Amount (₹) *</Label>
              <Input
                id="inst-target"
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Enter target amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inst-desc">Description</Label>
            <Input
              id="inst-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly installment"
            />
          </div>

          <Button type="submit" className="w-full">Create Installment</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInstallmentDialog;
