/**
 * Represents the structure of the edu-master.json dataset
 */
export interface EducationMasterData {
  year: number;
  region: string;
  stage: string;
  gender: string;
  studentCount: number;
  teacherCount: number;
  schoolCount: number;
  administratorCount: number;
}

/**
 * Represents the structure of the edu-summary.json dataset
 */
export interface EducationSummaryData {
  totalStudents: number;
  growthRate: number;
  largestRegion: string;
  baseYear: number;
  latestYear: number;
}

/**
 * Represents the structure of the education-records.json dataset
 * This dataset contains more granular data than the master dataset.
 */
export interface EducationRecordData {
  year: number;
  hijriYear: number;
  region: string;
  educationOffice: string;
  stage: string;
  gender: string;
}
/**
 * Represents the structure of the edu-master.json dataset
 */
export interface EducationMasterData {
  year: number;
  region: string;
  stage: string;
  gender: string;
  studentCount: number;
  teacherCount: number;
  schoolCount: number;
  administratorCount: number;
}

/**
 * Represents the structure of the edu-summary.json dataset
 */
export interface EducationSummaryData {
  totalStudents: number;
  growthRate: number;
  largestRegion: string;
  baseYear: number;
  latestYear: number;
}

/**
 * Represents the structure of the education-records.json dataset
 * This dataset contains more granular data than the master dataset.
 */
export interface EducationRecordData {
  year: number;
  hijriYear: number;
  region: string;
  educationOffice: string;
  stage: string;
  gender: string;
  schoolCount: number;
  studentCount: number;
  teacherCount: number;
  administratorCount: number;
}

/**
 * Constants for Dataset Domain Values
 */
export const DatasetGender = {
  Male: 'بنين',
  Female: 'بنات',
} as const;

export const DatasetStage = {
  Primary: 'المرحلة الإبتدائية',
  Intermediate: 'المرحلة المتوسطة',
  Secondary: 'المرحلة الثانوية',
  Kindergarten: 'رياض الأطفال',
} as const;

export const DatasetRegion = {
  Riyadh: 'الرياض',
  Makkah: 'مكة المكرمة',
  Madinah: 'المدينة المنورة',
  EasternProvince: 'الشرقية',
  Aseer: 'عسير',
  Qassim: 'القصيم',
  Tabuk: 'تبوك',
  Hail: 'حائل',
  NorthernBorders: 'الحدود الشمالية',
  Jazan: 'جازان',
  Najran: 'نجران',
  AlBaha: 'الباحة',
  AlJouf: 'الجوف',
} as const;

/** Approximate geographic center coordinates for each Saudi region. */
export const REGION_CENTERS: Record<string, [number, number]> = {
  [DatasetRegion.Riyadh]: [46.7, 24.7],
  [DatasetRegion.Makkah]: [39.8, 21.4],
  [DatasetRegion.Madinah]: [39.6, 24.5],
  [DatasetRegion.EasternProvince]: [49.6, 25.4],
  [DatasetRegion.Aseer]: [42.5, 18.2],
  [DatasetRegion.Qassim]: [43.8, 26.3],
  [DatasetRegion.Tabuk]: [36.6, 28.4],
  [DatasetRegion.Hail]: [41.7, 27.5],
  [DatasetRegion.NorthernBorders]: [42.5, 30.9],
  [DatasetRegion.Jazan]: [42.6, 17.0],
  [DatasetRegion.Najran]: [44.2, 17.5],
  [DatasetRegion.AlBaha]: [41.5, 20.0],
  [DatasetRegion.AlJouf]: [40.0, 29.8],
};

export const DATASET_BASELINE_YEAR = 2016;
export const DATASET_FALLBACK_LATEST_YEAR = 2024;

/** GPI Parity Index Thresholds */
export const GPI_THRESHOLD_MALE = 0.95;
export const GPI_THRESHOLD_FEMALE = 1.05;

/** Literacy Rate Mock Thresholds (Student Population size) */
export const LITERACY_THRESHOLD_LARGE = 500000;
export const LITERACY_THRESHOLD_MEDIUM = 200000;
export const LITERACY_BASE_RATE = 95;
