import { 
  EducationRecordData, 
  DatasetRegion, 
  DATASET_FALLBACK_LATEST_YEAR,
  REGION_CENTERS,
  LITERACY_THRESHOLD_LARGE,
  LITERACY_THRESHOLD_MEDIUM,
  LITERACY_BASE_RATE
} from '../../../core/models/education-data.model';
import { GeoJsonFeatureCollection } from '../../../core/models/geojson.model';
import { RegionDataPoint, RegionProfile, RegionScatterDataItem } from './regional.model';
import { splitByGender } from '../../../shared/utils/data-aggregation.util';

/** Default year when global Year filter is null (All). */
export const DEFAULT_YEAR = DATASET_FALLBACK_LATEST_YEAR;

// Note: REGION_CENTERS removed from here as it it is now in the core model.

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
  let schoolsCount = 0;
  let teacherCount = 0;

  for (const row of regionRecords) {
    totalStudents += row.studentCount;
    schoolsCount += row.schoolCount;
    teacherCount += row.teacherCount;
  }

  const { maleCount, femaleCount } = splitByGender(regionRecords);

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

  // Derived mock values for literacy rates based on student population size
  const literacyRate = Math.min(
    99.8,
    LITERACY_BASE_RATE + (totalStudents > LITERACY_THRESHOLD_LARGE ? 3.4 : totalStudents > LITERACY_THRESHOLD_MEDIUM ? 2.1 : 0.8),
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
