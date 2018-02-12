import { Inject, Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
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
      this.backendUri = 'http://localhost:3000';
    } else {
      this.backendUri = this.config.backendUri;
    }

    this.http.get(`${this.backendUri}/symbols`)
      .map(res => res.json())
      .subscribe((symbols) => {
        this.subjectSymbols.next(symbols);
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
