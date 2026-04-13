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
import { formatChartValue, getCssVariable, getChartThemeColors } from '../../../../shared/utils/formatters.util';

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
    const themeColors = getChartThemeColors(currentTheme);

    const colors = [
      getCssVariable('--chart-1', currentTheme),
      getCssVariable('--chart-2', currentTheme),
      getCssVariable('--chart-3', currentTheme),
      getCssVariable('--chart-4', currentTheme),
      getCssVariable('--chart-5', currentTheme)
    ];

    const allYears = Array.from(new Set(data.flatMap(s => s.data.map(d => d.year)))).sort();
    const lang = this.prefs.language(); // triggers recompute on language change
    
    return {
      rtl: isRtl,
      color: colors,
      legend: {
        data: data.map(d => this.translocoService.translate(getTranslationKey(d.name))),
        textStyle: { color: themeColors.axisLabel },
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
        axisLabel: { color: themeColors.axisLabel },
        axisLine: { lineStyle: { color: themeColors.gridLine } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (val: number) => formatChartValue(val),
          color: themeColors.axisLabel,
        },
        splitLine: {
          lineStyle: { color: themeColors.gridLine },
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
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: { color: themeColors.tooltipText },
      },
    };
  });

}
