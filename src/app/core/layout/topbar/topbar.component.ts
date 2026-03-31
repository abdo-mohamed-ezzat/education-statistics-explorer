import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  effect,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, Leaf } from 'lucide-angular';
import { Language, Theme } from '../../models/user-preferences.model';
import { FilterBarComponent } from '../../../shared/ui/filter-bar/filter-bar.component';
import {
  FilterConfig,
  FilterDimension,
  GlobalFilterState,
} from '../../../shared/models/global-filter.model';

@Component({
  selector: 'app-topbar',
  imports: [TranslocoModule, LucideAngularModule, FilterBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  // Status signals
  public currentLang = input.required<Language>();
  public currentTheme = input.required<Theme>();

  // Filter integration
  public activeConfig = input.required<FilterConfig>();
  public state = input.required<GlobalFilterState>();
  public availableYears = input<number[]>([]);
  public availableRegions = input<string[]>([]);
  public availableStages = input<string[]>([]);
  public availableGenders = input<string[]>([]);

  public filterChange = output<{ dimension: FilterDimension; value: string | number | null }>();
  public resetFilters = output<void>();

  public readonly LogoIcon = Leaf;
}
