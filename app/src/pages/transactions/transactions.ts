import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { TransactionsServiceProvider } from '../../providers/transactions-service/transactions-service';

@Component({
  selector: 'page-transactions',
  templateUrl: './transactions.html'
})
export class TransactionsPage {

  public allTransactions: any[];
  public visibleTransactions: any[];

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public transactionsService: TransactionsServiceProvider
  ) {
    this.loadTransactions();
  }

  public filterItems(ev: any) {
    const value = ev.target.value;
    this.setTransactions();

    if (value && value.trim() !== '') {
      this.visibleTransactions = this.visibleTransactions.filter((item) => {
        try {
          return item.Symbol.toLowerCase().includes(value.toLowerCase());
        } catch(err) {
          return false;
        }
      });
    }
  }

  private loadTransactions() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.transactionsService.load()
    .then(data => {
      this.allTransactions = data.reverse();
      this.setTransactions();

      loading.dismiss();
    });
  }

  private setTransactions() {
    this.visibleTransactions = this.allTransactions;
  }

}
