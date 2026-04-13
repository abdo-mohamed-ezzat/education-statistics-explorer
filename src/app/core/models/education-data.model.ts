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
