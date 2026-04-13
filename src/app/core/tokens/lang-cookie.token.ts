import { InjectionToken } from '@angular/core';

/**
 * Carries the preferred language parsed from the `edu_lang` cookie
 * on the server side into Angular's DI system.
 *
 * Provided in `app.config.server.ts` only.
 * Falls back to `null` on the browser (the service reads localStorage instead).
 */
export const LANG_COOKIE = new InjectionToken<string | null>('LANG_COOKIE', {
  providedIn: 'root',
  factory: () => null,
});
