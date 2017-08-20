import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { TransactionsServiceProvider } from '../../providers/transactions-service/transactions-service';

@Component({
  selector: 'page-transactions',
  templateUrl: './transactions.html'
})
export class TransactionsPage {

  public transactions: any[];

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public transactionsService: TransactionsServiceProvider) {
    this.loadTransactions();
  }

  loadTransactions() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.transactionsService.load()
    .then(data => {
      this.transactions = data.reverse();

      loading.dismiss();
    });
  }

}
