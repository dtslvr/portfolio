import { Component, Inject } from '@angular/core';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import { ViewController } from 'ionic-angular';
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { Subject } from 'rxjs/Rx';
import * as store from 'store';

@Component({
  selector: 'navbar-menu',
  templateUrl: 'navbar-menu.html'
})
export class NavbarMenu {

  public isRedactedMode: boolean;
  public userId: string;

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    public settingsService: SettingsServiceProvider,
    public viewCtrl: ViewController
  ) {
    this.userId = store.get('userId');

    this.settingsService.getIsRedactedMode()
    .takeUntil(this.unsubscribeSubject.asObservable())
    .subscribe((isRedactedMode) => {
      this.isRedactedMode = isRedactedMode;
    });
  }

  private close() {
    this.viewCtrl.dismiss();
  }

  public logout() {
    store.remove('userId');
    window.location.replace(location.pathname);
  }

  public updateIsRedactedMode() {
    this.settingsService.toggleIsRedactedMode();
    this.close();
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

}
