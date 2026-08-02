export function money(value, currency) {
  const num = Number(value || 0);
  return `${currency === "INR" ? "₹" : "$"}${num.toFixed(2)}`;
}

export function savingsPercent(price, discountPrice) {
  const p = Number(price || 0);
  const d = Number(discountPrice || 0);
  if (!p || !d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
}
