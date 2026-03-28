import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EducationDataService {
  private readonly http = inject(HttpClient);

  /**
   * Data is lazy-loaded on the first subscription, then cached for subsequent subscribers
   * using shareReplay(1).
   */
  private readonly masterCache$ = this.http.get<any[]>('datasets/edu-master.json').pipe(
    shareReplay(1)
  );

  private readonly summaryCache$ = this.http.get<any>('datasets/edu-summary.json').pipe(
    shareReplay(1)
  );

  private readonly recordsCache$ = this.http.get<any[]>('datasets/education-records.json').pipe(
    shareReplay(1)
  );

  public getMaster(): Observable<any[]> {
    return this.masterCache$;
  }

  public getSummary(): Observable<any> {
    return this.summaryCache$;
  }

  public getRecords(): Observable<any[]> {
    return this.recordsCache$;
  }
}
