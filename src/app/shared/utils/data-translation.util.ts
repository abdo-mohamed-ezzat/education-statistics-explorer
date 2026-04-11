export const DatasetTranslationMap: Record<string, string> = {
  // Genders
  'بنين': 'filter.gender.male',
  'بنات': 'filter.gender.female',
  // Stages
  'المرحلة الإبتدائية': 'filter.stage.primary',
  'المرحلة المتوسطة': 'filter.stage.intermediate',
  'المرحلة الثانوية': 'filter.stage.secondary',
  'رياض الأطفال': 'filter.stage.kindergarten',
  // Regions
  'الرياض': 'filter.region.riyadh',
  'مكة المكرمة': 'filter.region.makkah',
  'المدينة المنورة': 'filter.region.madinah',
  'الشرقية': 'filter.region.eastern_province',
  'عسير': 'filter.region.aseer',
  'القصيم': 'filter.region.qassim',
  'تبوك': 'filter.region.tabuk',
  'حائل': 'filter.region.hail',
  'الحدود الشمالية': 'filter.region.northern_borders',
  'جازان': 'filter.region.jazan',
  'نجران': 'filter.region.najran',
  'الباحة': 'filter.region.al_baha',
  'الجوف': 'filter.region.al_jouf',
};

export function getTranslationKey(datasetString: string): string {
  return DatasetTranslationMap[datasetString] || datasetString; // Fallback guarantees UI doesn't visually break
}
