import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { TrendPoint } from '../../data/trends.model';

import * as echarts from 'echarts';

@Component({
  selector: 'app-total-growth-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './total-growth-chart.component.html',
})
export class TotalGrowthChartComponent {
  series = input.required<TrendPoint[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);
  
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.series();
    const currentTheme = this.theme();
    const isRtl = this.prefs.direction() === 'rtl';

    const chartColor = this.getCssVariable('--color-primary', currentTheme);

    return {
      rtl: isRtl,
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
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
        min: 'dataMin',
        axisLabel: {
          formatter: (val: number) => this.formatValue(val),
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
          type: 'line',
          smooth: true,
          data: data.map((d) => d.value),
          itemStyle: {
            color: chartColor,
          },
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: chartColor },
              { offset: 1, color: 'transparent' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!params || !params[0]) return '';
          const point = params[0];
          return `${point.axisValue}: ${point.value.toLocaleString('en-US')}`;
        },
        backgroundColor: currentTheme === 'dark' ? '#27272a' : '#ffffff',
        borderColor: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: currentTheme === 'dark' ? '#fafafa' : '#18181b',
        },
      },
    };
  });

  private formatValue(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return String(value);
  }

  private getCssVariable(name: string, theme: 'light' | 'dark'): string {
    if (typeof document === 'undefined') return theme === 'dark' ? '#6366f1' : '#4f46e5';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || (theme === 'dark' ? '#6366f1' : '#4f46e5');
  }
}
