import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Trash2, Smartphone, Banknote, Building2, CreditCard,
  MoreHorizontal, Upload, X, Plus, Save, IndianRupee, Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getInstallment,
  updateInstallment,
  updateInstallmentTransaction,
  getInstallmentTransactions,
  addInstallmentTransaction,
  deleteInstallmentTransaction,
} from "@/lib/installment-store";
import { getMembers } from "@/lib/chit-store";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/utils";

const paymentMethods = [
  { value: "PhonePe", label: "PhonePe", icon: <Smartphone className="h-4 w-4" /> },
  { value: "Google Pay", label: "GPay", icon: <CreditCard className="h-4 w-4" /> },
  { value: "Hand Cash", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
  { value: "Bank Transfer", label: "Bank", icon: <Building2 className="h-4 w-4" /> },
  { value: "Other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];


// Editable Transaction Card
const TransactionCard = ({ tx, index, onDeleted, onSaved }) => {
  const [date, setDate] = useState(tx.date);
  const [amount, setAmount] = useState(String(tx.amount));
  const [paymentMethod, setPaymentMethod] = useState(tx.paymentMethod);
  const [description, setDescription] = useState(tx.description);
  const [receiptImage, setReceiptImage] = useState(tx.receiptImage ?? null);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef();
  const { toast } = useToast();

  const mark = (setter) => (val) => { setter(val); setDirty(true); };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.5);
      setReceiptImage(compressed);
      setDirty(true);
    } catch {
      toast({ title: "Failed to load image", variant: "destructive" });
    }
  };

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    updateInstallmentTransaction(tx.id, { date, amount: num, paymentMethod, description: description.trim() || "Payment", receiptImage });
    toast({ title: "Transaction updated" });
    setDirty(false);
    onSaved();
  };

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="text-muted-foreground">Transaction #{index + 1}</span>
          <div className="flex items-center gap-2">
            {dirty && <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">Unsaved</Badge>}
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDeleted}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => mark(setDate)(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => mark(setAmount)(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Mode of Payment</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {paymentMethods.map((pm) => (
              <Button key={pm.value} type="button"
                variant={paymentMethod === pm.value ? "default" : "outline"}
                className="flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs"
                onClick={() => mark(setPaymentMethod)(pm.value)}>
                {pm.icon}{pm.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => mark(setDescription)(e.target.value)} placeholder="e.g. Partial payment" />
        </div>
        <div className="space-y-2">
          <Label>Receipt Image</Label>
          {receiptImage ? (
            <div className="relative w-full">
              <img src={receiptImage} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border" />
              <Button type="button" variant="ghost" size="icon"
                className="absolute top-1 right-1 h-7 w-7 bg-background/80"
                onClick={() => { setReceiptImage(null); setDirty(true); if (fileRef.current) fileRef.current.value = ""; }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-muted-foreground flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition-colors">
              <Upload className="h-5 w-5" />
              Click to upload receipt
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>
        {dirty && (
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Add Transaction Dialog
const AddTransactionDialog = ({ installmentId, onAdded }) => {
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

  const reset = () => {
    setAmount(""); setDescription(""); setPaymentMethod("Hand Cash");
    setDate(new Date().toISOString().split("T")[0]);
    setReceiptImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    addInstallmentTransaction({
      installmentId, amount: num, paymentMethod,
      description: description.trim() || "Payment", date,
      receiptImage: receiptImage ?? null,
    });
    toast({ title: `Transaction added — ₹${num.toLocaleString()}` });
    reset();
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mode of Payment</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {paymentMethods.map((pm) => (
                <Button key={pm.value} type="button"
                  variant={paymentMethod === pm.value ? "default" : "outline"}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs"
                  onClick={() => setPaymentMethod(pm.value)}>
                  {pm.icon}{pm.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Partial payment" />
          </div>
          <div className="space-y-2">
            <Label>Receipt Image</Label>
            {receiptImage ? (
              <div className="relative w-full">
                <img src={receiptImage} alt="Receipt" className="w-full max-h-40 object-contain rounded-lg border" />
                <Button type="button" variant="ghost" size="icon"
                  className="absolute top-1 right-1 h-7 w-7 bg-background/80"
                  onClick={() => { setReceiptImage(null); fileRef.current.value = ""; }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current.click()}
                className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-muted-foreground flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                <Upload className="h-5 w-5" />
                Click to upload receipt
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          <Button type="submit" className="w-full">Add Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Page
const InstallmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef();

  const [installment, setInstallment] = useState(null);
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Editable fields
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Hand Cash");
  const [description, setDescription] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [dirty, setDirty] = useState(false);

  const refresh = () => {
    const inst = getInstallment(id);
    if (!inst) return;
    setInstallment(inst);
    setDate(inst.date);
    setAmount(String(inst.amount));
    setPaymentMethod(inst.paymentMethod);
    setDescription(inst.description);
    setReceiptImage(inst.receiptImage ?? null);
    setTransactions(getInstallmentTransactions(id));
    setDirty(false);
    const members = getMembers();
    setMember(members.find((m) => m.id === inst.memberId) ?? null);
  };

  useEffect(() => { refresh(); }, [id]);

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    updateInstallment(id, { date, amount: num, paymentMethod, description: description.trim() || "Installment", receiptImage });
    toast({ title: "Installment updated" });
    setDirty(false);
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.5);
      setReceiptImage(compressed);
      setDirty(true);
    } catch {
      toast({ title: "Failed to load image", variant: "destructive" });
    }
  };

  const handleDeleteTx = () => {
    deleteInstallmentTransaction(confirmDelete.id);
    toast({ title: "Transaction deleted" });
    setConfirmDelete(null);
    setTransactions(getInstallmentTransactions(id));
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    const memberName = member?.name ?? "Member";
    const instDesc = installment.description;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Installment Report", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Member: ${memberName}`, 14, 28);
    doc.text(`Installment: ${instDesc}`, 14, 34);
    doc.text(`Date: ${new Date(installment.date).toLocaleDateString()}`, 14, 40);
    doc.text(`Amount: Rs.${installment.amount.toLocaleString()}`, 14, 46);
    doc.text(`Mode of Payment: ${installment.paymentMethod}`, 14, 52);

    // All entries: installment first, then sub-transactions
    const installmentRow = [
      1,
      new Date(installment.date).toLocaleDateString(),
      installment.paymentMethod,
      installment.description + " (Installment)",
      `Rs.${installment.amount.toLocaleString()}`,
    ];
    const txRows = transactions.map((tx, i) => [
      i + 2,
      new Date(tx.date).toLocaleDateString(),
      tx.paymentMethod,
      tx.description,
      `Rs.${tx.amount.toLocaleString()}`,
    ]);
    const allRows = [installmentRow, ...txRows];
    const grandTotal = installment.amount + transactions.reduce((s, t) => s + t.amount, 0);

    autoTable(doc, {
      startY: 60,
      head: [["#", "Date", "Mode of Payment", "Description", "Amount"]],
      body: allRows,
      foot: [["", "", "", "Grand Total", `Rs.${grandTotal.toLocaleString()}`]],
      headStyles: { fillColor: [22, 163, 74] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      bodyStyles: (rowIndex) => rowIndex === 0 ? { fontStyle: "bold" } : {},
      styles: { fontSize: 9 },
    });

    doc.save(`${memberName}-${instDesc}-report.pdf`);
  };

  const mark = (setter) => (val) => { setter(val); setDirty(true); };

  const totalTransactions = transactions.reduce((s, t) => s + t.amount, 0);

  if (!installment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Installment not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(member ? `/member/${member.id}` : "/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Installment Details</h1>
              {member && <p className="text-xs text-muted-foreground">{member.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save
              </Button>
            )}
            <Button variant="outline" onClick={downloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Report</span>
            </Button>
            <AddTransactionDialog installmentId={id} onAdded={() => setTransactions(getInstallmentTransactions(id))} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:px-8 space-y-6">

        {/* Editable Installment Card */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              Installment Info
              {dirty && <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">Unsaved changes</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => mark(setDate)(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => mark(setAmount)(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mode of Payment</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {paymentMethods.map((pm) => (
                  <Button key={pm.value} type="button"
                    variant={paymentMethod === pm.value ? "default" : "outline"}
                    className="flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs"
                    onClick={() => mark(setPaymentMethod)(pm.value)}>
                    {pm.icon}{pm.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => mark(setDescription)(e.target.value)} placeholder="e.g. Monthly installment" />
            </div>

            <div className="space-y-2">
              <Label>Receipt Image</Label>
              {receiptImage ? (
                <div className="relative w-full">
                  <img src={receiptImage} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border" />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute top-1 right-1 h-7 w-7 bg-background/80"
                    onClick={() => { setReceiptImage(null); setDirty(true); if (fileRef.current) fileRef.current.value = ""; }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-muted-foreground flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition-colors">
                  <Upload className="h-5 w-5" />
                  Click to upload receipt
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            {dirty && (
              <Button onClick={handleSave} className="w-full gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Transactions</CardTitle>
            <div className="flex items-center gap-2">
              {transactions.length > 0 && (
                <span className="text-sm font-semibold">₹{totalTransactions.toLocaleString()}</span>
              )}
              <Badge variant="outline">{transactions.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <IndianRupee className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet. Use "Add Transaction" to record a payment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, i) => (
                  <TransactionCard
                    key={tx.id}
                    tx={tx}
                    index={i}
                    onDeleted={() => setConfirmDelete({ id: tx.id })}
                    onSaved={() => setTransactions(getInstallmentTransactions(id))}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTx} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InstallmentDetail;
