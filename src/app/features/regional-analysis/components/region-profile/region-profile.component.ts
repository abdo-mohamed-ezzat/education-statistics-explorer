import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RegionProfile } from '../../data/regional.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-region-profile',
  imports: [TranslocoPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './region-profile.component.html',
})
export class RegionProfileComponent {
  profile = input.required<RegionProfile>();
}
