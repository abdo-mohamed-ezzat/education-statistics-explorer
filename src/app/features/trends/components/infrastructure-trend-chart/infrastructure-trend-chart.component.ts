import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import type { EChartsOption } from 'echarts';
import { InfrastructurePoint } from '../../data/trends.model';

@Component({
  selector: 'app-infrastructure-trend-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './infrastructure-trend-chart.component.html',
})
export class InfrastructureTrendChartComponent {
  series = input.required<InfrastructurePoint[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);

  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.series();
    const currentTheme = this.theme();
    const isRtl = this.prefs.direction() === 'rtl';

    const primaryColor = this.getCssVariable('--color-primary', currentTheme);
    const secondaryColor = this.getCssVariable('--color-secondary', currentTheme);

    return {
      rtl: isRtl,
      legend: {
        data: ['Schools', 'Teachers'],
        textStyle: { color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b' },
        top: 0
      },
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
      yAxis: [
        {
          type: 'value',
          name: 'Schools',
          position: isRtl ? 'right' : 'left',
          axisLine: { show: true, lineStyle: { color: primaryColor } },
          axisLabel: { formatter: (val: number) => this.formatValue(val) },
          splitLine: { lineStyle: { color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7' } },
        },
        {
          type: 'value',
          name: 'Teachers',
          position: isRtl ? 'left' : 'right',
          axisLine: { show: true, lineStyle: { color: secondaryColor } },
          axisLabel: { formatter: (val: number) => this.formatValue(val) },
          splitLine: { show: false },
        }
      ],
      series: [
        {
          name: 'Schools',
          type: 'line',
          yAxisIndex: 0,
          data: data.map((d) => d.schools),
          itemStyle: { color: primaryColor },
          lineStyle: { width: 3 }
        },
        {
          name: 'Teachers',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.teachers),
          itemStyle: { color: secondaryColor },
          lineStyle: { width: 3 }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: currentTheme === 'dark' ? '#27272a' : '#ffffff',
        borderColor: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
        textStyle: { color: currentTheme === 'dark' ? '#fafafa' : '#18181b' },
      },
    };
  });

  private formatValue(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return String(value);
  }

  private getCssVariable(name: string, fallbackTheme: 'light' | 'dark'): string {
    if (typeof document === 'undefined') return fallbackTheme === 'dark' ? '#6366f1' : '#4f46e5';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || (fallbackTheme === 'dark' ? '#6366f1' : '#4f46e5');
  }
}
