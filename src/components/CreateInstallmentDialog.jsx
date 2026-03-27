import { useState, useRef } from "react";
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
import { Plus, Smartphone, Banknote, Building2, CreditCard, MoreHorizontal, Upload, X } from "lucide-react";
import { addInstallment } from "@/lib/installment-store";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/utils";

const paymentMethods = [
  { value: "PhonePe", label: "PhonePe", icon: <Smartphone className="h-4 w-4" /> },
  { value: "Google Pay", label: "GPay", icon: <CreditCard className="h-4 w-4" /> },
  { value: "Hand Cash", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
  { value: "Bank Transfer", label: "Bank", icon: <Building2 className="h-4 w-4" /> },
  { value: "Other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];

const CreateInstallmentDialog = ({ memberId, onAdded, trigger }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Hand Cash");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptImage, setReceiptImage] = useState(null);
  const fileRef = useRef();
  const { toast } = useToast();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.5);
      setReceiptImage(compressed);
    } catch {
      toast({ title: "Failed to load image", variant: "destructive" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    addInstallment({
      memberId,
      amount: numAmount,
      paymentMethod,
      description: description.trim() || "Installment",
      date,
      receiptImage: receiptImage ?? null,
    });
    toast({ title: `Installment created — ₹${numAmount.toLocaleString()}` });
    setAmount("");
    setDescription("");
    setPaymentMethod("Hand Cash");
    setDate(new Date().toISOString().split("T")[0]);
    setReceiptImage(null);
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="inst-amount">Amount (₹) *</Label>
              <Input
                id="inst-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode of Payment</Label>
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

          <div className="space-y-2">
            <Label htmlFor="inst-desc">Description</Label>
            <Input
              id="inst-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly installment"
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Image</Label>
            {receiptImage ? (
              <div className="relative w-full">
                <img src={receiptImage} alt="Receipt" className="w-full max-h-40 object-contain rounded-lg border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 bg-background/80"
                  onClick={() => { setReceiptImage(null); fileRef.current.value = ""; }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-muted-foreground flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-5 w-5" />
                Click to upload receipt
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          <Button type="submit" className="w-full">Create Installment</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInstallmentDialog;
