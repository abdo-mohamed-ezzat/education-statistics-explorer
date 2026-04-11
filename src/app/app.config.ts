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
 * Client-side safety net: sets the active Transloco language from localStorage
 * BEFORE Angular bootstraps/hydrates, preventing any client-side flash if the
 * SSR-rendered language doesn't match the stored preference.
 *
 * Primary flash prevention is handled server-side via the `edu_lang` cookie
 * in `app.config.server.ts` — this initializer is the browser fallback.
 *
 * Reads only — PreferencesService.effect() is the single write source of truth
 * for both localStorage and the edu_lang cookie.
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
    // Browser-side safety net: aligns Transloco with stored preference before
    // any component mounts. The real flash elimination happens server-side via
    // the edu_lang cookie parsed in app.config.server.ts.
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslocoLang,
      deps: [TranslocoService],
      multi: true,
    },
    provideEchartsCore({ echarts }),
  ],
};
