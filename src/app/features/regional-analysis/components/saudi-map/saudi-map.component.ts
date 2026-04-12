import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PlatformService } from '../../../../core/services/platform.service';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import { getTranslationKey, DatasetTranslationMap } from '../../../../shared/utils/data-translation.util';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartFullscreenWrapperComponent } from '../../../../shared/ui/chart-fullscreen-wrapper/chart-fullscreen-wrapper.component';
import { getChartThemeColors } from '../../../../shared/utils/formatters.util';
import {
  MapTooltipData,
  RegionDataPoint,
  RegionMapDataItem,
  RegionScatterDataItem,
} from '../../data/regional.model';
import { LoadingStateComponent } from '../../../../shared/ui/loading-state/loading-state.component';
/**
 * ECharts typings use a discriminated union for EChartsOption that
 * cannot resolve the combination of `geo` + `map` series together.
 * We define our own lean option type to keep strict typing everywhere
 * else while sidestepping the union conflict.
 */
type GeoMapOption = Record<string, unknown>;

@Component({
  selector: 'app-saudi-map',
  imports: [NgxEchartsDirective, LoadingStateComponent, ChartFullscreenWrapperComponent],
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
  private readonly prefs = inject(PreferencesService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly isBrowser = this.platform.isBrowser;

  protected readonly chartOptions = computed<GeoMapOption>(() => {
    const rawData = this.data();
    const scatter = this.scatterData();
    const currentTheme = this.theme();
    const currentActive = this.activeRegion();
    const isDark = currentTheme === 'dark';
    const lang = this.prefs.language();
    const themeColors = getChartThemeColors(currentTheme);

    // Theme-aware color palette for map-specific features
    const areaColor = isDark ? '#1a2332' : '#e8f5e9';
    const borderColor = isDark ? '#2d3748' : '#ffffff';
    const emphasisColor = isDark ? '#fbbf24' : '#f59e0b';
    const selectColor = isDark ? '#059669' : '#10b981';
    const lowColor = isDark ? '#115e59' : '#ccfbf1';
    const highColor = isDark ? '#0f766e' : '#0d9488';
    const scatterColor = isDark ? '#34d399' : '#059669';

    // Map data items for the choropleth layer
    const mapDataItems: any[] = rawData.map((d) => {
      const isSelected = d.regionName === currentActive;
      return {
        name: d.regionName,
        value: d.totalStudents,
        totalStudents: d.totalStudents,
        schoolCount: d.schoolCount,
        teacherCount: d.teacherCount,
        selected: isSelected,
        ...(isSelected ? {
          visualMap: false,
          itemStyle: {
            areaColor: selectColor,
            color: selectColor
          }
        } : {})
      };
    });

    const MAX_STUDENTS_FALLBACK = 1000;
    const maxStudents = Math.max(...rawData.map((d) => d.totalStudents), MAX_STUDENTS_FALLBACK);

    return {
      geo: {
        map: 'SAUDI_ARABIA',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          color: themeColors.tooltipText, // High contrast for names
          formatter: (params: any) => {
             if (!params.name) return '';
             return this.translocoService.translate(getTranslationKey(params.name));
          }
        },
        itemStyle: {
          areaColor,
          borderColor,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: { areaColor: emphasisColor },
          label: { show: true, color: themeColors.tooltipText },
        },
        select: {
          itemStyle: { areaColor: selectColor },
          label: { show: true, color: '#ffffff', fontWeight: 'bold' },
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: themeColors.tooltipBackground,
        borderColor: themeColors.tooltipBorder,
        textStyle: { color: themeColors.tooltipText },
        formatter: (params: unknown) => {
          const p = params as { seriesType?: string; data?: MapTooltipData };
          const d = p?.data;
          if (!d?.name) return '';
          
          const translatedName = this.translocoService.translate(getTranslationKey(d.name));
          const translatedStudents = this.translocoService.translate('trends.charts.students');
          const translatedSchools = this.translocoService.translate('trends.charts.schools');
          const translatedTeachers = this.translocoService.translate('trends.charts.teachers');

          if (p.seriesType === 'effectScatter') {
            return `<div style="font-weight:bold;">${translatedName}</div>
                    <div>${translatedStudents}: ${d.value?.[2]?.toLocaleString()}</div>`;
          }
          return `<div style="font-weight:bold; margin-bottom:4px;">${translatedName}</div>
                  <div>${translatedStudents}: ${d.totalStudents?.toLocaleString()}</div>
                  <div>${translatedSchools}: ${d.schoolCount?.toLocaleString()}</div>
                  <div>${translatedTeachers}: ${d.teacherCount?.toLocaleString()}</div>`;
        },
      },
      visualMap: {
        show: true,
        type: 'continuous',
        min: 0,
        max: maxStudents,
        text: ['High', 'Low'],
        textStyle: { color: themeColors.axisLabel },
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
