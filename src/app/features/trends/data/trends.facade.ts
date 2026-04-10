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
import { applyDataFilters } from '../../../shared/utils/data-filters.util';

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


  private readonly timeSeriesFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return applyDataFilters(data, {
      region: state.region,
      stage: state.stage,
      gender: state.gender,
    });
  });

  private readonly stageTrendFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return applyDataFilters(data, {
      region: state.region,
      stage: null, // Ignore stage completely
      gender: state.gender,
    });
  });

  private readonly regionTrendFiltered = computed(() => {
    const data = this.rawData();
    const state = this.filterState();
    return applyDataFilters(data, {
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
