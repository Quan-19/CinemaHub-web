export const formatNumberInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const numericValue = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) return "";
  return Math.round(numericValue).toLocaleString("en-US");
};

export const parseNumberInput = (value) => {
  const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  const numericValue = Number(cleaned);
  return Number.isFinite(numericValue) ? numericValue : "";
};
