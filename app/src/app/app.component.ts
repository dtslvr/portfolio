import { Component } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingsServiceProvider } from '../providers/settings-service/settings-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(
    private router: Router,
    private platform: Platform,
    private settingsService: SettingsServiceProvider,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
  ) {
    const hasUser = this.settingsService.getUserId() ? true : false;

    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.router.events.subscribe((val) => {
        if (val instanceof RoutesRecognized) {
          const userId = val.state.root.queryParams['userId'];

          if (userId) {
            this.settingsService.setUserId(userId);
            this.rootPage = TabsPage;
          } else if (hasUser) {
            this.rootPage = TabsPage;
          } else {
            this.rootPage = LandingPage;
          }
        }
      });
    } else if (hasUser) {
      this.rootPage = TabsPage;
    } else {
      this.rootPage = LandingPage;
    }

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

}
