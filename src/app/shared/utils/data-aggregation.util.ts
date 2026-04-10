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
    const gender = row.gender?.toLowerCase() || '';
    if (gender === 'بنين' || gender === 'male') {
      maleCount += row.studentCount || 0;
    } else if (gender === 'بنات' || gender === 'female') {
      femaleCount += row.studentCount || 0;
    }
  }

  return { maleCount, femaleCount };
}
