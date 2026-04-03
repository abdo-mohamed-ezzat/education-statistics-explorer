import { Injectable, signal, effect, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { Language, Direction, Theme, UserPreferences } from '../models/user-preferences.model';

const STORAGE_KEY = 'edu_stats_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'ar',
  direction: 'rtl',
  theme: 'light',
};

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly state = signal<UserPreferences>(this.loadFromStorage());

  public readonly language = computed(() => this.state().language);
  public readonly direction = computed(() => this.state().direction);
  public readonly theme = computed(() => this.state().theme);

  constructor() {
    effect(() => {
      const prefs = this.state();
      
      if (this.isBrowser) {
        // Persist to single source of truth (edu_stats_preferences)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        
        // Apply direction and language to DOM
        document.documentElement.setAttribute('dir', prefs.direction);
        document.documentElement.lang = prefs.language;

        // Apply theme to DOM
        if (prefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Keep Transloco in sync on runtime language changes.
      // (Initial boot lang is set by APP_INITIALIZER in app.config.ts before
      //  any component renders, preventing the Arabic → English flicker.)
      this.transloco.setActiveLang(prefs.language);
    });
  }

  public setLanguage(lang: Language): void {
    this.state.update(state => ({
      ...state,
      language: lang,
      direction: lang === 'ar' ? 'rtl' : 'ltr'
    }));
  }

  public toggleTheme(): void {
    this.state.update(state => ({
      ...state,
      theme: state.theme === 'light' ? 'dark' : 'light'
    }));
  }

  private loadFromStorage(): UserPreferences {
    if (!this.isBrowser) {
      return DEFAULT_PREFERENCES;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>;
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed
        };
      } catch (e) {
        console.error('Failed to parse stored preferences', e);
      }
    }
    
    // Check browser preferred language if no storage
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') {
      return {
        ...DEFAULT_PREFERENCES,
        language: 'en',
        direction: 'ltr'
      };
    }

    return DEFAULT_PREFERENCES;
  }
}
