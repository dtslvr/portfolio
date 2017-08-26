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
  public mode = 'Today';

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

    this.portfolioService.load()
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

      this.doughnutChartAcquisition = this.getChart(this.doughnutCanvasAcquisition.nativeElement, symbols, portfolioSharesAcquisition);
      this.doughnutChartToday = this.getChart(this.doughnutCanvasToday.nativeElement, symbols, portfolioSharesToday);
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

  private getChart(element, symbols, data) {
    return new Chart(element, {
      type: 'doughnut',
      data: {
        labels: symbols,
        datasets: [{
          label: '# of Votes',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(100, 25, 100, 0.2)',
            'rgba(54, 88, 200, 0.2)',
            'rgba(235, 206, 90, 0.2)'
          ]/*,
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]*/
        }]
      },
      options: {
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
