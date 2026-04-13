import { mergeApplicationConfig, ApplicationConfig, REQUEST } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { LANG_COOKIE } from './core/tokens/lang-cookie.token';

/**
 * Parses the `edu_lang` cookie value from a raw `Cookie` header string.
 * Only accepts 'ar' or 'en' to prevent injection of unexpected values.
 */
function parseLangCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = /(?:^|;\s*)edu_lang=([^;]+)/.exec(cookieHeader);
  if (!match) return null;
  const value = decodeURIComponent(match[1]).trim();
  return value === 'ar' || value === 'en' ? value : null;
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: LANG_COOKIE,
      useFactory: (request: Request | null) => {
        const cookieHeader = request?.headers?.get('cookie');
        return parseLangCookie(cookieHeader);
      },
      deps: [REQUEST],
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

