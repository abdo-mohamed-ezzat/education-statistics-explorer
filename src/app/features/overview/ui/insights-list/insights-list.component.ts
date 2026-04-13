import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PlatformService } from '../../../../core/services/platform.service';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { InsightItem } from '../../models/overview.model';

@Component({
  selector: 'app-insights-list',
  imports: [TranslocoPipe, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insights-list.component.html',
})
export class InsightsListComponent {
  private readonly platform = inject(PlatformService);
  protected readonly isBrowser = this.platform.isBrowser;

  insights = input.required<InsightItem[]>();
}
