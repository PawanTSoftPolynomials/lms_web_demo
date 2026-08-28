/** Same discount-over-list-price precedence as the course detail page's own enroll logic. */
export function getPriceInfo(store) {
  const isFree = !store || store.isFree || (!store.price && !store.discountPrice);
  if (isFree) return { isFree: true, effectivePrice: 0, listPrice: null, currency: "INR" };

  const hasDiscount = store.discountPrice !== null && store.discountPrice !== undefined && store.discountPrice > 0 && store.discountPrice < store.price;

  return {
    isFree: false,
    effectivePrice: hasDiscount ? store.discountPrice : store.price,
    listPrice: hasDiscount ? store.price : null,
    currency: store.currency || "INR",
  };
}

export function formatPrice(amount, currency) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
