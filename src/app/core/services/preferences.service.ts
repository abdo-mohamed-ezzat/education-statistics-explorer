import { Injectable, signal, effect, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { Language, Direction, Theme, UserPreferences } from '../models/user-preferences.model';
import { LANG_COOKIE } from '../tokens/lang-cookie.token';

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
  private readonly langCookie = inject(LANG_COOKIE, { optional: true });

  private readonly state = signal<UserPreferences>(this.loadInitialPreferences());

  public readonly language = computed(() => this.state().language);
  public readonly direction = computed(() => this.state().direction);
  public readonly theme = computed(() => this.state().theme);

  constructor() {
    effect(() => {
      const prefs = this.state();

      if (this.isBrowser) {
        // --- Single source of truth for ALL persistence writes ---
        // 1. Persist to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

        // 2. Sync the edu_lang cookie so the next SSR request renders the
        //    correct language without a flash. SameSite=Strict prevents CSRF.
        document.cookie = `edu_lang=${prefs.language}; path=/; SameSite=Strict; max-age=31536000`;

        // 3. Apply direction and language to DOM
        document.documentElement.setAttribute('dir', prefs.direction);
        document.documentElement.lang = prefs.language;

        // 4. Apply theme to DOM
        if (prefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Keep Transloco in sync on runtime language changes.
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

  /**
   * Determines the initial preferences using the correct source for the platform:
   * - Server: use the `edu_lang` cookie value injected via DI (no localStorage)
   * - Browser: read from localStorage, fall back to browser language
   */
  private loadInitialPreferences(): UserPreferences {
    if (!this.isBrowser) {
      // Server: trust the cookie-based language injected by app.config.server.ts
      const serverLang = (this.langCookie === 'ar' || this.langCookie === 'en')
        ? this.langCookie
        : DEFAULT_PREFERENCES.language;
      return {
        ...DEFAULT_PREFERENCES,
        language: serverLang as Language,
        direction: serverLang === 'en' ? 'ltr' : 'rtl',
      };
    }

    // Browser: read from localStorage
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

    // Fall back to browser preferred language
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

