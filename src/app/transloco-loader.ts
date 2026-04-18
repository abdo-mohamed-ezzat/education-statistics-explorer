import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getTranslation(lang: string) {
    if (this.isBrowser) {
      // 1. Browser Mode (Client-Side)
      // We use a strictly RELATIVE path (no leading slash).
      // The browser will automatically attach this to the <base href> in index.html!
      return this.http.get<Translation>(`i18n/${lang}.json`);
    } else {
      // 2. SSR Mode (Server-Side)
      // Node.js HTTP Client requires an Absolute URL.
      // We hardcode the exact path to hit our native server wrapper.
      const port = (typeof process !== 'undefined' && process.env?.['PORT']) || 4000;
      const subfolder = '/demo/education-statistics-explorer';
      return this.http.get<Translation>(`http://localhost:${port}${subfolder}/i18n/${lang}.json`);
    }
  }
}
