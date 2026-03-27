import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Trash2, IndianRupee, Clock, CheckCircle2, Smartphone, Banknote, Building2, CreditCard, MoreHorizontal, Target } from "lucide-react";
import { getMembers } from "@/lib/chit-store";
import {
  getTransactions,
  getMemberSummary,
  deleteTransaction,
} from "@/lib/transaction-store";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import { useToast } from "@/hooks/use-toast";

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
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0 });

  const refresh = () => {
    if (!id) return;
    const members = getMembers();
    const found = members.find((m) => m.id === id) ?? null;
    setMember(found);
    if (found) {
      setTransactions(getTransactions(id));
      setSummary(getMemberSummary(id, found.targetAmount ?? 0));
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const handleDeleteTransaction = (txId) => {
    deleteTransaction(txId);
    toast({ title: "Transaction deleted" });
    refresh();
  };

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
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold leading-tight truncate">{member.name}</h1>
              <p className="text-xs text-muted-foreground">
                Since {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <AddTransactionDialog memberId={member.id} onAdded={refresh} />
        </div>
      </header>

      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:px-8">
        {/* Member Info */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {member.phone && <span>📞 {member.phone}</span>}
          {member.email && <span>✉️ {member.email}</span>}
        </div>

        {/* Summary Cards */}
        <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Target
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold">
                ₹{(member.targetAmount ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> Paid
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold text-primary">
                ₹{summary.totalPaid.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold text-accent">
                ₹{summary.totalPending.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-xl sm:text-3xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
            <Badge variant="outline">{transactions.length} records</Badge>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
                  <IndianRupee className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-base sm:text-lg font-semibold">No transactions yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Add the first transaction for this member.
                </p>
                <AddTransactionDialog memberId={member.id} onAdded={refresh} />
              </div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="space-y-3 sm:hidden">
                  {transactions.map((tx, i) => (
                    <div
                      key={tx.id}
                      className="rounded-lg border bg-card p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <Badge
                            variant={tx.type === "paid" ? "default" : "secondary"}
                            className={
                              tx.type === "paid"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-accent/10 text-accent border-accent/20"
                            }
                          >
                            {tx.type === "paid" ? "Paid" : "Pending"}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {paymentMethodIcon[tx.paymentMethod || "Other"]}
                            {tx.paymentMethod || "Other"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTransaction(tx.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-lg font-bold shrink-0">₹{tx.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-16 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, i) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              {paymentMethodIcon[tx.paymentMethod || "Other"]}
                              <span className="hidden md:inline">{tx.paymentMethod || "Other"}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={tx.type === "paid" ? "default" : "secondary"}
                              className={
                                tx.type === "paid"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-accent/10 text-accent border-accent/20"
                              }
                            >
                              {tx.type === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemberDetail;
