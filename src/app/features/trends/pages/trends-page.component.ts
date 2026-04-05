import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TrendsFacade } from '../data/trends.facade';
import { PreferencesService } from '../../../core/services/preferences.service';
import { ViewState } from '../../../shared/models/view-state.model';
import { TrendsViewModel } from '../data/trends.model';

import { LoadingStateComponent } from '../../../shared/ui/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

import { TotalGrowthChartComponent } from '../components/total-growth-chart/total-growth-chart.component';
import { InfrastructureTrendChartComponent } from '../components/infrastructure-trend-chart/infrastructure-trend-chart.component';
import { MultiLineTrendChartComponent } from '../components/multi-line-trend-chart/multi-line-trend-chart.component';
import { TeacherRatioChartComponent } from '../components/teacher-ratio-chart/teacher-ratio-chart.component';

@Component({
  selector: 'app-trends-page',
  imports: [
    TranslocoPipe,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    TotalGrowthChartComponent,
    InfrastructureTrendChartComponent,
    MultiLineTrendChartComponent,
    TeacherRatioChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trends-page.component.html',
})
export class TrendsPageComponent {
  private readonly facade = inject(TrendsFacade);
  private readonly prefsService = inject(PreferencesService);

  protected readonly viewState = this.facade.viewState;
  protected readonly theme = this.prefsService.theme;

  protected loadData(): void {
    this.facade.loadData();
  }

  protected asError(state: ViewState<TrendsViewModel>): { status: 'error'; error: Error | string } {
    return state as { status: 'error'; error: Error | string };
  }

  protected asContent(state: ViewState<TrendsViewModel>): { status: 'content'; data: TrendsViewModel } {
    return state as { status: 'content'; data: TrendsViewModel };
  }
}
