import { EducationMasterData } from '../../../core/models/education-data.model';
import { TrendPoint, MultiSeriesTrend, RatioPoint, InfrastructurePoint } from './trends.model';

export function aggregateTotalByYear(data: EducationMasterData[]): TrendPoint[] {
  const map = new Map<number, number>();
  for (const row of data) {
    if (row.year != null && row.studentCount != null) {
      map.set(row.year, (map.get(row.year) || 0) + row.studentCount);
    }
  }
  return Array.from(map.entries())
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => a.year - b.year);
}

export function aggregateByStage(data: EducationMasterData[]): MultiSeriesTrend[] {
  const stageMap = new Map<string, Map<number, number>>();
  
  for (const row of data) {
    if (row.stage && row.year != null && row.studentCount != null) {
      if (!stageMap.has(row.stage)) {
        stageMap.set(row.stage, new Map<number, number>());
      }
      const yearMap = stageMap.get(row.stage)!;
      yearMap.set(row.year, (yearMap.get(row.year) || 0) + row.studentCount);
    }
  }

  return Array.from(stageMap.entries()).map(([stage, yearMap]) => ({
    name: stage,
    data: Array.from(yearMap.entries())
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => a.year - b.year)
  }));
}

export function aggregateByRegion(data: EducationMasterData[]): MultiSeriesTrend[] {
  // 1. Find Top 5 regions by total volume
  const regionVolumeMap = new Map<string, number>();
  for (const row of data) {
    if (row.region && row.studentCount != null) {
      regionVolumeMap.set(row.region, (regionVolumeMap.get(row.region) || 0) + row.studentCount);
    }
  }
  
  const topRegions = Array.from(regionVolumeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  const topRegionsSet = new Set(topRegions);

  // 2. Group by Region, then by Year (only for top 5)
  const regionMap = new Map<string, Map<number, number>>();
  for (const row of data) {
    if (row.region && topRegionsSet.has(row.region) && row.year != null && row.studentCount != null) {
      if (!regionMap.has(row.region)) {
        regionMap.set(row.region, new Map<number, number>());
      }
      const yearMap = regionMap.get(row.region)!;
      yearMap.set(row.year, (yearMap.get(row.year) || 0) + row.studentCount);
    }
  }

  // 3. To guarantee consistent legend order, map from the sorted topRegions array
  return topRegions.map(region => {
    const yearMap = regionMap.get(region) || new Map<number, number>();
    return {
      name: region,
      data: Array.from(yearMap.entries())
        .map(([year, value]) => ({ year, value }))
        .sort((a, b) => a.year - b.year)
    };
  });
}

export function computeTeacherStudentRatio(data: EducationMasterData[]): RatioPoint[] {
  const map = new Map<number, { students: number; teachers: number }>();
  for (const row of data) {
    if (row.year != null) {
      const current = map.get(row.year) || { students: 0, teachers: 0 };
      current.students += (row.studentCount || 0);
      current.teachers += (row.teacherCount || 0);
      map.set(row.year, current);
    }
  }
  
  return Array.from(map.entries())
    .map(([year, counts]) => ({
      year,
      ratio: counts.teachers > 0 ? Number((counts.students / counts.teachers).toFixed(1)) : 0
    }))
    .sort((a, b) => a.year - b.year);
}

export function aggregateInfrastructure(data: EducationMasterData[]): InfrastructurePoint[] {
  const map = new Map<number, { schools: number; teachers: number }>();
  for (const row of data) {
    if (row.year != null) {
      const current = map.get(row.year) || { schools: 0, teachers: 0 };
      current.schools += (row.schoolCount || 0);
      current.teachers += (row.teacherCount || 0);
      map.set(row.year, current);
    }
  }
  
  return Array.from(map.entries())
    .map(([year, counts]) => ({
      year,
      schools: counts.schools,
      teachers: counts.teachers
    }))
    .sort((a, b) => a.year - b.year);
}
