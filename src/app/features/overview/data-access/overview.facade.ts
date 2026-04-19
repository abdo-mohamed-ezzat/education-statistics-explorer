import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EducationDataService } from '../../../core/services/education-data.service';
import { GlobalFilterService } from '../../../core/services/global-filter.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import {
  EducationMasterData,
  DATASET_BASELINE_YEAR,
  DATASET_FALLBACK_LATEST_YEAR,
} from '../../../core/models/education-data.model';
import { ViewState, ViewStateHelpers } from '../../../shared/models/view-state.model';
import {
  OverviewViewModel,
  KpiGridViewModel,
  KpiCardViewModel,
  GenderKpiViewModel,
  GenderSplitItem,
} from '../models/overview.model';
import {
  computeGrowthRate,
  computeYoySeries,
  buildLeaderboardRows,
  computeParityIndex,
  buildInsightItems,
} from './overview.utils';

import { applyDataFilters } from '../../../shared/utils/data-filters.util';
import { getTranslationKey } from '../../../shared/utils/data-translation.util';
import { formatCompactNumber, formatPercent } from '../../../shared/utils/formatters.util';
import { sumMetric, splitByGender } from '../../../shared/utils/data-aggregation.util';

@Injectable({
  providedIn: 'root',
})
export class OverviewFacade {
  private readonly dataService = inject(EducationDataService);
  private readonly filterService = inject(GlobalFilterService);
  private readonly translocoService = inject(TranslocoService);
  private readonly prefs = inject(PreferencesService);

  // Error state tracking
  private readonly errorState = signal<{ hasError: boolean; message: string }>({
    hasError: false,
    message: '',
  });

  // Unfiltered full dataset - toSignal handles the async loading
  private readonly allData = toSignal(this.dataService.getMaster(), {
    initialValue: [] as EducationMasterData[],
  });

  // Filter state for derivations
  private readonly filterState = computed(() => this.filterService.state());

  // Find the latest year in the dataset
  private readonly latestYear = computed(() => {
    const data = this.allData();
    if (!data || data.length === 0) return DATASET_FALLBACK_LATEST_YEAR; // Fallback if no data
    return Math.max(...data.map((r) => r.year));
  });

