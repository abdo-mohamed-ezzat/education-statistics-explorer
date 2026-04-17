import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getTranslation(lang: string) {
    const path = `/i18n/${lang}.json`;

    // On the server (SSR/Node), HttpClient requires an absolute URL.
    // We read the same PORT env var used by server.ts (defaults to 4000).
    const baseUrl = this.isBrowser
      ? ''
      : `http://localhost:${(typeof process !== 'undefined' && process.env?.['PORT']) || 4000}`;

    return this.http.get<Translation>(`${baseUrl}${path}`);
  }
}
