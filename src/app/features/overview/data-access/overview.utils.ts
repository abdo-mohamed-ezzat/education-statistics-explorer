import { EducationMasterData } from '../../../core/models/education-data.model';
import {
  YoyGrowthPoint,
  LeaderboardRow,
  ParityIndexViewModel,
  InsightItem,
  InsightCategory,
} from '../models/overview.model';

import { sumMetric, splitByGender } from '../../../shared/utils/data-aggregation.util';
import { formatNumber } from '../../../shared/utils/formatters.util';


/**
 * Compute growth rate percentage vs. unfiltered baseline year.
 * Growth rate = ((filteredTotal - baselineTotal) / baselineTotal) * 100
 */
export function computeGrowthRate(
  filteredData: EducationMasterData[],
  baselineData: EducationMasterData[]
): number | null {
  const baselineTotal = sumMetric(baselineData, 'studentCount');
  const filteredTotal = sumMetric(filteredData, 'studentCount');

  if (baselineTotal === 0) {
    return null;
  }

  return ((filteredTotal - baselineTotal) / baselineTotal) * 100;
}

/**
 * Compute YoY growth series from data.
 * Groups data by year, sorts ascending, and computes growth percentage for each year
 * relative to the previous year. Earliest year gets growthPercent = 0 (baseline).
 */
export function computeYoySeries(data: EducationMasterData[]): YoyGrowthPoint[] {
  // Group by year and sum student counts
  const yearMap = new Map<number, number>();
  for (const row of data) {
    const current = yearMap.get(row.year) ?? 0;
    yearMap.set(row.year, current + row.studentCount);
  }

  // Sort years ascending
  const years = Array.from(yearMap.keys()).sort((a, b) => a - b);

  if (years.length === 0) {
    return [];
  }

  // Build series with growth percentages
  const series: YoyGrowthPoint[] = [];
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const total = yearMap.get(year)!;

    if (i === 0) {
      // Earliest year is baseline with 0% growth
      series.push({ year, growthPercent: 0 });
    } else {
      const prevYear = years[i - 1];
      const prevTotal = yearMap.get(prevYear)!;

      if (prevTotal === 0) {
        series.push({ year, growthPercent: 0 });
      } else {
        const growth = ((total - prevTotal) / prevTotal) * 100;
        series.push({ year, growthPercent: growth });
      }
    }
  }

  return series;
}


/**
 * Build top-N leaderboard rows from filtered data.
 * Sorts descending by student count and returns up to maxRows.
 * barWidthPercent is relative to the top region's count (rank 1 always has 100%).
 */
export function buildLeaderboardRows(
  data: EducationMasterData[],
  maxRows: number
): LeaderboardRow[] {
  // Group by region and sum student counts
  const regionMap = new Map<string, number>();
  for (const row of data) {
    const current = regionMap.get(row.region) ?? 0;
    regionMap.set(row.region, current + row.studentCount);
  }

  // Sort descending by count and take top N
  const sorted = Array.from(regionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxRows);

  if (sorted.length === 0) {
    return [];
  }

  const maxCount = sorted[0][1];

  // Build rows
  return sorted.map((entry, index) => {
    const region = entry[0];
    const count = entry[1];
    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

    return {
      rank: index + 1,
      region,
      studentCount: count,
      formattedCount: formatNumber(count),
      barWidthPercent: barWidth,
    };
  });
}


/**
 * Compute parity index from gender split counts.
 * Ratio = femaleCount / maleCount, clamped to [0, 2].
 * Handles division-by-zero by returning ratio = 2 (max imbalance).
 */
