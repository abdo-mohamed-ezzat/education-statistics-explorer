import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  signal,
  afterNextRender,
  inject,
  DestroyRef
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';
import { TranslocoPipe } from '@jsverse/transloco';

export interface FilterSelectOption {
  value: string | number | null;
  label?: string;
  labelKey?: string;
}

@Component({
  selector: 'app-filter-select',
  imports: [LucideAngularModule, TranslocoPipe, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-select.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(window:resize)': 'onResize()'
  }
})
export class FilterSelectComponent {
  public label = input.required<string>();
  public options = input.required<FilterSelectOption[]>();
  public value = model<string | number | null>(null);

  public isOpen = signal(false);
  public dropdownStyle = signal<{ [key: string]: string }>({});

  protected readonly ChevronIcon = ChevronDown;
  protected readonly CheckIcon = Check;

  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  protected readonly selectedOption = computed(() => {
    return this.options().find(opt => opt.value === this.value()) || null;
  });

  private scrollListener = (event: Event) => {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  };

  constructor() {
    afterNextRender(() => {
      window.addEventListener('scroll', this.scrollListener, true);
      
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', this.scrollListener, true);
      });
    });
  }

  public toggleOpen(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      this.updatePosition();
      this.isOpen.set(true);
    }
  }

  private updatePosition(): void {
    if (typeof window === 'undefined') return;
    
    const triggerEl = this.elementRef.nativeElement.querySelector('.ds-filter-group');
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const isRtl = getComputedStyle(triggerEl).direction === 'rtl';

    this.dropdownStyle.set({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: isRtl ? 'auto' : `${rect.left}px`,
      right: isRtl ? `${window.innerWidth - rect.right}px` : 'auto',
      minWidth: `${Math.max(rect.width, 150)}px`
    });
  }

  public selectOption(option: FilterSelectOption, event: Event): void {
    event.stopPropagation();
    this.value.set(option.value);
    this.isOpen.set(false);
  }

  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  public onResize(): void {
    if (this.isOpen()) {
      this.updatePosition();
    }
  }
}
