import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { YoyGrowthPoint } from '../../models/overview.model';
import { getCssVariable } from '../../../../shared/utils/formatters.util';

@Component({
  selector: 'app-yoy-bar-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './yoy-bar-chart.component.html',
})
export class YoyBarChartComponent {
  series = input.required<YoyGrowthPoint[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.series();
    const currentTheme = this.theme();
    const lang = this.prefs.language();

    // Get chart color from CSS variable at runtime
    const chartColor = getCssVariable('--chart-1', currentTheme);

    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => String(d.year)),
        axisLabel: {
          color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b',
        },
        axisLine: {
          lineStyle: {
            color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
          color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b',
        },
        splitLine: {
          lineStyle: {
            color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.growthPercent),
          itemStyle: {
            color: chartColor,
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: unknown) => {
          const point = params as Array<{ dataIndex: number; value: number }>;
          if (point && point[0]) {
            const idx = point[0].dataIndex;
            const d = data[idx];
            if (d.growthPercent === 0 && idx === 0) {
              const baseLang = this.translocoService.translate('trends.charts.baseline-year');
              return `${baseLang} (${d.year})`;
            }
            return `${d.year}: ${d.growthPercent.toFixed(1)}%`;
          }
          return '';
        },
        backgroundColor: currentTheme === 'dark' ? '#27272a' : '#ffffff',
        borderColor: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: currentTheme === 'dark' ? '#fafafa' : '#18181b',
        },
      },
    };
  });

}
