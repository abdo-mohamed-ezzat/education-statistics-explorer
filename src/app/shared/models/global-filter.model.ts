export type FilterDimension = 'year' | 'region' | 'stage' | 'gender';

export interface GlobalFilterState {
  year: number | null;
  region: string | null;
  stage: string | null;
  gender: string | null;
}

export const DEFAULT_FILTER_STATE: GlobalFilterState = {
  year: null,
  region: null,
  stage: null,
  gender: null,
};

export interface FilterConfig {
  allowedDimensions: FilterDimension[];
}
