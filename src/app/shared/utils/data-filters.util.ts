export interface GlobalFilterState {
  year: number | null;
  region: string | null;
  stage: string | null;
  gender: string | null;
}

export function applyDataFilters<T extends Partial<GlobalFilterState>>(
  data: T[],
  filters: Partial<GlobalFilterState>
): T[] {
  return data.filter((row) => {
    if (filters.year !== undefined && filters.year !== null && row.year !== filters.year) return false;
    if (filters.region !== undefined && filters.region !== null && row.region !== filters.region) return false;
    if (filters.stage !== undefined && filters.stage !== null && row.stage !== filters.stage) return false;
    if (filters.gender !== undefined && filters.gender !== null && row.gender !== filters.gender) return false;
    return true;
  });
}
