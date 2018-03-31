import { Component } from '@angular/core';
import { Api } from '../../../providers/api';
import {
  LoadingController,
  NavController,
  NavParams,
  PopoverController
} from 'ionic-angular';
import { SettingsServiceProvider } from '../../../providers/settings-service/settings-service';
import { TransactionsServiceProvider } from '../../../providers/transactions-service/transactions-service';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'page-create-transaction',
  templateUrl: './create-transaction.html'
})
export class CreateTransactionPage {
  public currencies;

  public transaction: {
    currency: string;
    date: string;
    fee: number;
    quantity: number;
    symbol: string;
    type: string;
    unitPrice: number;
  };

  public symbols;

  public transactionTypes = ['BUY', 'SELL'];

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    private api: Api,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public settingsService: SettingsServiceProvider,
    public transactionsService: TransactionsServiceProvider
  ) {
    this.currencies = settingsService.getCurrencies();
    this.api.getSymbols().subscribe((aSymbols) => {
      this.symbols = aSymbols;
    });
    this.transaction = {
      currency: 'USD',
      date: new Date().toISOString(),
      fee: 0,
      quantity: null,
      symbol: '',
      type: 'BUY',
      unitPrice: null
    };
  }

  public doCreate() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.transactionsService.post(this.transaction).then((data) => {
      loading.dismiss();

      this.navParams.get('parentPage').loadTransactions(true);

      this.navCtrl.pop();
    });
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
