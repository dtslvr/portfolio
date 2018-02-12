import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import * as store from 'store';

@Injectable()
export class SettingsServiceProvider {

  private currency: string;
  private isRedactedMode: boolean;
  private subjectCurrency = new BehaviorSubject<string>(null);
  private subjectIsRedactedMode = new BehaviorSubject<boolean>(null);

  constructor() {
    this.setIsRedactedMode(store.get('isRedactedMode') || false);
    this.setCurrency(store.get('currency') || 'USD');
  }

  public getCurrencies() {
    return [
      'CHF',
      'EUR',
      'USD'
    ];
  }

  public getCurrency() {
    return this.subjectCurrency.asObservable();
  }

  public getIsRedactedMode() {
    return this.subjectIsRedactedMode.asObservable();
  }

  public getUserId() {
    return store.get('userId');
  }

  public removeUserId() {
    store.remove('userId');
  }

  public setCurrency(aCurrency) {
    store.set('currency', aCurrency);
    this.currency = store.get('currency');
    this.subjectCurrency.next(this.currency);
  }

  public setIsRedactedMode(isRedactedMode) {
    store.set('isRedactedMode', isRedactedMode);
    this.isRedactedMode = store.get('isRedactedMode');
    this.subjectIsRedactedMode.next(this.isRedactedMode);
  }

  public setUserId(aUserId: string) {
    store.set('userId', aUserId.toLowerCase());
  }

  public toggleIsRedactedMode() {
    store.set('isRedactedMode', !this.isRedactedMode);
    this.isRedactedMode = store.get('isRedactedMode');
    this.subjectIsRedactedMode.next(this.isRedactedMode);
  }

}