  // Strictly filtered data (Total Students, Growth Rate)
  // If year is "All" (null), default to latestYear()
  private readonly strictFilteredData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    const state = this.filterState();
    const effectiveYear = state.year ?? this.latestYear();
    return applyDataFilters(data, { ...state, year: effectiveYear });
  });

  // Ignores Year filter
  private readonly yoyIsolatedData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    return applyDataFilters(data, { ...this.filterState(), year: null });
  });

  // Ignores Region filter, but respects year (defaults to Latest Year)
  private readonly regionIsolatedData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    const state = this.filterState();
    const effectiveYear = state.year ?? this.latestYear();
    return applyDataFilters(data, { ...state, region: null, year: effectiveYear });
  });

  // Ignores Gender filter, but respects year (defaults to Latest Year)
  private readonly genderIsolatedData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    const state = this.filterState();
    const effectiveYear = state.year ?? this.latestYear();
    return applyDataFilters(data, { ...state, gender: null, year: effectiveYear });
  });

  // Exact matching subset from baseline year (ignores current year filter)
  private readonly primaryBaselineData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    return applyDataFilters(data, { ...this.filterState(), year: DATASET_BASELINE_YEAR });
  });

  // YoY series computed from yoyIsolatedData to show all years for current subset
  private readonly yoySeries = computed(() => {
    const data = this.yoyIsolatedData();
    if (!data) return [];
    return computeYoySeries(data);
  });

  // Insights Data: Unfiltered Latest Year (Point In Time Snapshot ignoring all filters)
  private readonly unfilteredLatestYearData = computed(() => {
    const data = this.allData();
    if (!data) return [];
    const targetYear = this.latestYear();
    return data.filter((r) => r.year === targetYear);
  });

  // Insights Data: Unfiltered YoY Series (To calculate true National Peak Year)
  private readonly unfilteredYoySeries = computed(() => {
    const data = this.allData();
    if (!data) return [];
    return computeYoySeries(data);
  });

  // Full computed view state
  public readonly viewState = computed<ViewState<OverviewViewModel>>(() => {
    // Check for error state
    if (this.errorState().hasError) {
      return ViewStateHelpers.error(this.errorState().message);
    }

    const data = this.allData();

    // If still loading (empty array means not loaded yet, but toSignal with initialValue doesn't give us null)
    // We check if data is empty and treat as loading initially
    if (!data || data.length === 0) {
      // Could be loading or empty - we need to distinguish
      // For now, if strict is also empty, show empty state
      const strict = this.strictFilteredData();
      if (strict.length === 0 && data.length === 0) {
        return ViewStateHelpers.loading();
      }
    }

    const strict = this.strictFilteredData();

    // If strictly filtered data is empty
    if (strict.length === 0) {
      return ViewStateHelpers.empty();
    }

    const lang = this.prefs.language(); // React to language change

    // Build the view model
    return ViewStateHelpers.content(this.buildViewModel());
  });

  /**
   * Triggers a re-subscribe to getMaster() (retry on error).
   * Note: Since we're using toSignal with a shareReplay observable,
   * this mainly resets the error state for demonstration.
   */
  public loadData(): void {
    this.errorState.set({ hasError: false, message: '' });
    // The toSignal already handles the subscription
    // If there was an error, clearing it allows the UI to try again
  }

  /**
   * Build the OverviewViewModel using isolated data scopes.
   */
  private buildViewModel(): OverviewViewModel {
    const strictData = this.strictFilteredData();
    const regionData = this.regionIsolatedData();
    const genderData = this.genderIsolatedData();
    const baselineData = this.primaryBaselineData();
    const allData = this.allData();

    if (!allData) {
      throw new Error('Expected allData to be defined');
    }

    const total = sumMetric(strictData, 'studentCount');
    const { maleCount, femaleCount } = splitByGender(genderData);
    const genderTotal = sumMetric(genderData, 'studentCount');
    const leaderboard = buildLeaderboardRows(regionData, 7);
    const unfilteredLeaderboard = buildLeaderboardRows(regionData, 1);
    const parityIndex = computeParityIndex(maleCount, femaleCount);
    const yoy = this.yoySeries();

    // Insights must use explicitly unfiltered point-in-time data to avoid mathematically invalid historical sums
    const insights = buildInsightItems(
      this.unfilteredLatestYearData(),
      this.unfilteredYoySeries(),
      allData,
      (key: string) => this.translocoService.translate(getTranslationKey(key)),
    );

    // Get year range for sub-label
    const years = allData.map((r) => r.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Build KPI grid
    const kpis: KpiGridViewModel = {
      totalStudents: this.buildTotalStudentsKpi(total, minYear, maxYear),
      growthRate: this.buildGrowthRateKpi(strictData, baselineData),
      genderDistribution: this.buildGenderKpi(maleCount, femaleCount, genderTotal),
      largestRegion: this.buildLargestRegionKpi(unfilteredLeaderboard),
    };

    return {
      kpis,
      yoySeries: yoy,
      leaderboard,
      parityIndex,
      insights,
    };
  }

  private buildTotalStudentsKpi(total: number, minYear: number, maxYear: number): KpiCardViewModel {
    const filters = this.filterState();
    const trans = (key: string) => this.translocoService.translate(key);

    // 1. Year Scope
    const yearPart = filters.year ? `${filters.year}` : `${minYear} – ${maxYear}`;

    // 2. Filter Scope (Region, Stage, Gender)
    const contextParts: string[] = [];

    if (filters.region) {
      contextParts.push(trans(getTranslationKey(filters.region)));
    }
    if (filters.stage) {
      contextParts.push(trans(getTranslationKey(filters.stage)));
    }
    if (filters.gender) {
      contextParts.push(trans(getTranslationKey(filters.gender)));
    }

    const contextPart = contextParts.length > 0 ? contextParts.join(' | ') : trans('filter.all');

    return {
      labelKey: 'overview.kpi.total-students',
      value: formatCompactNumber(total),
      sublabelKey: 'overview.kpi.total-students-sub',
      sublabelParams: { scope: `${yearPart} | ${contextPart}` },
      iconName: 'graduation-cap',
    };
  }

  private buildGrowthRateKpi(
    strictData: EducationMasterData[],
    baselineData: EducationMasterData[],
  ): KpiCardViewModel {
    const growthRate = computeGrowthRate(strictData, baselineData);

    if (growthRate === null) {
      return {
        labelKey: 'overview.kpi.growth-rate',
        value: 'N/A',
        sublabelKey: 'overview.kpi.growth-rate-sub',
        sublabelParams: { baseYear: DATASET_BASELINE_YEAR },
        iconName: 'trending-up',
      };
    }

    const trend = growthRate >= 0 ? 'up' : 'down';
    return {
      labelKey: 'overview.kpi.growth-rate',
      value: formatPercent(growthRate),
      sublabelKey: 'overview.kpi.growth-rate-sub',
      sublabelParams: { baseYear: DATASET_BASELINE_YEAR },
      trend,
      iconName: 'trending-up',
    };
  }

  private buildGenderKpi(
    maleCount: number,
    femaleCount: number,
    total: number,
  ): GenderKpiViewModel {
    const malePercent = total > 0 ? (maleCount / total) * 100 : 0;
    const femalePercent = total > 0 ? (femaleCount / total) * 100 : 0;

    const male: GenderSplitItem = {
      labelKey: 'overview.kpi.male-students',
      count: formatCompactNumber(maleCount),
      percent: malePercent.toFixed(1) + '%',
      iconName: 'user',
    };

    const female: GenderSplitItem = {
      labelKey: 'overview.kpi.female-students',
      count: formatCompactNumber(femaleCount),
      percent: femalePercent.toFixed(1) + '%',
      iconName: 'user',
    };

    return {
      labelKey: 'overview.kpi.gender-distribution',
      male,
      female,
    };
  }

  private buildLargestRegionKpi(
    leaderboard: ReturnType<typeof buildLeaderboardRows>,
  ): KpiCardViewModel {
    if (leaderboard.length === 0) {
      return {
        labelKey: 'overview.kpi.largest-region',
        value: '-',
      };
    }

    const top = leaderboard[0];
    return {
      labelKey: 'overview.kpi.largest-region',
      valueKey: getTranslationKey(top.region),
      sublabelKey: 'overview.kpi.largest-region-sub',
      sublabelParams: { count: formatCompactNumber(top.studentCount) },
      customSvgUrl: 'images/map.svg',
      actionUrl: '/regional-analysis',
    };
  }
}
