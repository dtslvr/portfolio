import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import * as store from 'store';

@Injectable()
export class SettingsServiceProvider {

  private chartDateRange: string;
  private currency: string;
  private isRedactedMode: boolean;
  private subjectChartDateRange = new BehaviorSubject<string>(null);
  private subjectCurrency = new BehaviorSubject<string>(null);
  private subjectIsRedactedMode = new BehaviorSubject<boolean>(null);

  constructor() {
    this.setChartDateRange(store.get('chartDateRange') || 'MAX');
    this.setCurrency(store.get('currency') || 'USD');
    this.setIsRedactedMode(store.get('isRedactedMode') || false);
  }

  public getChartDateRanges() {
    return [
      'YTD',
      '1Y',
      '5Y',
      'MAX'
    ];
  }

  public getCurrencies() {
    return [
      'CHF',
      'EUR',
      'USD'
    ];
  }

  public getChartDateRange() {
    return this.subjectChartDateRange.asObservable();
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

  public setChartDateRange(aChartDateRange) {
    store.set('chartDateRange', aChartDateRange);
    this.chartDateRange = store.get('chartDateRange');
    this.subjectChartDateRange.next(this.chartDateRange);
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
