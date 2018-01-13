import { registerLocaleData } from '@angular/common';
import localeDeCh from '@angular/common/locales/de-ch';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MyApp } from './app.component';
import { APP_CONFIG, AppConfig } from './app.config';
import { NavbarMenu } from '../components/navbar-menu/navbar-menu';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { PerformancePage } from '../pages/performance/performance';
import { PortfolioPage } from '../pages/portfolio/portfolio';
import { TabsPage } from '../pages/tabs/tabs';
import { TransactionsPage } from '../pages/transactions/transactions';
import { PortfolioServiceProvider } from '../providers/portfolio-service/portfolio-service';
import { SettingsServiceProvider } from '../providers/settings-service/settings-service';
import { TransactionsServiceProvider } from '../providers/transactions-service/transactions-service';

registerLocaleData(localeDeCh);

@NgModule({
  declarations: [
    MyApp,
    NavbarMenu,
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
    NavbarMenu,
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
    SettingsServiceProvider,
    TransactionsServiceProvider,
  ]
})
export class AppModule {}
