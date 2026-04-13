import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { TrendPoint } from '../../data/trends.model';
import { formatChartValue, getCssVariable, getChartThemeColors } from '../../../../shared/utils/formatters.util';

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
    const themeColors = getChartThemeColors(currentTheme);

    const chartColor = getCssVariable('--color-primary', currentTheme);

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
          color: themeColors.axisLabel,
        },
        axisLine: {
          lineStyle: {
            color: themeColors.gridLine,
          },
        },
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        axisLabel: {
          formatter: (val: number) => formatChartValue(val),
          color: themeColors.axisLabel,
        },
        splitLine: {
          lineStyle: {
            color: themeColors.gridLine,
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
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: {
          color: themeColors.tooltipText,
        },
      },
    };
  });
}
