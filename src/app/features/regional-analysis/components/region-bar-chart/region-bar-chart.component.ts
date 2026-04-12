import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import { getTranslationKey } from '../../../../shared/utils/data-translation.util';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import type { EChartsOption } from 'echarts';
import { RegionDataPoint } from '../../data/regional.model';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
import { getChartThemeColors, getCssVariable } from '../../../../shared/utils/formatters.util';

@Component({
  selector: 'app-region-bar-chart',
  imports: [NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './region-bar-chart.component.html',
})
export class RegionBarChartComponent {
  data = input.required<RegionDataPoint[]>();
  activeRegion = input<string | null>(null);
  theme = input<'light' | 'dark'>('light');

  regionSelected = output<string>();

  private readonly platform = inject(PlatformService);
  private readonly prefs = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const rawData = this.data();
    const currentTheme = this.theme();
    const currentActive = this.activeRegion();
    const lang = this.prefs.language();

    const themeColors = getChartThemeColors(currentTheme);
    const chartColor = getCssVariable('--color-primary', currentTheme);
    const fallbackColor = themeColors.gridLine;

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
        data: rawData.map((d) => d.regionName),
        axisLabel: {
          formatter: (value: string) => this.translocoService.translate(getTranslationKey(value)),
          color: themeColors.axisLabel,
          interval: 0,
          rotate: 30,
        },
        axisLine: {
          lineStyle: {
            color: themeColors.gridLine,
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) =>
            value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : (value / 1000).toFixed(0) + 'k',
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
          type: 'bar',
          data: rawData.map((d) => ({
            name: d.regionName,
            value: d.totalStudents,
            itemStyle: {
              color: d.regionName === currentActive ? chartColor : fallbackColor,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const point = params as Array<{ name: string; value: number }>;
          if (point && point[0]) {
            const translatedName = this.translocoService.translate(getTranslationKey(point[0].name));
            return `<div style="font-weight:bold;">${translatedName}</div>
                    <div>${point[0].value.toLocaleString()}</div>`;
          }
          return '';
        },
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: {
          color: themeColors.tooltipText,
        },
      },
    };
  });

  // Use unknown to avoid the duplicate ECElementEvent type conflict
  // between echarts/types/dist/echarts and echarts/types/dist/shared.
  onChartClick(event: unknown): void {
    const e = event as { dataIndex?: number };
    if (e.dataIndex !== undefined) {
      const name = this.data()[e.dataIndex]?.regionName;
      if (name) {
        this.regionSelected.emit(name);
      }
    }
  }
}
