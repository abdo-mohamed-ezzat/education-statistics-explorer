import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FilterConfig, FilterDimension, GlobalFilterState } from '../../models/global-filter.model';
import { LucideAngularModule, FilterX } from 'lucide-angular';
import { FilterSelectComponent, FilterSelectOption } from '../filter-select/filter-select.component';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslocoModule, LucideAngularModule, FilterSelectComponent],
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

  public readonly yearOptions = computed<FilterSelectOption[]>(() => {
    return [
      { value: null, labelKey: 'filter.all' },
      ...this.availableYears().map(y => ({ value: y, label: y.toString() }))
    ];
  });

  public readonly regionOptions = computed<FilterSelectOption[]>(() => {
    return [
      { value: null, labelKey: 'filter.all' },
      ...this.availableRegions().map(r => ({ value: r, label: r }))
    ];
  });

  public readonly stageOptions = computed<FilterSelectOption[]>(() => {
    return [
      { value: null, labelKey: 'filter.all' },
      ...this.availableStages().map(s => ({ value: s, label: s }))
    ];
  });

  public readonly genderOptions = computed<FilterSelectOption[]>(() => {
    return [
      { value: null, labelKey: 'filter.all' },
      ...this.availableGenders().map(g => ({ value: g, label: g }))
    ];
  });

  public filterChange = output<{ dimension: FilterDimension; value: string | number | null }>();
  public resetFilters = output<void>();

  public readonly ResetIcon = FilterX;

  public hasDimension(dim: FilterDimension): boolean {
    return this.activeConfig().allowedDimensions.includes(dim);
  }

  public onChangeFilter(dimension: FilterDimension, value: string | number | null): void {
    let finalValue = value;
    if (dimension === 'year' && value !== null) {
      finalValue = Number(value);
    }
    this.filterChange.emit({ dimension, value: finalValue });
  }

  public onReset(): void {
    this.resetFilters.emit();
  }

  public isDefaultState(): boolean {
    const s = this.state();
    return s.year === null && s.region === null && s.stage === null && s.gender === null;
  }
}
