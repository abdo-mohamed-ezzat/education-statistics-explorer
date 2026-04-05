import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import type { EChartsOption } from 'echarts';
import { RatioPoint } from '../../data/trends.model';

// Use echarts for gradient
import * as echarts from 'echarts';

@Component({
  selector: 'app-teacher-ratio-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-ratio-chart.component.html',
})
export class TeacherRatioChartComponent {
  series = input.required<RatioPoint[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);

  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.series();
    const currentTheme = this.theme();
    const isRtl = this.prefs.direction() === 'rtl';

    const chartColor = this.getCssVariable('--color-tertiary', currentTheme);

    return {
      rtl: isRtl,
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => String(d.year)),
        axisLabel: { color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b' },
        axisLine: { lineStyle: { color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7' } },
      },
      yAxis: {
        type: 'value',
        min: 'dataMin', // To show minor fluctuations clearly
        axisLabel: {
          color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b',
        },
        splitLine: {
          lineStyle: { color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7' },
        },
      },
      series: [
        {
          name: 'Ratio',
          type: 'line',
          data: data.map(d => d.ratio),
          itemStyle: { color: chartColor },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: chartColor },
              { offset: 1, color: 'transparent' }
            ])
          },
        }
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!params || !params[0]) return '';
          const point = params[0];
          return `${point.axisValue}: 1 / ${point.value.toFixed(1)}`; 
        },
        backgroundColor: currentTheme === 'dark' ? '#27272a' : '#ffffff',
        borderColor: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
        textStyle: { color: currentTheme === 'dark' ? '#fafafa' : '#18181b' },
      },
    };
  });

  private getCssVariable(name: string, fallbackTheme: 'light' | 'dark'): string {
    if (typeof document === 'undefined') return fallbackTheme === 'dark' ? '#6366f1' : '#4f46e5';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || (fallbackTheme === 'dark' ? '#6366f1' : '#4f46e5');
  }
}
