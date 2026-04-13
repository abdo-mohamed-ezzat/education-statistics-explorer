export interface TrendPoint {
  year: number;
  value: number;
}

export interface MultiSeriesTrend {
  name: string;
  data: TrendPoint[];
}

export interface RatioPoint {
  year: number;
  ratio: number;
}

export interface InfrastructurePoint {
  year: number;
  schools: number;
  teachers: number;
}

export interface TrendsViewModel {
  timeSeriesData: TrendPoint[];
  stageTrendData: MultiSeriesTrend[];
  regionTrendData: MultiSeriesTrend[];
  teacherRatioData: RatioPoint[];
  infrastructureData: InfrastructurePoint[];
}
