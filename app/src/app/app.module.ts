import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { APP_CONFIG, AppConfig } from './app.config';

import { PerformancePage } from '../pages/performance/performance';
import { PortfolioPage } from '../pages/portfolio/portfolio';
import { TabsPage } from '../pages/tabs/tabs';
import { TransactionsPage } from '../pages/transactions/transactions';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PortfolioServiceProvider } from '../providers/portfolio-service/portfolio-service';
import { TransactionsServiceProvider } from '../providers/transactions-service/transactions-service';

@NgModule({
  declarations: [
    MyApp,
    PerformancePage,
    PortfolioPage,
    TabsPage,
    TransactionsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PerformancePage,
    PortfolioPage,
    TabsPage,
    TransactionsPage
  ],
  providers: [
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
      useValue: 'de-CH'
    },
    PortfolioServiceProvider,
    TransactionsServiceProvider
  ]
})
export class AppModule {}
