import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule, Maximize2, Minimize2 } from 'lucide-angular';
import { PlatformService } from '../../../core/services/platform.service';

@Component({
  selector: 'app-chart-fullscreen-wrapper',
  imports: [TranslocoPipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #wrapperEl
      class="ds-chart-fullscreen-wrapper"
      [class.ds-chart-fullscreen-active]="isFullscreen()"
    >
      <ng-content />

      <button
        type="button"
        class="ds-chart-fullscreen-btn"
        (click)="toggle()"
        [attr.aria-label]="
          (isFullscreen() ? 'shared.exit-fullscreen' : 'shared.enter-fullscreen') | transloco
        "
      >
        <lucide-icon [img]="isFullscreen() ? Minimize2Icon : Maximize2Icon" size="18" />
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class ChartFullscreenWrapperComponent implements OnInit, OnDestroy {
  public isFullscreen = signal(false);

  protected readonly Maximize2Icon = Maximize2;
  protected readonly Minimize2Icon = Minimize2;

  private readonly wrapperEl = viewChild.required<ElementRef<HTMLDivElement>>('wrapperEl');
  private readonly platform = inject(PlatformService);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  private unlistenFullscreenChange?: () => void;

  ngOnInit(): void {
    if (this.platform.isBrowser()) {
      this.unlistenFullscreenChange = this.renderer.listen(
        this.document,
        'fullscreenchange',
        () => {
          this.isFullscreen.set(!!this.document.fullscreenElement);
          if (!this.isFullscreen()) {
            this.unlockLandscape();
          }
          this.triggerResize();
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.platform.isBrowser()) {
      if (this.unlistenFullscreenChange) {
        this.unlistenFullscreenChange();
      }
      if (this.isFullscreen()) {
        try {
          this.document.exitFullscreen();
        } catch (e) {
          // ignore error if unable to exit in destroy phase
        }
        this.unlockLandscape();
      }
    }
  }

  public toggle(): void {
    if (!this.platform.isBrowser()) {
      return;
    }

    if (this.isFullscreen()) {
      this.document.exitFullscreen().catch(() => {});
    } else {
      const el = this.wrapperEl().nativeElement;
      el.requestFullscreen()
        .then(() => {
          this.lockLandscape();
        })
        .catch(() => {});
    }
  }

  private lockLandscape(): void {
    const screenObj = (this.document.defaultView as any)?.screen;
    if (screenObj?.orientation?.lock) {
      screenObj.orientation.lock('landscape').catch(() => {
        // Silently ignore if not supported or not allowed (e.g., iOS Safari)
      });
    }
  }

  private unlockLandscape(): void {
    const screenObj = (this.document.defaultView as any)?.screen;
    if (screenObj?.orientation?.unlock) {
      try {
        screenObj.orientation.unlock();
      } catch {
        // Silently ignore
      }
    }
  }

  private triggerResize(): void {
    setTimeout(() => {
      this.document.defaultView?.dispatchEvent(new Event('resize'));
    }, 100);
  }
}
