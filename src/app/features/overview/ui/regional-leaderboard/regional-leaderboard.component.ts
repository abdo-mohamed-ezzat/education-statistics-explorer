import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LeaderboardRow } from '../../models/overview.model';

@Component({
  selector: 'app-regional-leaderboard',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regional-leaderboard.component.html',
})
export class RegionalLeaderboardComponent {
  rows = input.required<LeaderboardRow[]>();
}
