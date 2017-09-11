import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { LoadingController, NavController, ToastController } from 'ionic-angular';
import { PortfolioServiceProvider } from '../../providers/portfolio-service/portfolio-service';

@Component({
  selector: 'page-portfolio',
  templateUrl: 'portfolio.html'
})
export class PortfolioPage {

  @ViewChild('doughnutCanvasAcquisition') doughnutCanvasAcquisition;
  @ViewChild('doughnutCanvasToday') doughnutCanvasToday;

  public doughnutChartAcquisition: any;
  public doughnutChartToday: any;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public portfolioService: PortfolioServiceProvider,
    public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.loadPortfolio();
  }

  private loadPortfolio() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.portfolioService.load(false)
    .then((data) => {
      const symbols = data.quotes.map((obj) => {
        return obj.symbol;
      });
      const portfolioSharesAcquisition = data.quotes.map((obj) => {
        return obj.portfolioShareAcquisition;
      });
      const portfolioSharesToday = data.quotes.map((obj) => {
        return obj.portfolioShareToday;
      });

      loading.dismiss();

      this.initializeChart('acquisition', this.doughnutCanvasAcquisition.nativeElement, symbols, portfolioSharesAcquisition);
      this.initializeChart('today', this.doughnutCanvasToday.nativeElement, symbols, portfolioSharesToday);
    })
    .catch((error) => {
      let toast = this.toastCtrl.create({
        message: `Error: ${error.message}`,
        duration: 3000,
        position: 'bottom'
      });
      toast.present();

      loading.dismiss();
    });
  }

  /**
   * Color palette, inspired by https://yeun.github.io/open-color
   */
  private getColorPalette() {
    //
    return [
      '#329af0', // blue 5
      '#20c997', // teal 5
      '#94d82d', // lime 5
      '#ff922b', // orange 5
      '#f06595', // pink 5
      '#845ef7', // violet 5
      '#5c7cfa', // indigo 5
      '#22b8cf', // cyan 5
      '#51cf66', // green 5
      '#fcc419', // yellow 5
      '#ff6b6b', // red 5
      '#cc5de8'  // grape 5
    ];
  }

  private getCutoutPercentage(id) {
    return (id === 'acquisition') ? 50 : 60;
  }

  private initializeChart(id, element, symbols, data) {
    new Chart(element, {
      type: 'doughnut',
      data: {
        labels: symbols,
        datasets: [{
          data: data,
          backgroundColor: this.getColorPalette()
        }]
      },
      options: {
        cutoutPercentage: this.getCutoutPercentage(id),
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        legend: {
          position: 'bottom'
        },
        tooltips: {
          callbacks: {
            label: (tooltipItems, data) => {
              const label = data.labels[tooltipItems.index];
              const dataset = data.datasets[tooltipItems.datasetIndex];
              const currentValue = dataset.data[tooltipItems.index];

              return `${label}: ${(currentValue*100).toFixed(2)}%`;
            }
          }
        }
      }
    });
  }

}
