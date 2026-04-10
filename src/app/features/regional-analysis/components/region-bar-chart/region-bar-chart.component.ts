import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { RegionDataPoint } from '../../data/regional.model';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-region-bar-chart',
  imports: [NgxEchartsDirective, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './region-bar-chart.component.html',
})
export class RegionBarChartComponent {
  data = input.required<RegionDataPoint[]>();
  activeRegion = input<string | null>(null);
  theme = input<'light' | 'dark'>('light');

  regionSelected = output<string>();

  private readonly platform = inject(PlatformService);
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<EChartsOption>(() => {
    const rawData = this.data();
    const currentTheme = this.theme();
    const currentActive = this.activeRegion();

    const chartColor = currentTheme === 'dark' ? '#0f766e' : '#0d9488';
    const fallbackColor = currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7';

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
          color: currentTheme === 'dark' ? '#a1a1aa' : '#52525b',
          interval: 0,
          rotate: 30,
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
          formatter: (value: number) =>
            value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : (value / 1000).toFixed(0) + 'k',
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
        backgroundColor: currentTheme === 'dark' ? '#27272a' : '#ffffff',
        borderColor: currentTheme === 'dark' ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: currentTheme === 'dark' ? '#fafafa' : '#18181b',
        },
      },
    };
  });

  // Use unknown to avoid the duplicate ECElementEvent type conflict
  // between echarts/types/dist/echarts and echarts/types/dist/shared.
  onChartClick(event: unknown): void {
    const e = event as { name?: string; data?: { name?: string } | null };
    const name = e?.name ?? e?.data?.name;
    if (name) {
      this.regionSelected.emit(name);
    }
  }
}
