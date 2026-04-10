import { Injectable, computed, inject, signal } from '@angular/core';
import { EducationDataService } from '../../../core/services/education-data.service';
import { GlobalFilterService } from '../../../core/services/global-filter.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { EMPTY, combineLatest, pipe } from 'rxjs';
import { EducationRecordData } from '../../../core/models/education-data.model';
import {
  aggregateBarChartData,
  aggregateMapData,
  computeRegionProfile,
  DEFAULT_YEAR,
  normalizeGeoJsonToArabic,
  toScatterData,
} from './regional.utils';
import * as echarts from 'echarts';
import { applyDataFilters } from '../../../shared/utils/data-filters.util';

@Injectable({
  providedIn: 'root',
})
export class RegionalFacade {
  private readonly dataService = inject(EducationDataService);
  private readonly filterService = inject(GlobalFilterService);

  // ── Raw state ──────────────────────────────────────────────────────
  private readonly records = signal<EducationRecordData[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Local interaction state ────────────────────────────────────────
  private readonly _selectedRegion = signal<string | null>(null);

  public readonly state = {
    loading: computed(() => this._loading()),
    error: computed(() => this._error()),
    hasData: computed(() => this.records().length > 0),
  };

  /**
   * nationalData ignores the region filter intentionally so the map
   * always shows every region. It only applies Year & Stage.
   *
   * **Default Year Rule:** when the global Year filter is null ("All"),
   * the dashboard defaults to year 2024 (latest dataset year).
   */
  public readonly nationalData = computed(() => {
    const raw = this.records();
    const filters = this.filterService.state();
    const effectiveYear = filters.year ?? DEFAULT_YEAR;

    return applyDataFilters(raw, {
      ...filters,
      year: effectiveYear,
    });
  });

  public readonly mapData = computed(() => aggregateMapData(this.nationalData()));

  public readonly scatterData = computed(() => toScatterData(this.mapData()));

  public readonly barData = computed(() => aggregateBarChartData(this.nationalData()));

  public readonly selectedRegion = computed(() => {
    const currentSelection = this._selectedRegion();
    if (currentSelection) return currentSelection;

    // Auto-select the region with the highest student count
    const bar = this.barData();
    return bar.length > 0 ? bar[0].regionName : null;
  });

  public readonly profileData = computed(() => {
    const region = this.selectedRegion();
    if (!region) return null;
    const filters = this.filterService.state();
    return computeRegionProfile(this.nationalData(), this.records(), region, filters.stage);
  });

  constructor() {
    this.loadData();
  }

  public setSelectedRegion(region: string): void {
    this._selectedRegion.set(region);
  }

  public readonly loadData = rxMethod<void>(
    pipe(
      tap(() => {
        this._loading.set(true);
        this._error.set(null);
      }),
      switchMap(() =>
        combineLatest([this.dataService.getRecords(), this.dataService.getSaudiGeoJson()]).pipe(
          tap(([records, geoJson]) => {
            // Normalize feature names to Arabic for data matching
            const normalized = normalizeGeoJsonToArabic(geoJson);
            echarts.registerMap('SAUDI_ARABIA', normalized as never);

            this.records.set(records);
            this._loading.set(false);
          }),
          catchError((err: Error) => {
            console.error('Failed to load regional data', err);
            this._error.set(err.message);
            this._loading.set(false);
            return EMPTY;
          }),
        ),
      ),
    ),
  );
}
