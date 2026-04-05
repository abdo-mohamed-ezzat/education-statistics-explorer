import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EducationDataService } from '../../../core/services/education-data.service';
import { GlobalFilterService } from '../../../core/services/global-filter.service';
import { EducationMasterData } from '../../../core/models/education-data.model';
import { ViewState, ViewStateHelpers } from '../../../shared/models/view-state.model';
import { TrendsViewModel } from './trends.model';
import {
  aggregateTotalByYear,
  aggregateByStage,
  aggregateByRegion,
  computeTeacherStudentRatio,
  aggregateInfrastructure,
} from './trends.utils';

@Injectable({
  providedIn: 'root'
})
export class TrendsFacade {
  private readonly dataService = inject(EducationDataService);
  private readonly filterService = inject(GlobalFilterService);

  private readonly errorState = signal<{ hasError: boolean; message: string }>({
    hasError: false,
    message: '',
  });

  private readonly rawData = toSignal(this.dataService.getMaster(), {
    initialValue: [] as EducationMasterData[],
  });

  private readonly filterState = computed(() => this.filterService.state());

  private filterDataScope(
    data: EducationMasterData[],
    filters: Partial<ReturnType<typeof this.filterService.state>>
  ): EducationMasterData[] {
    return data.filter((row) => {
      if (filters.region !== undefined && filters.region !== null && row.region !== filters.region) return false;
      if (filters.stage !== undefined && filters.stage !== null && row.stage !== filters.stage) return false;
      if (filters.gender !== undefined && filters.gender !== null && row.gender !== filters.gender) return false;
      return true;
    });
  }

  // 1. timeSeriesData: Applies Region, Stage, Gender. IGNORES Year.
  private readonly timeSeriesFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return this.filterDataScope(data, {
      region: state.region,
      stage: state.stage,
      gender: state.gender,
    });
  });

  // 2. stageTrendData: Applies Region, Gender. IGNORES Year and Stage.
  private readonly stageTrendFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return this.filterDataScope(data, {
      region: state.region,
      stage: null, // Ignore stage completely
      gender: state.gender,
    });
  });

  // 3. regionTrendData: Applies Stage, Gender. IGNORES Year and Region.
  private readonly regionTrendFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return this.filterDataScope(data, {
      region: null, // Ignore region completely
      stage: state.stage,
      gender: state.gender,
    });
  });

  public readonly viewState = computed<ViewState<TrendsViewModel>>(() => {
    if (this.errorState().hasError) {
      return ViewStateHelpers.error(this.errorState().message);
    }

    const data = this.rawData();
    if (!data || data.length === 0) {
      return ViewStateHelpers.loading();
    }

    const timeSeriesDataRows = this.timeSeriesFiltered();
    
    // If our base filter results in no data, show empty state
    if (timeSeriesDataRows.length === 0) {
      return ViewStateHelpers.empty();
    }

    return ViewStateHelpers.content({
      timeSeriesData: aggregateTotalByYear(timeSeriesDataRows),
      stageTrendData: aggregateByStage(this.stageTrendFiltered()),
      regionTrendData: aggregateByRegion(this.regionTrendFiltered()),
      teacherRatioData: computeTeacherStudentRatio(timeSeriesDataRows),
      infrastructureData: aggregateInfrastructure(timeSeriesDataRows),
    });
  });

  public loadData(): void {
    this.errorState.set({ hasError: false, message: '' });
  }
}
