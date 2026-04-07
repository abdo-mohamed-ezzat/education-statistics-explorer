import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { EducationMasterData, EducationRecordData, EducationSummaryData } from '../models/education-data.model';
import { GeoJsonFeatureCollection } from '../models/geojson.model';

@Injectable({
  providedIn: 'root'
})
export class EducationDataService {
  private readonly http = inject(HttpClient);

  /**
   * Data is lazy-loaded on the first subscription, then cached for subsequent subscribers
   * using shareReplay(1).
   */
  private readonly masterCache$ = this.http.get<EducationMasterData[]>('datasets/edu-master.json').pipe(
    shareReplay(1)
  );

  private readonly summaryCache$ = this.http.get<EducationSummaryData>('datasets/edu-summary.json').pipe(
    shareReplay(1)
  );

  private readonly recordsCache$ = this.http.get<EducationRecordData[]>('datasets/education-records.json').pipe(
    shareReplay(1)
  );

  private readonly geoJsonCache$ = this.http.get<GeoJsonFeatureCollection>('datasets/saudi-arabia.geojson').pipe(
    shareReplay(1)
  );

  public getMaster(): Observable<EducationMasterData[]> {
    return this.masterCache$;
  }

  public getSummary(): Observable<EducationSummaryData> {
    return this.summaryCache$;
  }

  public getRecords(): Observable<EducationRecordData[]> {
    return this.recordsCache$;
  }

  public getSaudiGeoJson(): Observable<GeoJsonFeatureCollection> {
    return this.geoJsonCache$;
  }
}
