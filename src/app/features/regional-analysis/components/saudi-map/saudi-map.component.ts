import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { NgxEchartsDirective } from 'ngx-echarts';
import {
  MapTooltipData,
  RegionDataPoint,
  RegionMapDataItem,
  RegionScatterDataItem,
} from '../../data/regional.model';

/**
 * ECharts typings use a discriminated union for EChartsOption that
 * cannot resolve the combination of `geo` + `map` series together.
 * We define our own lean option type to keep strict typing everywhere
 * else while sidestepping the union conflict.
 */
type GeoMapOption = Record<string, unknown>;

@Component({
  selector: 'app-saudi-map',
  imports: [NgxEchartsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './saudi-map.component.html',
})
export class SaudiMapComponent {
  data = input.required<RegionDataPoint[]>();
  scatterData = input.required<RegionScatterDataItem[]>();
  activeRegion = input<string | null>(null);
  theme = input<'light' | 'dark'>('light');

  regionSelected = output<string>();

  private readonly platform = inject(PlatformService);
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<GeoMapOption>(() => {
    const rawData = this.data();
    const scatter = this.scatterData();
    const currentTheme = this.theme();
    const currentActive = this.activeRegion();
    const isDark = currentTheme === 'dark';

    // Theme-aware color palette
    const areaColor = isDark ? '#1a2332' : '#e8f5e9';
    const borderColor = isDark ? '#2d3748' : '#ffffff';
    const emphasisColor = isDark ? '#fbbf24' : '#f59e0b';
    const selectColor = isDark ? '#059669' : '#10b981';
    const lowColor = isDark ? '#115e59' : '#ccfbf1';
    const highColor = isDark ? '#0f766e' : '#0d9488';
    const textColor = isDark ? '#e2e8f0' : '#1a202c';
    const subtextColor = isDark ? '#a1a1aa' : '#52525b';
    const tooltipBg = isDark ? '#27272a' : '#ffffff';
    const tooltipBorder = isDark ? '#3f3f46' : '#e4e4e7';
    const scatterColor = isDark ? '#34d399' : '#059669';

    // Map data items for the choropleth layer
    const mapDataItems: RegionMapDataItem[] = rawData.map((d) => ({
      name: d.regionName,
      value: d.totalStudents,
      totalStudents: d.totalStudents,
      schoolCount: d.schoolCount,
      teacherCount: d.teacherCount,
    }));

    // Highlight the active region via geo.regions
    const highlightedRegions = currentActive
      ? [
          {
            name: currentActive,
            selected: true,
            itemStyle: { areaColor: selectColor },
            label: {
              show: true,
              color: isDark ? '#ffffff' : '#000000',
              fontWeight: 'bold',
            },
          },
        ]
      : [];

    const maxStudents = Math.max(...rawData.map((d) => d.totalStudents), 1000);

    return {
      geo: {
        map: 'SAUDI_ARABIA',
        roam: true,
        zoom: 1.2,
        itemStyle: {
          areaColor,
          borderColor,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: { areaColor: emphasisColor },
          label: { show: true, color: textColor },
        },
        select: {
          itemStyle: { areaColor: selectColor },
          label: { show: true, color: '#ffffff', fontWeight: 'bold' },
        },
        regions: highlightedRegions,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: { color: textColor },
        formatter: (params: unknown) => {
          const p = params as { seriesType?: string; data?: MapTooltipData };
          const d = p?.data;
          if (!d?.name) return '';
          if (p.seriesType === 'effectScatter') {
            return `<div style="font-weight:bold;">${d.name}</div>
                    <div>Students: ${d.value?.[2]?.toLocaleString()}</div>`;
          }
          return `<div style="font-weight:bold; margin-bottom:4px;">${d.name}</div>
                  <div>Students: ${d.totalStudents?.toLocaleString()}</div>
                  <div>Schools: ${d.schoolCount?.toLocaleString()}</div>
                  <div>Teachers: ${d.teacherCount?.toLocaleString()}</div>`;
        },
      },
      visualMap: {
        show: true,
        type: 'continuous',
        min: 0,
        max: maxStudents,
        text: ['High', 'Low'],
        textStyle: { color: subtextColor },
        inRange: { color: [lowColor, highColor] },
        calculable: true,
        left: 'left',
        bottom: 20,
        seriesIndex: 0,
      },
      series: [
        // Layer 1: Choropleth (map series bound to geo coordinate system)
        {
          type: 'map',
          map: 'SAUDI_ARABIA',
          geoIndex: 0,
          data: mapDataItems,
        },
        // Layer 2: Animated scatter bubbles at region centres
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatter.map((s) => ({ name: s.name, value: s.value })),
          symbolSize: (val: number[]) => Math.max(6, Math.min(30, (val[2] / maxStudents) * 40)),
          encode: { value: 2 },
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke', scale: 3 },
          itemStyle: {
            color: scatterColor,
            shadowBlur: 10,
            shadowColor: isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(5, 150, 105, 0.3)',
          },
          label: { show: false },
        },
      ],
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
