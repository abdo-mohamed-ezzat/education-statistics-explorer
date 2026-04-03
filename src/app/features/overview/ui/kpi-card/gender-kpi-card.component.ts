import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule, User } from 'lucide-angular';
import { GenderKpiViewModel } from '../../models/overview.model';

@Component({
  selector: 'app-gender-kpi-card',
  imports: [TranslocoPipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gender-kpi-card.component.html',
})
export class GenderKpiCardComponent {
  vm = input.required<GenderKpiViewModel>();

  // Icon reference for template
  protected readonly User = User;
}
