import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../../services/preferences.service';
import { GlobalFilterService } from '../../services/global-filter.service';
import { TopbarComponent } from '../topbar/topbar.component';
import { NavComponent } from '../nav/nav.component';
import { FloatingSettingsComponent } from '../../../shared/ui/floating-settings/floating-settings.component';
import { ROUTE_FILTER_CONFIG, DEFAULT_ROUTE_FILTER_CONFIG } from './route-filter-config';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopbarComponent, NavComponent, FloatingSettingsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full h-[100dvh] overflow-hidden bg-page text-main flex flex-col',
  },
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  public readonly prefService = inject(PreferencesService);
  public readonly filterService = inject(GlobalFilterService);
  private readonly router = inject(Router);

  constructor() {
    // Monitor router events to figure out which dimensions to show
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event: NavigationEnd) => {
        // Simple extraction of the first path segment
        const pathSegments = event.urlAfterRedirects.split('/').filter((s) => s.length > 0);
        const featurePath = pathSegments.length > 0 ? pathSegments[0] : '';

        const config = ROUTE_FILTER_CONFIG[featurePath] || DEFAULT_ROUTE_FILTER_CONFIG;
        this.filterService.setActiveConfig({ allowedDimensions: config });
      });
  }

  public toggleLanguage(): void {
    const nextLang = this.prefService.language() === 'ar' ? 'en' : 'ar';
    this.prefService.setLanguage(nextLang);
  }
}
