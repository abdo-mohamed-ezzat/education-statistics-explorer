import { DatasetGender } from '../../core/models/education-data.model';

export function sumMetric<T>(data: T[], key: keyof T): number {
  return data.reduce((sum, item) => {
    const value = item[key];
    if (typeof value === 'number') {
      return sum + value;
    }
    return sum;
  }, 0);
}

export function splitByGender<T extends { gender: string; studentCount: number }>(
  data: T[]
): { maleCount: number; femaleCount: number } {
  let maleCount = 0;
  let femaleCount = 0;

  for (const row of data) {
    const gender = row.gender || '';
    if (gender === DatasetGender.Male || gender.toLowerCase() === 'male') {
      maleCount += row.studentCount || 0;
    } else if (gender === DatasetGender.Female || gender.toLowerCase() === 'female') {
      femaleCount += row.studentCount || 0;
    }
  }

  return { maleCount, femaleCount };
}
