import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { MultiSeriesTrend } from '../../data/trends.model';
import { getTranslationKey } from '../../../../shared/utils/data-translation.util';

@Component({
  selector: 'app-multi-line-trend-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-line-trend-chart.component.html',
})
export class MultiLineTrendChartComponent {
  titleKey = input.required<string>();
  multiSeriesData = input.required<MultiSeriesTrend[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);

  private readonly translocoService = inject(TranslocoService);

  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.multiSeriesData();
    const currentTheme = this.theme();
    const isRtl = this.prefs.direction() === 'rtl';

    const colors = [
      this.getCssVariable('--chart-1', currentTheme),
      this.getCssVariable('--chart-2', currentTheme),
      this.getCssVariable('--chart-3', currentTheme),
      this.getCssVariable('--chart-4', currentTheme),
      this.getCssVariable('--chart-5', currentTheme)
    ];

    const allYears = Array.from(new Set(data.flatMap(s => s.data.map(d => d.year)))).sort();
    const lang = this.prefs.language(); // triggers recompute on language change
    
    return {
      rtl: isRtl,
      color: colors,
      legend: {
        data: data.map(d => this.translocoService.translate(getTranslationKey(d.name))),
        textStyle: { color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b' },
        top: 0,
        type: 'scroll'
      },
      grid: {
        left: '2%',
        right: '5%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allYears.map(String),
        axisLabel: { color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b' },
        axisLine: { lineStyle: { color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (val: number) => this.formatValue(val),
          color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b',
        },
        splitLine: {
          lineStyle: { color: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7' },
        },
      },
      series: data.map((series) => {
        const points = allYears.map(y => {
            const match = series.data.find(d => d.year === y);
            return match ? match.value : null;
        });
        return {
          name: this.translocoService.translate(getTranslationKey(series.name)),
          type: 'line',
          smooth: true,
          data: points as (number|null)[],
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 6,
        };
      }),
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
