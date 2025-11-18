export const sumSelectedPrices = (selected = {}) => {
  let total = 0;
  try {
    Object.keys(selected || {}).forEach((k) => {
      const p = selected?.[k];
      const val = typeof p?.price === 'number' ? p.price : parseFloat(p?.price ?? '0');
      if (!Number.isNaN(val)) total += val;
    });
  } catch {}
  return total;
};