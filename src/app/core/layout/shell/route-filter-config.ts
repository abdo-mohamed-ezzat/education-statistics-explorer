import { FilterDimension } from '../../../shared/models/global-filter.model';

/**
 * Maps router paths to the dimensions they support via the global filter bar.
 * If a route is not present, the filter bar will hide all dimensions.
 */
export const ROUTE_FILTER_CONFIG: Record<string, FilterDimension[]> = {
  'overview': ['year', 'region', 'stage', 'gender'],
  'trends': ['region', 'stage', 'gender'], 
  'regional-analysis': ['year', 'stage', 'gender'],
  'gender-analysis': ['year', 'region', 'stage'],
  'stage-analysis': ['year', 'region', 'gender']
};

export const DEFAULT_ROUTE_FILTER_CONFIG: FilterDimension[] = [];
