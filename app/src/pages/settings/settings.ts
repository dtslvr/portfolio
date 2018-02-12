import { Component } from '@angular/core';
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  public currencies;
  public isRedactedMode: boolean;
  public settings: {
    currency: string
  } = {
    currency: null
  };
  public userId: string;

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    private settingsService: SettingsServiceProvider
  ) {
    this.currencies = this.settingsService.getCurrencies();

    this.settingsService.getCurrency()
    .takeUntil(this.unsubscribeSubject.asObservable())
    .subscribe((aCurrency) => {
      this.settings.currency = aCurrency;
    });

    this.settingsService.getIsRedactedMode()
    .takeUntil(this.unsubscribeSubject.asObservable())
    .subscribe((isRedactedMode) => {
      this.isRedactedMode = isRedactedMode;
    });

    this.userId = settingsService.getUserId();
  }

  public updateCurrency() {
    this.settingsService.setCurrency(this.settings.currency);
    window.location.reload();
  }

  public updateIsRedactedMode() {
    this.settingsService.toggleIsRedactedMode();
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

}
