const STORAGE_KEY = "chitfund_installments";
const TX_KEY = "chitfund_installment_transactions";

function getAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getInstallments(memberId) {
  return getAll()
    .filter((i) => i.memberId === memberId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getInstallment(id) {
  return getAll().find((i) => i.id === id) ?? null;
}

export function addInstallment(data) {
  const all = getAll();
  const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return item;
}

export function updateInstallment(id, data) {
  const all = getAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[idx];
}

export function deleteInstallment(id) {
  const all = getAll().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  // also delete sub-transactions
  const txs = getAllInstallmentTransactions().filter((t) => t.installmentId !== id);
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

// Sub-transactions within an installment
function getAllInstallmentTransactions() {
  const raw = localStorage.getItem(TX_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getInstallmentTransactions(installmentId) {
  return getAllInstallmentTransactions()
    .filter((t) => t.installmentId === installmentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Returns a map of { [installmentId]: transactions[] } for a set of installment ids
export function getTransactionsByInstallmentIds(installmentIds) {
  const all = getAllInstallmentTransactions();
  const map = {};
  installmentIds.forEach((id) => { map[id] = []; });
  all.forEach((t) => { if (map[t.installmentId]) map[t.installmentId].push(t); });
  return map;
}

export function addInstallmentTransaction(data) {
  const all = getAllInstallmentTransactions();
  const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(item);
  localStorage.setItem(TX_KEY, JSON.stringify(all));
  return item;
}

export function updateInstallmentTransaction(id, data) {
  const all = getAllInstallmentTransactions();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data };
  localStorage.setItem(TX_KEY, JSON.stringify(all));
  return all[idx];
}

export function deleteInstallmentTransaction(id) {
  const all = getAllInstallmentTransactions().filter((t) => t.id !== id);
  localStorage.setItem(TX_KEY, JSON.stringify(all));
}
