import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly platformId = inject(PLATFORM_ID);
  
  /**
   * Signal indicating if we are running in a browser environment.
   * This is true on the client from the start, and false on the server.
   */
  public readonly isBrowser = signal(isPlatformBrowser(this.platformId));

  /**
   * Utility to check if we are on server.
   */
  public readonly isServer = signal(!isPlatformBrowser(this.platformId));
}
