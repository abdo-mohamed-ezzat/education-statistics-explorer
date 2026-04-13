export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';
export type Theme = 'light' | 'dark';

export interface UserPreferences {
  language: Language;
  direction: Direction;
  theme: Theme;
}
