import { Inject, Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { APP_CONFIG, IAppConfig } from '../app/app.config';
import { BehaviorSubject } from 'rxjs/Rx';
import { SettingsServiceProvider } from './settings-service/settings-service';
import * as store from 'store';

/**
 * Api is a generic REST Api handler
 */
@Injectable()
export class Api {

  private backendUri: string;
  private subjectSymbols = new BehaviorSubject<any[]>(null);

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private http: Http,
    private settingsService: SettingsServiceProvider
  ) {
    if (this.config.develMode) {
      this.backendUri = 'http://localhost:3001';
    } else {
      this.backendUri = this.config.backendUri;
    }

    this.http.get(`${this.backendUri}/symbols`)
      .map(res => res.json())
      .subscribe((symbols) => {
        this.subjectSymbols.next(symbols);
      });
  }

  public getChart() {
    const params = new URLSearchParams();
    params.set('range', store.get('chartDateRange'));

    const options = new RequestOptions();
    options.headers = this.getHeaders();
    options.search = params;

    // don't have the data yet
    return new Promise((resolve) => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      this.http.get(`${this.backendUri}/chart/${this.settingsService.getUserId()}`, options)
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          resolve(data);
        });
    });
  }

  public getHeaders() {
    let headers = new Headers();
    headers.append('Currency', store.get('currency'));
    headers.append('User-Id', this.settingsService.getUserId());

    return headers;
  }

  public getSymbols() {
    return this.subjectSymbols.asObservable();
  }

}
