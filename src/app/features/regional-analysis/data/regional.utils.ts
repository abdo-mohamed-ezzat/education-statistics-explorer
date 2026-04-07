import { EducationRecordData } from '../../../core/models/education-data.model';
import { GeoJsonFeatureCollection } from '../../../core/models/geojson.model';
import { RegionDataPoint, RegionProfile, RegionScatterDataItem } from './regional.model';

/** Default year when global Year filter is null (All). */
export const DEFAULT_YEAR = 2024;

/** Approximate geographic center coordinates for each Saudi region. */
export const REGION_CENTERS: Record<string, [number, number]> = {
  'الرياض': [46.7, 24.7],
  'مكة المكرمة': [39.8, 21.4],
  'المدينة المنورة': [39.6, 24.5],
  'الشرقية': [49.6, 25.4],
  'عسير': [42.5, 18.2],
  'القصيم': [43.8, 26.3],
  'تبوك': [36.6, 28.4],
  'حائل': [41.7, 27.5],
  'الحدود الشمالية': [42.5, 30.9],
  'جازان': [42.6, 17.0],
  'نجران': [44.2, 17.5],
  'الباحة': [41.5, 20.0],
  'الجوف': [40.0, 29.8],
};

/**
 * Normalizes GeoJSON feature names to Arabic so ECharts can match
 * data items (which use Arabic region names) to the correct features.
 */
export function normalizeGeoJsonToArabic(
  geoJson: GeoJsonFeatureCollection,
): GeoJsonFeatureCollection {
  return {
    ...geoJson,
    features: geoJson.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: (feature.properties['name_ar'] as string) ?? feature.properties['name'],
      },
    })),
  };
}

/**
 * Aggregates education records into one data point per region.
 */
export function aggregateMapData(records: EducationRecordData[]): RegionDataPoint[] {
  const map = new Map<string, RegionDataPoint>();

  for (const row of records) {
    const region = row.region;
    if (!map.has(region)) {
      map.set(region, { regionName: region, totalStudents: 0, schoolCount: 0, teacherCount: 0 });
    }
    const data = map.get(region)!;
    data.totalStudents += row.studentCount;
    data.schoolCount += row.schoolCount;
    data.teacherCount += row.teacherCount;
  }

  return Array.from(map.values());
}

/**
 * Returns ALL regions sorted descending by student count.
 * No slicing — all 13 administrative regions are included.
 */
export function aggregateBarChartData(records: EducationRecordData[]): RegionDataPoint[] {
  const data = aggregateMapData(records);
  data.sort((a, b) => b.totalStudents - a.totalStudents);
  return data;
}

/**
 * Converts aggregated region data into ECharts effectScatter format.
 * Each item carries [longitude, latitude, studentCount].
 */
export function toScatterData(points: RegionDataPoint[]): RegionScatterDataItem[] {
  return points
    .filter((p) => REGION_CENTERS[p.regionName] != null)
    .map((p) => ({
      name: p.regionName,
      value: [...REGION_CENTERS[p.regionName], p.totalStudents] as [number, number, number],
    }));
}

/**
 * Computes a detailed profile for a single region.
 */
export function computeRegionProfile(
  activeRecords: EducationRecordData[],
  allRecords: EducationRecordData[],
  selectedRegion: string,
  stageFilter: string | null = null
): RegionProfile | null {
  if (!activeRecords || activeRecords.length === 0 || !selectedRegion) return null;

  const regionRecords = activeRecords.filter((r) => r.region === selectedRegion);
  if (regionRecords.length === 0) return null;

  let totalStudents = 0;
  let maleCount = 0;
  let femaleCount = 0;
  let schoolsCount = 0;
  let teacherCount = 0;

  for (const row of regionRecords) {
    totalStudents += row.studentCount;
    schoolsCount += row.schoolCount;
    teacherCount += row.teacherCount;

    if (row.gender === 'بنين') {
      maleCount += row.studentCount;
    } else if (row.gender === 'بنات') {
      femaleCount += row.studentCount;
    }
  }

  const malePercent = totalStudents > 0 ? (maleCount / totalStudents) * 100 : 0;
  const femalePercent = totalStudents > 0 ? (femaleCount / totalStudents) * 100 : 0;
  const ratioCalc = teacherCount > 0 ? Math.round(totalStudents / teacherCount) : 0;

  const activeYear = regionRecords[0]?.year ?? DEFAULT_YEAR;

  // Calculate new schools based on previous year difference using the raw dataset
  const prevYear = activeYear - 1;
  const prevYearRecords = allRecords.filter(
    (r) =>
      r.region === selectedRegion &&
      r.year === prevYear &&
      (stageFilter === null || r.stage === stageFilter)
  );

  let prevSchoolsCount = 0;
  for (const row of prevYearRecords) {
    prevSchoolsCount += row.schoolCount;
  }

  // If we have previous year data, calculate difference. Ensure we don't display a massive 
  // false positive if there is no previous year data at all.
  const newSchools = prevYearRecords.length > 0 ? Math.max(0, schoolsCount - prevSchoolsCount) : 0;

  // Derived mock values for fields not natively in the dataset
  const literacyBase = 95;
  const literacyRate = Math.min(
    99.8,
    literacyBase + (totalStudents > 500000 ? 3.4 : totalStudents > 200000 ? 2.1 : 0.8),
  );

  return {
    regionName: selectedRegion,
    year: activeYear,
    totalStudents,
    maleCount,
    femaleCount,
    malePercent,
    femalePercent,
    schoolsCount,
    teacherRatio: ratioCalc,
    literacyRate: Number(literacyRate.toFixed(1)),
    newSchools,
  };
}
