export function ddmmyyyyToInput(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
    2,
    "0"
  )}`;
}

export function inputToDdmmyyyy(value) {
  if (!value) return "";
  const [yyyy, mm, dd] = String(value).split("-");
  if (!dd || !mm || !yyyy) return "";
  return `${String(dd).padStart(2, "0")}/${String(mm).padStart(
    2,
    "0"
  )}/${yyyy}`;
}

export function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
