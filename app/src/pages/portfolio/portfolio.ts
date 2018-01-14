import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { LoadingController, NavController, ToastController } from 'ionic-angular';
import { sum, values } from 'lodash';
import { PortfolioServiceProvider } from '../../providers/portfolio-service/portfolio-service';

@Component({
  selector: 'page-portfolio',
  templateUrl: 'portfolio.html'
})
export class PortfolioPage {

  @ViewChild('doughnutCanvasAcquisition') doughnutCanvasAcquisition;
  @ViewChild('doughnutCanvasToday') doughnutCanvasToday;

  public mode = 'shares';

  private chartAquisition;
  private chartToday;
  private labels: any[];
  private portfolioSharesAcquisition: any[];
  private portfolioSharesToday: any[];
  private industriesMapAcquisition: any = {};
  private industriesMapToday: any = {};
  private sectorsMapAcquisition: any = {};
  private sectorsMapToday: any = {};
  private typesMapAcquisition: any = {};
  private typesMapToday: any = {};

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
      this.labels = data.quotes.map((obj) => {
        return obj.name;
      });
      this.portfolioSharesAcquisition = data.quotes.map((obj) => {
        return obj.portfolioShareAcquisition;
      });
      this.portfolioSharesToday = data.quotes.map((obj) => {
        return obj.portfolioShareToday;
      });

      data.quotes.forEach((obj) => {
        if (this.industriesMapAcquisition[obj.industry]) {
          this.industriesMapAcquisition[obj.industry] += (obj.quantity * obj.averagePrice);
        } else {
          this.industriesMapAcquisition[obj.industry] = (obj.quantity * obj.averagePrice);
        }

        if (this.industriesMapToday[obj.industry]) {
          this.industriesMapToday[obj.industry] += obj.price.today.portfolioMarketPrice;
        } else {
          this.industriesMapToday[obj.industry] = obj.price.today.portfolioMarketPrice;
        }

        if (this.sectorsMapAcquisition[obj.sector]) {
          this.sectorsMapAcquisition[obj.sector] += (obj.quantity * obj.averagePrice);
        } else {
          this.sectorsMapAcquisition[obj.sector] = (obj.quantity * obj.averagePrice);
        }

        if (this.sectorsMapToday[obj.sector]) {
          this.sectorsMapToday[obj.sector] += obj.price.today.portfolioMarketPrice;
        } else {
          this.sectorsMapToday[obj.sector] = obj.price.today.portfolioMarketPrice;
        }

        if (this.typesMapAcquisition[obj.type]) {
          this.typesMapAcquisition[obj.type] += (obj.quantity * obj.averagePrice);
        } else {
          this.typesMapAcquisition[obj.type] = (obj.quantity * obj.averagePrice);
        }

        if (this.typesMapToday[obj.type]) {
          this.typesMapToday[obj.type] += obj.price.today.portfolioMarketPrice;
        } else {
          this.typesMapToday[obj.type] = obj.price.today.portfolioMarketPrice;
        }
      });

      this.onChangeMode();

      loading.dismiss();
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

