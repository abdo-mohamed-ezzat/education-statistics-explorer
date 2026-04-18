import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // APP_BASE_HREF = '/'  locally,  '/demo/education-statistics-explorer/'  on cPanel.
  // The --base-href build flag writes this value into index.html automatically.
  private baseHref = (inject(APP_BASE_HREF, { optional: true }) ?? '/').replace(/\/$/, '');

  getTranslation(lang: string) {
    const path = `${this.baseHref}/i18n/${lang}.json`;

    // On the server (SSR/Node), HttpClient requires an absolute URL.
    // We read the same PORT env var used by server.ts (defaults to 4000).
    const baseUrl = this.isBrowser
      ? ''
      : `http://localhost:${(typeof process !== 'undefined' && process.env?.['PORT']) || 4000}`;

    return this.http.get<Translation>(`${baseUrl}${path}`);
  }
}
