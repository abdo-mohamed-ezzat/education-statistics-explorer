import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, AlertCircle, RefreshCcw } from 'lucide-angular';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px] text-center gap-4 bg-surface rounded-xl border border-red-500/10'
  },
  template: `
    <div class="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
      <lucide-icon [img]="ErrorIcon" size="40" strokeWidth="1.5"></lucide-icon>
    </div>
    
    <div class="max-w-md">
      <h3 class="ds-title-sm text-main mb-2 tracking-tight">
        @if (title()) {
          {{ title() }}
        } @else {
          {{ 'state.error' | transloco }}
        }
      </h3>
      
      <p class="ds-body-md text-soft m-0 mb-6 font-mono text-sm max-h-32 overflow-y-auto">
        @if (error()) {
          {{ formatError(error()) }}
        } @else {
          {{ 'state.error-detail' | transloco }}
        }
      </p>

      <button 
        class="ds-btn ds-btn-outline inline-flex gap-2 items-center" 
        (click)="retry.emit()"
        [attr.aria-label]="'state.retry' | transloco"
      >
        <lucide-icon [img]="RetryIcon" size="16"></lucide-icon>
        {{ 'state.retry' | transloco }}
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  public readonly ErrorIcon = AlertCircle;
  public readonly RetryIcon = RefreshCcw;
  
  public title = input<string>();
  public error = input<unknown>();
  
  public retry = output<void>();

  // Simple formatter to display raw errors gracefully
  public formatError(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
}
