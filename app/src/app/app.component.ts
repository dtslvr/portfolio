import { Component } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import * as store from 'store';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(
    private router: Router,
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
  ) {
    this.router.events.subscribe((val) => {
      if (val instanceof RoutesRecognized) {
        const hasUser = store.get('userId') ? true: false;
        const userId = val.state.root.queryParams['userId'];

        if (userId) {
          store.set('userId', userId.toLowerCase());
          this.rootPage = TabsPage;
        } else if (hasUser) {
          this.rootPage = TabsPage;
        } else {
          this.rootPage = LandingPage;
        }
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

}
