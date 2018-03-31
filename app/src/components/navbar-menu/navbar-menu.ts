import { Component, Inject } from '@angular/core';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import { NavController, ViewController } from 'ionic-angular';
import { SettingsPage } from '../../pages/settings/settings';
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { Subject } from 'rxjs/Rx';
import * as store from 'store';

@Component({
  selector: 'navbar-menu',
  templateUrl: 'navbar-menu.html'
})
export class NavbarMenu {
  public userId: string;
  public version: string;

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    private navCtrl: NavController,
    private settingsService: SettingsServiceProvider,
    private viewCtrl: ViewController
  ) {
    this.userId = this.settingsService.getUserId();
    this.version = this.config.version;
  }

  private close() {
    this.viewCtrl.dismiss();
  }

  public goToSettingsPage() {
    this.navCtrl.push(SettingsPage);
    this.close();
  }

  public logout() {
    store.remove('performanceSeries');
    this.settingsService.removeUserId();
    window.location.reload();
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
