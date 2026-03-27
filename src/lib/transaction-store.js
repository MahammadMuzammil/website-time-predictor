const STORAGE_KEY = "chitfund_transactions";

export function getTransactions(memberId) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : [];
  return all.filter((t) => t.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addTransaction(data) {
  const all = getAllTransactions();
  const transaction = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return transaction;
}

export function deleteTransaction(id) {
  const all = getAllTransactions().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getMemberSummary(memberId, targetAmount = 0) {
  const transactions = getTransactions(memberId);
  const totalPaid = transactions.filter((t) => t.type === "paid").reduce((sum, t) => sum + t.amount, 0);
  const totalPending = Math.max(0, targetAmount - totalPaid);
  return { totalPaid, totalPending };
}
