/**
 * View model types for the Overview Dashboard page.
 * These interfaces define the shape of data passed from OverviewFacade to presentational components.
 */

/**
 * Top-level view model passed from OverviewFacade → OverviewPage → child components.
 */
export interface OverviewViewModel {
  kpis: KpiGridViewModel;
  yoySeries: YoyGrowthPoint[];
  leaderboard: LeaderboardRow[];
  parityIndex: ParityIndexViewModel;
  insights: InsightItem[];
}

/**
 * Four KPI cards composed into a single object for clarity.
 */
export interface KpiGridViewModel {
  totalStudents: KpiCardViewModel;
  growthRate: KpiCardViewModel;
  genderDistribution: GenderKpiViewModel;
  largestRegion: KpiCardViewModel;
}

/**
 * Generic single-value KPI card. Used for Total Students, Growth Rate, Largest Region.
 */
export interface KpiCardViewModel {
  labelKey: string;
  /** Use `value` for already-formatted strings (numbers, percents). */
  value?: string;
  /** Use `valueKey` when the value itself is a translation key (e.g., a region name). */
  valueKey?: string;
  sublabelKey?: string;
  sublabelParams?: Record<string, string | number>;
  trend?: 'up' | 'down' | 'neutral';
  iconName?: string;
  customSvgUrl?: string;
  actionUrl?: string;
}

/**
 * Split KPI card for gender distribution (two values in one card).
 */
export interface GenderKpiViewModel {
  labelKey: string;
  male: GenderSplitItem;
  female: GenderSplitItem;
}

/**
 * One side of the gender distribution split.
 */
export interface GenderSplitItem {
  labelKey: string;
  count: string;
  percent: string;
  iconName: string;
}

/**
 * One data point for the Year-over-Year bar chart.
 */
export interface YoyGrowthPoint {
  year: number;
  growthPercent: number;
}

/**
 * One row in the Regional Performance leaderboard.
 */
export interface LeaderboardRow {
  rank: number;
  region: string;
  studentCount: number;
  formattedCount: string;
  barWidthPercent: number;
}

/**
 * Data for the Gender Parity Index gauge.
 */
export interface ParityIndexViewModel {
  ratio: number;
  labelKey: string;
}

/**
 * Category type for insight badges.
 */
export type InsightCategory = 'growth' | 'demographics' | 'regional' | 'stage';

/**
 * One entry in the Insights & Highlights panel.
 */
export interface InsightItem {
  badgeLabelKey: string;
  category: InsightCategory;
  textKey: string;
  textParams: Record<string, string | number>;
}
