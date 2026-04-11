import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, TrendingUp, TrendingDown, GraduationCap, MapPin } from 'lucide-angular';
import { KpiCardViewModel } from '../../models/overview.model';

@Component({
  selector: 'app-kpi-card',
  imports: [TranslocoPipe, LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  vm = input.required<KpiCardViewModel>();

  // Icon references for template
  protected readonly TrendingUp = TrendingUp;
  protected readonly TrendingDown = TrendingDown;
  protected readonly GraduationCap = GraduationCap;
  protected readonly MapPin = MapPin;

  protected getIcon(iconName: string | undefined): typeof TrendingUp | undefined {
    switch (iconName) {
      case 'graduation-cap':
        return GraduationCap;
      case 'map-pin':
        return MapPin;
      case 'trending-up':
        return TrendingUp;
      default:
        return undefined;
    }
  }
}
