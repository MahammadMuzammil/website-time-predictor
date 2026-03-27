import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, IndianRupee, Smartphone, Banknote, Building2, CreditCard, MoreHorizontal, ChevronRight, CalendarDays, User } from "lucide-react";
import { getMembers } from "@/lib/chit-store";
import { getInstallments, deleteInstallment } from "@/lib/installment-store";
import CreateInstallmentDialog from "@/components/CreateInstallmentDialog";
import { useToast } from "@/hooks/use-toast";
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

const paymentMethodIcon = {
  "PhonePe": <Smartphone className="h-3.5 w-3.5" />,
  "Google Pay": <CreditCard className="h-3.5 w-3.5" />,
  "Hand Cash": <Banknote className="h-3.5 w-3.5" />,
  "Bank Transfer": <Building2 className="h-3.5 w-3.5" />,
  "Other": <MoreHorizontal className="h-3.5 w-3.5" />,
};

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => {
    if (!id) return;
    const members = getMembers();
    const found = members.find((m) => m.id === id) ?? null;
    setMember(found);
    if (found) setInstallments(getInstallments(id));
  };

  useEffect(() => { refresh(); }, [id]);

  const handleDelete = () => {
    deleteInstallment(confirmDelete.id);
    toast({ title: "Installment deleted" });
    setConfirmDelete(null);
    refresh();
  };

  const totalPaid = installments.reduce((sum, i) => sum + i.amount, 0);

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Member not found</h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 min-w-0">
              {member.profileImage ? (
                <img src={member.profileImage} alt={member.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold leading-tight truncate">{member.name}</h1>
                <p className="text-xs text-muted-foreground">
                  Since {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <CreateInstallmentDialog memberId={member.id} onAdded={refresh} />
        </div>
      </header>

      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:px-8">
        {/* Member Info */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {member.phone && <span>📞 {member.phone}</span>}
          {member.email && <span>✉️ {member.email}</span>}
          {member.aadhaar && <span>🪪 {member.aadhaar}</span>}
        </div>

        {/* Summary Cards */}
        <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> Installments
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold text-primary">{installments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold">₹{totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Last Installment
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-sm font-medium">
                {installments.length > 0
                  ? new Date(installments[0].date).toLocaleDateString()
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installments List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Installments</CardTitle>
            <Badge variant="outline">{installments.length} records</Badge>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {installments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
                  <IndianRupee className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-base sm:text-lg font-semibold">No installments yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create the first installment for this member.
                </p>
                <CreateInstallmentDialog memberId={member.id} onAdded={refresh} />
              </div>
            ) : (
              <div className="space-y-2">
                {installments.map((inst, i) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/installment/${inst.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{inst.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{new Date(inst.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            {paymentMethodIcon[inst.paymentMethod] ?? paymentMethodIcon["Other"]}
                            {inst.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-bold text-base">₹{inst.amount.toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: inst.id }); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Installment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this installment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemberDetail;
