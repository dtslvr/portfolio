import { Component, Inject, ViewChild } from '@angular/core';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import { Chart } from 'chart.js';
import { NavbarMenu } from '../../components/navbar-menu/navbar-menu'
import { LoadingController, NavController, PopoverController, ToastController } from 'ionic-angular';
import { PortfolioServiceProvider } from '../../providers/portfolio-service/portfolio-service';
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'page-performance',
  templateUrl: 'performance.html',
  providers: [PortfolioServiceProvider]
})
export class PerformancePage {

  @ViewChild('lineCanvasPerformanceSeries') lineCanvasPerformanceSeries;

  public TREND_EQUAL_THRESHOLD = 0.001; // 0.1%

  public isRedactedMode: boolean;
  public mode = 'today';
  public quotes: any;
  public volume: any;

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public portfolioService: PortfolioServiceProvider,
    public settingsService: SettingsServiceProvider,
    public toastCtrl: ToastController
  ) {
    this.settingsService.getIsRedactedMode()
    .takeUntil(this.unsubscribeSubject.asObservable())
    .subscribe((isRedactedMode) => {
      this.isRedactedMode = isRedactedMode;
    });
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
  }

  ionViewDidEnter() {
    this.loadPerformance();
  }

  public doRefresh(refresher) {
    this.portfolioService.load(true)
    .then(data => {
      this.quotes = data.quotes;
      this.volume = data.volume;

      this.initializeChart();
    })
    .catch((error) => {
      this.showError(error);
    })
    .then(() => {
      // finally
      refresher.complete();
    });
  }

  private initializeChart() {
    const performanceSeries = this.portfolioService.getPerformanceSeries();

    const lineChart = this.lineCanvasPerformanceSeries.nativeElement.getContext('2d');

    const gradientBackground = lineChart.createLinearGradient(0, 0, 0, 200);
    gradientBackground.addColorStop(0, 'rgba(72, 138, 255, 0.7)');
    gradientBackground.addColorStop(1, 'rgba(72, 138, 255, 0)');

    const gradientStroke = lineChart.createLinearGradient(0, 0, screen.width, 0);
    gradientStroke.addColorStop(0, 'rgba(72, 138, 255, 0.5)');
    gradientStroke.addColorStop(1, 'rgba(72, 138, 255, 1)');

    new Chart(this.lineCanvasPerformanceSeries.nativeElement, {
      type: 'line',
      data: {
        labels: performanceSeries.labels,
        datasets: [
          {
            backgroundColor: gradientBackground,
            borderColor: gradientStroke,
            data: performanceSeries.data
          }
        ]
      },
      options: {
        elements: {
          line : {
            tension : 0
          },
          point: {
            radius: 0
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              color: 'rgba(0, 0, 0, 0.075)',
              display: true,
              drawBorder: false
            },
            ticks: {
              fontColor: 'rgba(0, 0, 0, 0.15)',
              fontSize: 10
            },
            position: 'top',
            type: 'time',
            time: {
              displayFormats: {
                quarter: 'MMM YYYY'
              },
            }
          }],
          yAxes: [{
            display: false
          }]
        }
      }
    });
  }

  private loadPerformance() {
    const loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.portfolioService.load(false)
    .then(data => {
      this.quotes = data.quotes;
      this.volume = data.volume;

      this.initializeChart();

      loading.dismiss();
    })
    .catch((error) => {
      this.showError(error);

      loading.dismiss();
    });
  }

  public openChart(aChart) {
    window.open(`http://finance.yahoo.com/quote/${aChart.symbol}/chart`, '_blank');
  }

  public showNavbarMenu(aEvent) {
    const popover = this.popoverCtrl.create(NavbarMenu);
    popover.present({
      ev: aEvent
    });
  }

  private showError(error) {
    const toast = this.toastCtrl.create({
      message: `Error: ${error.message}`,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