  private getChartFooter(anId, tooltipItems, data) {
    if (anId === 'shares-today') {
      const dataset = data.datasets[0];
      const valueInPercentageToday = dataset.data[tooltipItems[0].index];
      const valueInPercentageAcquisition = this.portfolioSharesAcquisition[tooltipItems[0].index];
      return [
        `Today: ${(valueInPercentageToday*100).toFixed(2)}%`,
        `Acquisition: ${(valueInPercentageAcquisition*100).toFixed(2)}%`,
        `Difference: ${((valueInPercentageToday-valueInPercentageAcquisition)*100).toFixed(2)}%`
      ];
    } else if (anId.includes('types')) {
      const label = Object.keys(this.typesMapToday)[tooltipItems[0].index];
      const valueAcquisition = this.typesMapAcquisition[label].toFixed(2);
      const valueToday = this.typesMapToday[label].toFixed(2);
      const totalAcquisition = sum(values(this.typesMapAcquisition));
      const totalToday = sum(values(this.typesMapToday));
      const valueInPercentageAcquisition = (valueAcquisition/totalAcquisition*100);
      const valueInPercentageToday: number = (valueToday/totalToday*100);
      return [
        `Today: ${valueInPercentageToday.toFixed(2)}%`,
        `Acquisition: ${valueInPercentageAcquisition.toFixed(2)}%`,
        `Difference: ${((valueInPercentageToday-valueInPercentageAcquisition)).toFixed(2)}%`
      ];
    } else if (anId.includes('industries')) {
      const label = Object.keys(this.industriesMapToday)[tooltipItems[0].index];
      const valueAcquisition = this.industriesMapAcquisition[label].toFixed(2);
      const valueToday = this.industriesMapToday[label].toFixed(2);
      const totalAcquisition = sum(values(this.industriesMapAcquisition));
      const totalToday = sum(values(this.industriesMapToday));
      const valueInPercentageAcquisition = (valueAcquisition/totalAcquisition*100);
      const valueInPercentageToday = (valueToday/totalToday*100);
      return [
        `Today: ${valueInPercentageToday.toFixed(2)}%`,
        `Acquisition: ${valueInPercentageAcquisition.toFixed(2)}%`,
        `Difference: ${((valueInPercentageToday-valueInPercentageAcquisition)).toFixed(2)}%`
      ];
    } else if (anId.includes('sectors')) {
      const label = Object.keys(this.sectorsMapToday)[tooltipItems[0].index];
      const valueAcquisition = this.sectorsMapAcquisition[label].toFixed(2);
      const valueToday = this.sectorsMapToday[label].toFixed(2);
      const totalAcquisition = sum(values(this.sectorsMapAcquisition));
      const totalToday = sum(values(this.sectorsMapToday));
      const valueInPercentageAcquisition = (valueAcquisition/totalAcquisition*100);
      const valueInPercentageToday = (valueToday/totalToday*100);
      return [
        `Today: ${valueInPercentageToday.toFixed(2)}%`,
        `Acquisition: ${valueInPercentageAcquisition.toFixed(2)}%`,
        `Difference: ${((valueInPercentageToday-valueInPercentageAcquisition)).toFixed(2)}%`
      ];
    } else {
      return '';
    }
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
    return (id.includes('acquisition')) ? 50 : 60;
  }

  private initializeChart(id, element, labels, data) {
    return new Chart(element, {
      type: 'doughnut',
      data: {
        labels,
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
          display: false
        },
        tooltips: {
          callbacks: {
            label: (tooltipItems, data) => {
              return data.labels[tooltipItems.index];
            },
            footer: (tooltipItems, data) => {
              return this.getChartFooter(id, tooltipItems, data);
            }
          }
        }
      }
    });
  }

  public onChangeMode() {
    console.log(`The mode has changed to ${this.mode}`);

    if (this.chartAquisition) {
      this.chartAquisition.destroy();
    }

    if (this.chartToday) {
      this.chartToday.destroy();
    }

    if (this.mode === 'shares') {
      this.chartAquisition = this.initializeChart(this.mode + '-acquisition', this.doughnutCanvasAcquisition.nativeElement, this.labels, this.portfolioSharesAcquisition);
      this.chartToday = this.initializeChart(this.mode + '-today', this.doughnutCanvasToday.nativeElement, this.labels, this.portfolioSharesToday);
    } else if (this.mode === 'types') {
      this.chartAquisition = this.initializeChart(this.mode + '-acquisition', this.doughnutCanvasAcquisition.nativeElement, Object.keys(this.typesMapAcquisition), values(this.typesMapAcquisition));
      this.chartToday = this.initializeChart(this.mode + '-today', this.doughnutCanvasToday.nativeElement, Object.keys(this.typesMapToday), values(this.typesMapToday));
    } else if (this.mode === 'industries') {
      this.chartAquisition = this.initializeChart(this.mode + '-acquisition', this.doughnutCanvasAcquisition.nativeElement, Object.keys(this.industriesMapAcquisition), values(this.industriesMapAcquisition));
      this.chartToday = this.initializeChart(this.mode + '-today', this.doughnutCanvasToday.nativeElement, Object.keys(this.industriesMapToday), values(this.industriesMapToday));
    } else if (this.mode === 'sectors') {
      this.chartAquisition = this.initializeChart(this.mode + '-acquisition', this.doughnutCanvasAcquisition.nativeElement, Object.keys(this.sectorsMapAcquisition), values(this.sectorsMapAcquisition));
      this.chartToday = this.initializeChart(this.mode + '-today', this.doughnutCanvasToday.nativeElement, Object.keys(this.sectorsMapToday), values(this.sectorsMapToday));
    }
  }

}
