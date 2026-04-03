import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import { echarts } from './core/charts/echarts.config';
import { provideEchartsCore } from 'ngx-echarts';

/**
 * Reads the persisted language from localStorage before Angular bootstraps.
 * This is the single source of truth initializer that prevents the Transloco
 * flicker (Arabic → English) by setting the active lang synchronously before
 * any component renders.
 */
function initTranslocoLang(transloco: TranslocoService) {
  return () => {
    try {
      const stored = localStorage.getItem('edu_stats_preferences');
      if (stored) {
        const prefs = JSON.parse(stored) as { language?: string };
        if (prefs?.language) {
          transloco.setActiveLang(prefs.language);
          return;
        }
      }
      // Fall back to browser language
      const browserLang = navigator.language.split('-')[0];
      transloco.setActiveLang(browserLang === 'ar' ? 'ar' : 'en');
    } catch {
      transloco.setActiveLang('en');
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: ['ar', 'en'],
        // Neutral default — overridden immediately by the APP_INITIALIZER below
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale(),
    // Single source of truth: read edu_stats_preferences and set Transloco lang
    // BEFORE any component renders, eliminating the ar → en flicker.
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslocoLang,
      deps: [TranslocoService],
      multi: true,
    },
    provideEchartsCore({ echarts }),
  ],
};
