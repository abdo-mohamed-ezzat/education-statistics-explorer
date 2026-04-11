import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LeaderboardRow } from '../../models/overview.model';
import { getTranslationKey } from '../../../../shared/utils/data-translation.util';

@Component({
  selector: 'app-regional-leaderboard',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regional-leaderboard.component.html',
})
export class RegionalLeaderboardComponent {
  rows = input.required<LeaderboardRow[]>();

  getTranslationKey(region: string): string {
    return getTranslationKey(region);
  }
}
