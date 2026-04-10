/**
 * Format a number with locale-aware separators and abbreviations for large numbers.
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return millions.toFixed(2) + 'M';
  } else if (value >= 1_000) {
    const thousands = value / 1_000;
    return thousands.toFixed(1) + 'K';
  }
  return value.toLocaleString('en-US');
}

/**
 * Format a percentage value.
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(1) + '%';
}

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
