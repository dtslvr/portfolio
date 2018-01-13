import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import 'rxjs/add/operator/map';

@Injectable()
export class TransactionsServiceProvider {
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

  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      // this.http.get('https://randomuser.me/api/?results=10')
      this.http.get(`${this.backendUri}/transactions`)
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          resolve(this.data);
        });
    });
  }

}
