import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule, FolderOpen } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  imports: [TranslocoModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px] text-center gap-4 bg-surface rounded-xl'
  },
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  public readonly EmptyIcon = FolderOpen;
  
  public title = input<string>();
  public message = input<string>();
}
