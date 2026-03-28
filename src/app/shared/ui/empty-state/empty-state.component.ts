import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, FolderOpen } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px] text-center gap-4 bg-surface rounded-xl'
  },
  template: `
    <div class="p-4 bg-surface-low rounded-full">
      <lucide-icon [img]="EmptyIcon" class="text-muted" size="40" strokeWidth="1.5"></lucide-icon>
    </div>
    
    <div class="max-w-md">
      <h3 class="ds-title-sm text-main mb-2 tracking-tight">
        @if (title()) {
          {{ title() }}
        } @else {
          {{ 'state.empty' | transloco }}
        }
      </h3>
      
      <p class="ds-body-md text-soft m-0">
        @if (message()) {
          {{ message() }}
        } @else {
          {{ 'state.empty-detail' | transloco }}
        }
      </p>
    </div>
  `,
})
export class EmptyStateComponent {
  public readonly EmptyIcon = FolderOpen;
  
  public title = input<string>();
  public message = input<string>();
}
