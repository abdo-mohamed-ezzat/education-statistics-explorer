/**
 * Standard GeoJSON FeatureCollection structure.
 * Used by EducationDataService for type-safe GeoJSON loading.
 */
export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}
