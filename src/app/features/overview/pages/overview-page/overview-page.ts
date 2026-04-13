import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OverviewFacade } from '../../data-access/overview.facade';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { ViewState } from '../../../../shared/models/view-state.model';
import { OverviewViewModel } from '../../models/overview.model';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { KpiCardComponent } from '../../ui/kpi-card/kpi-card.component';
import { GenderKpiCardComponent } from '../../ui/kpi-card/gender-kpi-card.component';
import { YoyBarChartComponent } from '../../ui/yoy-bar-chart/yoy-bar-chart.component';
import { RegionalLeaderboardComponent } from '../../ui/regional-leaderboard/regional-leaderboard.component';
import { ParityGaugeComponent } from '../../ui/parity-gauge/parity-gauge.component';

import { InsightsListComponent } from '../../ui/insights-list/insights-list.component';

@Component({
  selector: 'app-overview-page',
  imports: [
    TranslocoPipe,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    KpiCardComponent,
    GenderKpiCardComponent,
    YoyBarChartComponent,
    RegionalLeaderboardComponent,
    ParityGaugeComponent,
    InsightsListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-page.html',
})
export class OverviewPage {
  private readonly facade = inject(OverviewFacade);
  private readonly prefsService = inject(PreferencesService);

  protected readonly viewState = this.facade.viewState;
  protected readonly theme = this.prefsService.theme;

  protected loadData(): void {
    this.facade.loadData();
  }

  // Template helper to narrow type for error state
  protected asError(state: ViewState<OverviewViewModel>): { status: 'error'; error: Error | string } {
    return state as { status: 'error'; error: Error | string };
  }

  // Template helper to narrow type for content state
  protected asContent(state: ViewState<OverviewViewModel>): { status: 'content'; data: OverviewViewModel } {
    return state as { status: 'content'; data: OverviewViewModel };
  }
}