export function computeParityIndex(
  maleCount: number,
  femaleCount: number
): ParityIndexViewModel {
  let ratio: number;

  if (maleCount === 0 && femaleCount === 0) {
    // No data - return max imbalance
    ratio = 2;
  } else if (maleCount === 0) {
    // Only females - max imbalance
    ratio = 2;
  } else {
    ratio = femaleCount / maleCount;
  }

  // Clamp to [0, 2]
  ratio = Math.max(0, Math.min(2, ratio));

  // Determine label based on ratio
  let labelKey: string;
  if (ratio === 0 || ratio === 2) {
    labelKey = 'overview.analytics.parity-max';
  } else if (ratio > 1.05) {
    labelKey = 'overview.analytics.parity-female';
  } else if (ratio < 0.95) {
    labelKey = 'overview.analytics.parity-male';
  } else {
    labelKey = 'overview.analytics.parity-near';
  }

  return { ratio, labelKey };
}

/**
 * Build the 5-item static insight list.
 * Priority order: Regional → Growth → Demographics → Education Stage → Peak Year
 */
export function buildInsightItems(
  latestYearData: EducationMasterData[],
  yoySeries: YoyGrowthPoint[],
  allData: EducationMasterData[],
  translateFn: (key: string) => string
): InsightItem[] {
  const insights: InsightItem[] = [];
  const total = sumMetric(latestYearData, 'studentCount');

  // 1. Regional - Largest region
  const leaderboard = buildLeaderboardRows(latestYearData, 1);
  if (leaderboard.length > 0) {
    const topRegion = leaderboard[0];
    const regionPercent =
      total > 0 ? ((topRegion.studentCount / total) * 100).toFixed(1) : '0';
    insights.push({
      badgeLabelKey: 'overview.insights.badge-regional',
      category: 'regional',
      textKey: 'overview.insights.insight-largest-region',
      textParams: { region: translateFn(topRegion.region), value: regionPercent },
    });
  }

  // 2. Growth - Growth rate compared to 2016
  // baselineData MUST come from allData since latestYearData only contains ~2024
  const baselineData = allData.filter((r) => r.year === 2016);
  const growthRate = computeGrowthRate(latestYearData, baselineData);
  if (growthRate !== null) {
    const direction = growthRate >= 0 ? translateFn('overview.insights.increased') : translateFn('overview.insights.decreased');
    const absGrowth = Math.abs(growthRate).toFixed(1);
    insights.push({
      badgeLabelKey: 'overview.insights.badge-growth',
      category: 'growth',
      textKey: 'overview.insights.insight-growth-rate',
      textParams: { direction, value: absGrowth },
    });
  }

  // 3. Demographics - Female share
  const { femaleCount } = splitByGender(latestYearData);
  const femalePercent =
    total > 0 ? ((femaleCount / total) * 100).toFixed(1) : '0';
  insights.push({
    badgeLabelKey: 'overview.insights.badge-demographics',
    category: 'demographics',
    textKey: 'overview.insights.insight-female-share',
    textParams: { value: femalePercent },
  });

  // 4. Education Stage - Primary education share
  const primaryData = latestYearData.filter((r) => {
    const s = r.stage.toLowerCase();
    return s.includes('ابتدائي') || s.includes('إبتدائي') || s.includes('primary');
  });
  const primaryTotal = sumMetric(primaryData, 'studentCount');
  const primaryPercent =
    total > 0 ? ((primaryTotal / total) * 100).toFixed(1) : '0';
  insights.push({
    badgeLabelKey: 'overview.insights.badge-stage',
    category: 'stage',
    textKey: 'overview.insights.insight-primary-share',
    textParams: { value: primaryPercent },
  });

  // 5. Growth - Peak year with highest YoY growth
  if (yoySeries.length > 1) {
    // Skip baseline year (first year with 0% growth)
    const growthYears = yoySeries.slice(1);
    if (growthYears.length > 0) {
      const peakYear = growthYears.reduce((max, point) =>
        point.growthPercent > max.growthPercent ? point : max
      );
      insights.push({
        badgeLabelKey: 'overview.insights.badge-growth',
        category: 'growth',
        textKey: 'overview.insights.insight-peak-year',
        textParams: {
          year: peakYear.year,
          value: peakYear.growthPercent.toFixed(1),
        },
      });
    }
  }

  return insights;
}
