import { DatasetGender, DatasetStage, DatasetRegion } from '../../core/models/education-data.model';

export const DatasetTranslationMap: Record<string, string> = {
  // Genders
  [DatasetGender.Male]: 'filter.gender.male',
  [DatasetGender.Female]: 'filter.gender.female',
  // Stages
  [DatasetStage.Primary]: 'filter.stage.primary',
  [DatasetStage.Intermediate]: 'filter.stage.intermediate',
  [DatasetStage.Secondary]: 'filter.stage.secondary',
  [DatasetStage.Kindergarten]: 'filter.stage.kindergarten',
  // Regions
  [DatasetRegion.Riyadh]: 'filter.region.riyadh',
  [DatasetRegion.Makkah]: 'filter.region.makkah',
  [DatasetRegion.Madinah]: 'filter.region.madinah',
  [DatasetRegion.EasternProvince]: 'filter.region.eastern_province',
  [DatasetRegion.Aseer]: 'filter.region.aseer',
  [DatasetRegion.Qassim]: 'filter.region.qassim',
  [DatasetRegion.Tabuk]: 'filter.region.tabuk',
  [DatasetRegion.Hail]: 'filter.region.hail',
  [DatasetRegion.NorthernBorders]: 'filter.region.northern_borders',
  [DatasetRegion.Jazan]: 'filter.region.jazan',
  [DatasetRegion.Najran]: 'filter.region.najran',
  [DatasetRegion.AlBaha]: 'filter.region.al_baha',
  [DatasetRegion.AlJouf]: 'filter.region.al_jouf',
};

export function getTranslationKey(datasetString: string): string {
  return DatasetTranslationMap[datasetString] || datasetString; // Fallback guarantees UI doesn't visually break
}
