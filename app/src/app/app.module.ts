import { registerLocaleData } from '@angular/common';
import { appRoutingProviders, routing } from './app.routes';
import localeDeCh from '@angular/common/locales/de-ch';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MyApp } from './app.component';
import { APP_CONFIG, AppConfig } from './app.config';
import { NavbarMenu } from '../components/navbar-menu/navbar-menu';
import { CountUpModule } from 'countup.js-angular2';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LandingPage } from '../pages/landing/landing';
import { PerformancePage } from '../pages/performance/performance';
import { PortfolioPage } from '../pages/portfolio/portfolio';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';
import { CreateTransactionPage } from '../pages/transactions/create-transaction/create-transaction';
import { TransactionsPage } from '../pages/transactions/transactions';
import { PortfolioServiceProvider } from '../providers/portfolio-service/portfolio-service';
import { SettingsServiceProvider } from '../providers/settings-service/settings-service';
import { TransactionsServiceProvider } from '../providers/transactions-service/transactions-service';
import { Api } from '../providers/api';
import * as store from 'store';

registerLocaleData(localeDeCh);

@NgModule({
  declarations: [
    CreateTransactionPage,
    LandingPage,
    MyApp,
    NavbarMenu,
    PerformancePage,
    PortfolioPage,
    SettingsPage,
    TabsPage,
    TransactionsPage
  ],
  imports: [
    BrowserModule,
    CountUpModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    routing
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CreateTransactionPage,
    LandingPage,
    MyApp,
    NavbarMenu,
    PerformancePage,
    PortfolioPage,
    SettingsPage,
    TabsPage,
    TransactionsPage
  ],
  providers: [
    Api,
    appRoutingProviders,
    StatusBar,
    SplashScreen,
    {
      provide: APP_CONFIG,
      useValue: AppConfig
    },
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    {
      // set default locale (for pipes: date, currency)
      provide: LOCALE_ID,
      useValue: store.get('currency') === 'CHF' ? 'de-CH' : 'en-US'
    },
    PortfolioServiceProvider,
    SettingsServiceProvider,
    TransactionsServiceProvider,
  ]
})
export class AppModule {}
