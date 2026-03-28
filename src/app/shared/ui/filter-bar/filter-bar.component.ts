import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FilterConfig, FilterDimension, GlobalFilterState } from '../../models/global-filter.model';
import { LucideAngularModule, FilterX } from 'lucide-angular';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block px-2',
  },
  templateUrl: './filter-bar.component.html',
})
export class FilterBarComponent {
  public activeConfig = input.required<FilterConfig>();
  public state = input.required<GlobalFilterState>();

  public availableYears = input<number[]>([]);
  public availableRegions = input<string[]>([]);
  public availableStages = input<string[]>([]);
  public availableGenders = input<string[]>([]);

  public filterChange = output<{ dimension: FilterDimension; value: string | number | null }>();
  public resetFilters = output<void>();

  public readonly ResetIcon = FilterX;

  public hasDimension(dim: FilterDimension): boolean {
    return this.activeConfig().allowedDimensions.includes(dim);
  }

  public onChange(dimension: FilterDimension, event: Event): void {
    const target = event.target as HTMLSelectElement;
    let value: string | number | null = target.value;

    if (value === 'null') {
      value = null;
    } else if (dimension === 'year') {
      value = Number(value);
    }

    this.filterChange.emit({ dimension, value });
  }

  public onReset(): void {
    this.resetFilters.emit();
  }

  public isDefaultState(): boolean {
    const s = this.state();
    return s.year === null && s.region === null && s.stage === null && s.gender === null;
  }
}
