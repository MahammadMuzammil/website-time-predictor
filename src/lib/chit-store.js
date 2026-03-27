const STORAGE_KEY = "chitfund_members";

function generateId() {
  return crypto.randomUUID();
}

export function getMembers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addMember(data) {
  const members = getMembers();
  const member = {
    ...data,
    id: generateId(),
    joinedAt: new Date().toISOString(),
  };
  members.push(member);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return member;
}

export function deleteMember(id) {
  const members = getMembers().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function updateMember(id, data) {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  members[idx] = { ...members[idx], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return members[idx];
}
