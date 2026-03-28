import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px] text-muted gap-4 bg-surface rounded-xl'
  },
  template: `
    <lucide-icon [img]="LoaderIcon" class="animate-spin text-primary" size="32"></lucide-icon>
    <p class="ds-body-md m-0">{{ 'state.loading' | transloco }}</p>
  `,
})
export class LoadingStateComponent {
  public readonly LoaderIcon = Loader2;
}
