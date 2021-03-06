import { Inject, Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Api } from '../api';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import { cloneDeep } from 'lodash';
import 'rxjs/add/operator/map';
import { SettingsServiceProvider } from '../settings-service/settings-service';

@Injectable()
export class TransactionsServiceProvider {
  private backendUri: string;
  private data: any;

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private api: Api,
    private http: Http,
    private settingsService: SettingsServiceProvider
  ) {
    if (this.config.develMode) {
      this.backendUri = 'http://localhost:3001';
    } else {
      this.backendUri = this.config.backendUri;
    }
  }

  public delete(aTransaction) {
    const options = new RequestOptions();
    options.headers = this.api.getHeaders();

    return new Promise((resolve) => {
      this.http
        .delete(`${this.backendUri}/transactions/${aTransaction.id}`, options)
        .map((res) => res.json())
        .subscribe((data) => {
          resolve(data);
        });
    });
  }

  public load(isForced = false) {
    if (this.data && !isForced) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    const options = new RequestOptions();
    options.headers = this.api.getHeaders();

    // don't have the data yet
    return new Promise((resolve) => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      // this.http.get('https://randomuser.me/api/?results=10')
      this.http
        .get(
          `${this.backendUri}/transactions/${this.settingsService.getUserId()}`,
          options
        )
        .map((res) => res.json())
        .subscribe((data) => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          resolve(this.data);
        });
    });
  }

  public post(aTransaction) {
    // Convert data (parse numbers)
    const transaction = cloneDeep(aTransaction);
    transaction.fee = parseFloat(transaction.fee);
    transaction.quantity = parseFloat(transaction.quantity);
    transaction.unitPrice = parseFloat(transaction.unitPrice);

    const options = new RequestOptions();
    options.headers = this.api.getHeaders();

    return new Promise((resolve) => {
      this.http
        .post(`${this.backendUri}/transactions`, transaction, options)
        .map((res) => res.json())
        .subscribe((data) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }
}
