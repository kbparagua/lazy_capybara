/**
 * Formats a numeric value or string into a currency format with 2 decimal points.
 * 
 * @param {number|string} value - The value to be formatted.
 * @returns {string} The formatted currency string (e.g., "P10.00").
 */
export function formatCurrency(value) {
  const amount = parseFloat(value);
  if (isNaN(amount)) return 'P0.00';
  return `P${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}