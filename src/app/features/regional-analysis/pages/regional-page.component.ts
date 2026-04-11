import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RegionalFacade } from '../data/regional.facade';
import { PreferencesService } from '../../../core/services/preferences.service';
import { SaudiMapComponent } from '../components/saudi-map/saudi-map.component';
import { RegionBarChartComponent } from '../components/region-bar-chart/region-bar-chart.component';
import { RegionProfileComponent } from '../components/region-profile/region-profile.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getTranslationKey } from '../../../shared/utils/data-translation.util';

@Component({
  selector: 'app-regional-page',
  imports: [
    SaudiMapComponent,
    RegionBarChartComponent,
    RegionProfileComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regional-page.component.html',
})
export class RegionalPageComponent {
  protected readonly facade = inject(RegionalFacade);
  private readonly preferencesService = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly currentTheme = this.preferencesService.theme;

  protected readonly translatedActiveRegion = computed(() => {
    const region = this.facade.selectedRegion();
    if (!region) return '';
    // Depend on language to trigger re-renders
    const lang = this.preferencesService.language();
    return this.translocoService.translate(getTranslationKey(region));
  });

  onRegionSelected(regionName: string): void {
    this.facade.setSelectedRegion(regionName);
  }
}
