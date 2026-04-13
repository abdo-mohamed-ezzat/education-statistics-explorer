import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, AlertCircle, RefreshCcw } from 'lucide-angular';

@Component({
  selector: 'app-error-state',
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px] text-center gap-4 bg-surface rounded-xl border border-red-500/10'
  },
  templateUrl: './error-state.component.html',
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
