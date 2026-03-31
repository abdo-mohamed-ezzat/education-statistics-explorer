import { Injectable, computed, signal, inject } from '@angular/core';
import { DEFAULT_FILTER_STATE, FilterConfig, FilterDimension, GlobalFilterState } from '../../shared/models/global-filter.model';
import { EducationDataService } from './education-data.service';
import { EducationMasterData } from '../models/education-data.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalFilterService {
  private readonly dataService = inject(EducationDataService);

  private readonly yearSignal = signal<number | null>(DEFAULT_FILTER_STATE.year);
  private readonly regionSignal = signal<string | null>(DEFAULT_FILTER_STATE.region);
  private readonly stageSignal = signal<string | null>(DEFAULT_FILTER_STATE.stage);
  private readonly genderSignal = signal<string | null>(DEFAULT_FILTER_STATE.gender);

  public readonly activeConfig = signal<FilterConfig>({ allowedDimensions: [] });

  public readonly state = computed<GlobalFilterState>(() => ({
    year: this.yearSignal(),
    region: this.regionSignal(),
    stage: this.stageSignal(),
    gender: this.genderSignal()
  }));

  public readonly availableYears = signal<number[]>([]);
  public readonly availableRegions = signal<string[]>([]);
  public readonly availableStages = signal<string[]>([]);
  public readonly availableGenders = signal<string[]>([]);

  constructor() {
    this.extractOptions();
  }

  public setFilter(dimension: FilterDimension, value: string | number | null): void {
    // Null indicates "All"
    switch (dimension) {
      case 'year':
        this.yearSignal.set(value !== null ? Number(value) : null);
        break;
      case 'region':
        this.regionSignal.set(value as string | null);
        break;
      case 'stage':
        this.stageSignal.set(value as string | null);
        break;
      case 'gender':
        this.genderSignal.set(value as string | null);
        break;
    }
  }

  public resetAll(): void {
    this.yearSignal.set(DEFAULT_FILTER_STATE.year);
    this.regionSignal.set(DEFAULT_FILTER_STATE.region);
    this.stageSignal.set(DEFAULT_FILTER_STATE.stage);
    this.genderSignal.set(DEFAULT_FILTER_STATE.gender);
  }

  public setActiveConfig(config: FilterConfig): void {
    this.activeConfig.set(config);
  }

  private extractOptions(): void {
    this.dataService.getMaster().subscribe({
      next: (data: EducationMasterData[]) => {
        if (!data || !Array.isArray(data)) return;

        const years = new Set<number>();
        const regions = new Set<string>();
        const stages = new Set<string>();
        const genders = new Set<string>();

        for (const row of data) {
          if (row.year) years.add(row.year);
          if (row.region) regions.add(row.region);
          if (row.stage) stages.add(row.stage);
          if (row.gender) genders.add(row.gender);
        }

        // Years descending
        this.availableYears.set(Array.from(years).sort((a, b) => b - a));
        
        // Strings sorted properly for Arabic
        const collator = new Intl.Collator('ar', { sensitivity: 'base' });
        this.availableRegions.set(Array.from(regions).sort(collator.compare));
        this.availableStages.set(Array.from(stages).sort(collator.compare));
        this.availableGenders.set(Array.from(genders).sort(collator.compare));
      },
      error: (e) => console.error('Failed to extract filter options', e)
    });
  }
}
