export const formatNumberInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const cleaned = String(value).replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  // Use regex to add commas for thousands
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseNumberInput = (value) => {
  const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  const numericValue = Number(cleaned);
  return Number.isFinite(numericValue) ? numericValue : "";
};
