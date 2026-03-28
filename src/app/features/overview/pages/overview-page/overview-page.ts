import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { EducationDataService } from '../../../../core/services/education-data.service';
import { GlobalFilterService } from '../../../../core/services/global-filter.service';
import { ViewState, ViewStateHelpers } from '../../../../shared/models/view-state.model';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [LoadingStateComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-page.html',
})
export class OverviewPage implements OnInit {
  private readonly dataService = inject(EducationDataService);
  private readonly filterService = inject(GlobalFilterService);

  public readonly viewState = signal<ViewState<any[]>>(ViewStateHelpers.loading());

  // We derive the filtered dataset synchronously from the loaded state and the filter state
  public readonly filteredData = computed(() => {
    const currentState = this.viewState();
    if (currentState.status !== 'content') {
      return [];
    }

    const filters = this.filterService.state();
    const data = currentState.data;

    return data.filter((row) => {
      let matches = true;
      if (filters.year !== null && row.year !== filters.year) matches = false;
      if (filters.region !== null && row.region !== filters.region) matches = false;
      if (filters.stage !== null && row.stage !== filters.stage) matches = false;
      if (filters.gender !== null && row.gender !== filters.gender) matches = false;
      return matches;
    });
  });

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.viewState.set(ViewStateHelpers.loading());

    this.dataService.getMaster().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.viewState.set(ViewStateHelpers.empty());
        } else {
          this.viewState.set(ViewStateHelpers.content(data));
        }
      },
      error: (err) => {
        this.viewState.set(ViewStateHelpers.error(err));
      },
    });
  }

  // Template helpers to narrow types since Angular templates sometimes struggle with complex discriminated unions
  public asError(state: ViewState<any[]>): { status: 'error'; error: Error | string } {
    return state as any;
  }

  public asContent(state: ViewState<any[]>): { status: 'content'; data: any[] } {
    return state as any;
  }
}
