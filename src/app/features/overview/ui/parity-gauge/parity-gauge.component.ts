import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideAngularModule, User } from 'lucide-angular';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import type { EChartsOption } from 'echarts';
import { ParityIndexViewModel } from '../../models/overview.model';

@Component({
  selector: 'app-parity-gauge',
  imports: [TranslocoPipe, LucideAngularModule, NgxEchartsDirective, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parity-gauge.component.html',
})
export class ParityGaugeComponent {
  vm = input.required<ParityIndexViewModel>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  protected readonly isBrowser = this.platform.isBrowser;

  // Icon reference for template
  protected readonly User = User;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.vm();
    const currentTheme = this.theme();
    const gpiValue = data.ratio;
    const labelTranslation = data.labelKey; // The transloco key
    // We can fetch the actual title text via the labelKey in component if we want, or just let transloco format it in template,
    // Since we are inside the chart, we might just pass a generalized status or leave the detail text without the raw transloco key.
    // The previous implementation inferred it from logic here, so let's preserve the display logic here for the chart.

    // Range definitions
    const maleRangeMax = 0.95;
    const nearParityRangeMax = 1.05;

    // Colors
    const maleColor = '#6CC2BD';     // Teal
    const nearParityColor = '#5F5B68'; // Grey
    const femaleColor = '#B17D23';   // Bronze

    // Determine dynamic label (logic preserved, but can be managed by Transloco via DOM if needed)
    let dynamicLabel = '';
    let labelColor = currentTheme === 'dark' ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
    
    // Notice the difference vs maleRangeMax logic. Using 0.95 and 1.05 as breakpoints now
    if (gpiValue < maleRangeMax) {
      dynamicLabel = 'Male Advantage';
      labelColor = maleColor;
    } else if (gpiValue >= maleRangeMax && gpiValue <= nearParityRangeMax) {
      dynamicLabel = 'Near Parity';
      labelColor = nearParityColor;
    } else {
      dynamicLabel = 'Female Advantage';
      labelColor = femaleColor;
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
                [0.475, maleColor],       // 0 to 0.95 (0.95 / 2 = 0.475)
                [0.525, nearParityColor], // 0.95 to 1.05 (1.05 / 2 = 0.525)
                [1, femaleColor]        // 1.05 to 2.0 (2 / 2 = 1.0)
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
            color: currentTheme === 'dark' ? '#cbd5e1' : '#475569',
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
            formatter: function (value: number) {
              return value.toFixed(2);
            },
            color: currentTheme === 'dark' ? '#f8fafc' : '#1e293b',
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

  private getCssVariable(name: string, theme: 'light' | 'dark'): string {
    if (typeof document === 'undefined') {
      // SSR fallback colors
      const fallbacks: Record<string, string> = {
        '--chart-2': theme === 'dark' ? '#22c55e' : '#16a34a',
        '--chart-3': theme === 'dark' ? '#f472b6' : '#ec4899',
        '--chart-4': theme === 'dark' ? '#6366f1' : '#4f46e5',
      };
      return fallbacks[name] || '#6366f1';
    }
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || '#6366f1';
  }
}
