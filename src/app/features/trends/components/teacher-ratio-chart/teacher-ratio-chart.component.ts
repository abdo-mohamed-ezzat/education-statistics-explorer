import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { RatioPoint } from '../../data/trends.model';
import { getCssVariable, getChartThemeColors } from '../../../../shared/utils/formatters.util';

// Use echarts for gradient
import * as echarts from 'echarts';

@Component({
  selector: 'app-teacher-ratio-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-ratio-chart.component.html',
})
export class TeacherRatioChartComponent {
  series = input.required<RatioPoint[]>();
  theme = input.required<'light' | 'dark'>();
  
  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);

  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.series();
    const currentTheme = this.theme();
    const isRtl = this.prefs.direction() === 'rtl';
    const lang = this.prefs.language();
    const themeColors = getChartThemeColors(currentTheme);

    const chartColor = getCssVariable('--color-tertiary', currentTheme);

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
        axisLabel: { color: themeColors.axisLabel },
        axisLine: { lineStyle: { color: themeColors.gridLine } },
      },
      yAxis: {
        type: 'value',
        min: 'dataMin', // To show minor fluctuations clearly
        axisLabel: {
          color: themeColors.axisLabel,
        },
        splitLine: {
          lineStyle: { color: themeColors.gridLine },
        },
      },
      series: [
        {
          name: this.translocoService.translate('trends.charts.ratio'),
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
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: { color: themeColors.tooltipText },
      },
    };
  });

}
