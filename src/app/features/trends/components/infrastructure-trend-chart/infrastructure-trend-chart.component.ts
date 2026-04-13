import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { InfrastructurePoint } from '../../data/trends.model';
import { formatChartValue, getCssVariable, getChartThemeColors } from '../../../../shared/utils/formatters.util';

@Component({
  selector: 'app-infrastructure-trend-chart',
  imports: [TranslocoPipe, NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './infrastructure-trend-chart.component.html',
})
export class InfrastructureTrendChartComponent {
  series = input.required<InfrastructurePoint[]>();
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

    const primaryColor = getCssVariable('--color-primary', currentTheme);
    const secondaryColor = getCssVariable('--color-secondary', currentTheme);

    return {
      rtl: isRtl,
      legend: {
        data: [
          this.translocoService.translate('trends.charts.schools'),
          this.translocoService.translate('trends.charts.teachers'),
        ],
        textStyle: { color: themeColors.axisLabel },
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
        axisLabel: { color: themeColors.axisLabel },
        axisLine: { lineStyle: { color: themeColors.gridLine } },
      },
      yAxis: [
        {
          type: 'value',
          name: this.translocoService.translate('trends.charts.schools'),
          position: isRtl ? 'right' : 'left',
          axisLine: { show: true, lineStyle: { color: primaryColor } },
          axisLabel: { formatter: (val: number) => formatChartValue(val) },
          splitLine: { lineStyle: { color: themeColors.gridLine } },
        },
        {
          type: 'value',
          name: this.translocoService.translate('trends.charts.teachers'),
          position: isRtl ? 'left' : 'right',
          axisLine: { show: true, lineStyle: { color: secondaryColor } },
          axisLabel: { formatter: (val: number) => formatChartValue(val) },
          splitLine: { show: false },
        }
      ],
      series: [
        {
          name: this.translocoService.translate('trends.charts.schools'),
          type: 'line',
          yAxisIndex: 0,
          data: data.map((d) => d.schools),
          itemStyle: { color: primaryColor },
          lineStyle: { width: 3 }
        },
        {
          name: this.translocoService.translate('trends.charts.teachers'),
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.teachers),
          itemStyle: { color: secondaryColor },
          lineStyle: { width: 3 }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: { color: themeColors.tooltipText },
      },
    };
  });


}
