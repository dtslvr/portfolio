import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html'
})
export class LandingPage {
  public account: { userId: string } = {
    userId: ''
  };

  constructor(
    private navCtrl: NavController,
    private settingsService: SettingsServiceProvider
  ) {}

  public doSignup() {
    this.settingsService.setUserId(this.account.userId);
    this.navCtrl.setRoot(TabsPage);
  }
}
