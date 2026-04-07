// ── GeoJSON Saudi-specific property narrowing ─────────────────────────
export interface SaudiGeoJsonProperties {
  name: string;
  name_en: string;
  name_ar: string;
  region_code?: string;
}

// ── ECharts Tooltip Callback Param (internal use only) ──────────────
/** Narrowed shape used inside tooltip formatter callbacks. */
export interface MapTooltipData {
  name?: string;
  totalStudents?: number;
  schoolCount?: number;
  teacherCount?: number;
  value?: [number, number, number];
}
// ── Map Data Item (fed to ECharts map series) ────────────────────────
export interface RegionMapDataItem {
  name: string;
  value: number;
  totalStudents: number;
  schoolCount: number;
  teacherCount: number;
}

// ── Scatter Data Item (fed to ECharts effectScatter series) ──────────
export interface RegionScatterDataItem {
  name: string;
  value: [number, number, number]; // [longitude, latitude, studentCount]
}

// ── Aggregated region metrics (shared by map & bar chart) ────────────
export interface RegionDataPoint {
  regionName: string;
  totalStudents: number;
  schoolCount: number;
  teacherCount: number;
}

// ── Detailed region profile card ─────────────────────────────────────
export interface RegionProfile {
  regionName: string;
  year: number;
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  malePercent: number;
  femalePercent: number;
  schoolsCount: number;
  teacherRatio: number;
  literacyRate: number;
  newSchools: number;
}
