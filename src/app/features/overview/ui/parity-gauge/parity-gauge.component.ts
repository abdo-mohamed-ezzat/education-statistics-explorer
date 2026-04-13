import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LucideAngularModule, User } from 'lucide-angular';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import { getChartThemeColors } from '../../../../shared/utils/formatters.util';
import type { EChartsOption } from 'echarts';
import { ParityIndexViewModel } from '../../models/overview.model';
import { GPI_THRESHOLD_MALE, GPI_THRESHOLD_FEMALE } from '../../../../core/models/education-data.model';

@Component({
  selector: 'app-parity-gauge',
  imports: [TranslocoPipe, LucideAngularModule, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parity-gauge.component.html',
})
export class ParityGaugeComponent {
  vm = input.required<ParityIndexViewModel>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly isBrowser = this.platform.isBrowser;

  // Icon reference for template
  protected readonly User = User;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.vm();
    const currentTheme = this.theme();
    const gpiValue = data.ratio;
    const themeColors = getChartThemeColors(currentTheme);

    // Range definitions
    const maleRangeMax = GPI_THRESHOLD_MALE;
    const nearParityRangeMax = GPI_THRESHOLD_FEMALE;

    // Colors - Named for the Gauge
    const colorMale = '#6CC2BD';       // Teal
    const colorNearParity = '#5F5B68'; // Grey
    const colorFemale = '#B17D23';     // Bronze

    // Determine dynamic label and color
    let dynamicLabel = '';
    let labelColor = themeColors.axisLabel;
    
    if (gpiValue < maleRangeMax) {
      dynamicLabel = this.translocoService.translate('overview.analytics.parity-male');
      labelColor = colorMale;
    } else if (gpiValue >= maleRangeMax && gpiValue <= nearParityRangeMax) {
      dynamicLabel = this.translocoService.translate('overview.analytics.parity-near');
      labelColor = colorNearParity;
    } else {
      dynamicLabel = this.translocoService.translate('overview.analytics.parity-female');
      labelColor = colorFemale;
    }

    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 2,
          splitNumber: 4,
          radius: '90%',
          center: ['50%', '65%'],
          itemStyle: {
            color: 'auto' // Inherit from the sector it lands in
          },
          progress: {
            show: false,
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '30%',
            width: 8,
            offsetCenter: [0, '-50%'], // Base of pointer is closer to the center arc
            itemStyle: {
              color: 'auto'
            }
          },
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [0.475, colorMale],       // 0 to 0.95 (0.95 / 2 = 0.475)
                [0.525, colorNearParity], // 0.95 to 1.05 (1.05 / 2 = 0.525)
                [1, colorFemale]          // 1.05 to 2.0 (2 / 2 = 1.0)
              ]
            }
          },
          axisTick: {
            length: 8,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 15,
            lineStyle: {
              color: 'auto',
              width: 3
            }
          },
          axisLabel: {
            color: themeColors.axisLabel,
            distance: 25,
            fontSize: 12
          },
          title: {
            offsetCenter: [0, '25%'],
            fontSize: 14,
            fontWeight: 500,
            color: labelColor
          },
          detail: {
            fontSize: 34,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: (value: number) => value.toFixed(2),
            color: themeColors.tooltipText,
            fontWeight: 'bold'
          },
          data: [
            {
              value: gpiValue,
              name: dynamicLabel
            }
          ]
        }
      ]
    };
  });

}

