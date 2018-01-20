import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import * as store from 'store';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})
export class LandingPage {

  public account: { userId: string } = {
    userId: ''
  };

  constructor(
    public navCtrl: NavController
  ) {
  }

  public doSignup() {
    store.set('userId', this.account.userId.toLowerCase());
    this.navCtrl.setRoot(TabsPage);
  }

}
