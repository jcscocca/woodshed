// Local-date helpers. Everything is keyed to the user's local day,
// not UTC, so "today" matches what they'd expect at the keyboard.

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(str, n) {
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function daysSince(dateStr, today) {
  if (!dateStr) return 9999;
  const [y1, m1, d1] = dateStr.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1), b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

export function prettyAgo(dateStr, today) {
  if (!dateStr) return "never";
  const d = daysSince(dateStr, today);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  return `${Math.round(d / 30)}mo ago`;
}
