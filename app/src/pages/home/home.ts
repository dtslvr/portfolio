import { Component } from '@angular/core';
import { LoadingController, NavController, ToastController } from 'ionic-angular';
import { PortfolioServiceProvider } from '../../providers/portfolio-service/portfolio-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [PortfolioServiceProvider]
})
export class HomePage {

  public TREND_EQUAL_THRESHOLD = 0.001; // 0.1%

  public mode = 'today';
  public quotes: any;
  public volume: any;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public portfolioService: PortfolioServiceProvider,
    public toastCtrl: ToastController
  ) {
  }

  ionViewDidLoad() {
    // listen to the service worker promise in index.html to see if there has been a new update.
    // condition: the service-worker.js needs to have some kind of change - e.g. increment CACHE_VERSION.
    window['isUpdateAvailable']
      .then(isAvailable => {
        if (isAvailable) {
          const toast = this.toastCtrl.create({
            message: 'New Update available! Please Reload the webapp to see the latest changes.',
            position: 'bottom',
            showCloseButton: true
          });
          toast.present();
        }
      });

    this.loadPortfolio();
  }

  loadPortfolio() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.portfolioService.load()
    .then(data => {
      this.quotes = data.quotes;
      this.volume = data.volume;

      loading.dismiss();
    });
  }
}
