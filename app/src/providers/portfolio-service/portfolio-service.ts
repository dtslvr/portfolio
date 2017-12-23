import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';
import * as store from 'store';

/*
  Generated class for the PortfolioServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PortfolioServiceProvider {
  private backendUri: string;
  private data: any;

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    public http: Http
  ) {
    if (this.config.develMode) {
      this.backendUri = 'http://localhost:3000';
    } else {
      this.backendUri = this.config.backendUri;
    }
  }

  public getPerformanceSeries() {
    const performanceSeries = store.get('performanceSeries') || {};

    const returnValue = {
      data: [],
      labels: []
    };

    for (var key in performanceSeries) {
      returnValue.data.push(performanceSeries[key].price);
      returnValue.labels.push(moment(key, 'YYYYMMDD').toDate());
    }

    return returnValue;
  }

  public load(isForceLoad: boolean) {
    if (this.data && !isForceLoad) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise((resolve, reject) => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      // this.http.get('https://randomuser.me/api/?results=10')
      this.http.get(`${this.backendUri}/portfolio`)
        .map(res => res.json())
        .catch((error) => {
          reject(error.json());
          return Observable.empty();
        })
        .subscribe((data) => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;

          this.updatePerformanceSeries();

          resolve(this.data);
        });
    });
  }

  public updatePerformanceSeries() {
    const currentDay = moment().format('YYYYMMDD');
    const performanceSeries = store.get('performanceSeries') || {};
    performanceSeries[currentDay] = this.data.volume.price.allTime;
    store.set('performanceSeries', performanceSeries);
  }

}
