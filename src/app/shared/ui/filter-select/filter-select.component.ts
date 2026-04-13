import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, input, output, signal } from '@angular/core';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';
import { TranslocoPipe } from '@jsverse/transloco';

export interface FilterSelectOption {
  value: string | number | null;
  label?: string;
  labelKey?: string;
}

@Component({
  selector: 'app-filter-select',
  imports: [LucideAngularModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-select.component.html',
})
export class FilterSelectComponent {
  public label = input.required<string>();
  public options = input.required<FilterSelectOption[]>();
  public value = input<string | number | null>(null);

  public valueChange = output<string | number | null>();

  public isOpen = signal(false);

  protected readonly ChevronIcon = ChevronDown;
  protected readonly CheckIcon = Check;

  public getOptionLabel(option: FilterSelectOption | undefined): string {
    if (!option) return '';
    // Let the pipe handle translation in template for labelKey, here we just return it or raw label
    // Wait, we can't easily translate in TS without service. We will just pass the option to template.
    return ''; // not used directly anymore
  }

  protected readonly selectedOption = computed(() => {
    return this.options().find(opt => opt.value === this.value()) || null;
  });

  constructor(private elementRef: ElementRef) {}

  public toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  public selectOption(option: FilterSelectOption, event: Event): void {
    event.stopPropagation();
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
