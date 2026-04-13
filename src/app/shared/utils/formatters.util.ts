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

/**
 * Compact number formatter for ECharts axis labels (1 decimal place).
 * Distinct from formatCompactNumber which uses 2 decimal places for millions.
 */
export function formatChartValue(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return String(value);
}

const SSR_FALLBACK_DARK = '#6366f1';
const SSR_FALLBACK_LIGHT = '#4f46e5';

/**
 * Read a CSS custom property from document root at runtime.
 * SSR-safe: returns a fallback indigo color when document is not available.
 *
 * @param name - CSS variable name, e.g. '--color-primary'
 * @param theme - current theme, used only for the SSR fallback
 */
export function getCssVariable(name: string, theme: 'light' | 'dark'): string {
  if (typeof document === 'undefined') {
    return theme === 'dark' ? SSR_FALLBACK_DARK : SSR_FALLBACK_LIGHT;
  }
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    (theme === 'dark' ? SSR_FALLBACK_DARK : SSR_FALLBACK_LIGHT)
  );
}

/**
 * Resolves shared ECharts hex codes for text, grid lines, and tooltips
 * to keep charts visually aligned and DRY.
 */
export function getChartThemeColors(theme: 'light' | 'dark') {
  const dark = theme === 'dark';
  return {
    axisLabel: dark ? '#a1a1aa' : '#52525b',
    gridLine: dark ? '#3f3f46' : '#e4e4e7',
    tooltipBackground: dark ? '#27272a' : '#ffffff',
    tooltipBorder: dark ? '#3f3f46' : '#e4e4e7',
    tooltipText: dark ? '#fafafa' : '#18181b',
  };
}
