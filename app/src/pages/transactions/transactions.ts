import { Component } from '@angular/core';
import { LoadingController, NavController, PopoverController } from 'ionic-angular';
import * as moment from 'moment';
import { NavbarMenu } from '../../components/navbar-menu/navbar-menu'
import { SettingsServiceProvider } from '../../providers/settings-service/settings-service';
import { TransactionsServiceProvider } from '../../providers/transactions-service/transactions-service';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'page-transactions',
  templateUrl: './transactions.html'
})
export class TransactionsPage {

  public allTransactions: any[];
  public baseCurrencySymbol: string;
  public isRedactedMode: boolean;
  public totalBuy: number;
  public totalFee: number;
  public totalSell: number;
  public totalTransactions: number;
  public visibleTransactions: any[];

  private unsubscribeSubject: Subject<void> = new Subject<void>();

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public settingsService: SettingsServiceProvider,
    public transactionsService: TransactionsServiceProvider
  ) {
    this.settingsService.getIsRedactedMode()
    .takeUntil(this.unsubscribeSubject.asObservable())
    .subscribe((isRedactedMode) => {
      this.isRedactedMode = isRedactedMode;
    });

    this.loadTransactions();
  }

  private calculateTotalBuy() {
    this.totalBuy = 0;
    this.visibleTransactions.forEach((transactionGroup) => {
      transactionGroup.filter((transaction) => transaction.type === 'BUY')
      .forEach((transaction) => {
        this.totalBuy += transaction.baseCurrency.total;
      });
    });
  }

  private calculateTotalFee() {
    this.totalFee = 0;
    this.visibleTransactions.forEach((transactionGroup) => {
      transactionGroup.forEach((transaction) => {
        this.totalFee += transaction.baseCurrency.fee;
        this.baseCurrencySymbol = transaction.baseCurrency.currencySymbol
      });
    });
  }

  private calculateTotalSell() {
    this.totalSell = 0;
    this.visibleTransactions.forEach((transactionGroup) => {
      transactionGroup.filter((transaction) => transaction.type === 'SELL')
      .forEach((transaction) => {
        this.totalSell += transaction.baseCurrency.total;
      });
    });
  }

  private calculateTotalTransactions() {
    this.totalTransactions = 0;
    this.visibleTransactions.forEach((transactionGroup) => {
      transactionGroup.filter((transaction) => transaction.type === 'BUY'
        || transaction.type === 'SELL')
      .forEach((transaction) => {
        this.totalTransactions += 1;
      });
    });
  }

  public filterItems(ev: any) {
    const value = ev.target.value;

    if (value && value.trim() !== '') {
      const filteredTransactions = this.allTransactions.filter((transaction) => {
        try {
          return transaction.symbol.toLowerCase().includes(value.toLowerCase()) ||
            transaction.type.toLowerCase().includes(value.toLowerCase())
        } catch(err) {
          return false;
        }
      });

      this.setTransactions(this.groupTransactions(filteredTransactions));
    } else {
      this.setTransactions(this.groupTransactions(this.allTransactions));
    }
  }

  public formatDate(aDateString: string) {
    return moment(aDateString, 'YYYYMMDD').format('DD.MM.YYYY');
  }

  private groupTransactions(transactions: any[]) {
    let currentDay;

    const groupedTransactions = [];
    let currentIndex = -1;

    transactions.forEach((transaction) => {
      transaction.day = moment(transaction.date).format('YYYYMMDD');

      if (currentDay !== transaction.day) {
        groupedTransactions.push([transaction]);
        currentIndex++;
      } else {
        groupedTransactions[currentIndex].push(transaction);
      }

      currentDay = transaction.day;
    });

    return groupedTransactions.reverse();
  }

  private loadTransactions() {
    let loading = this.loadingCtrl.create({
      cssClass: 'clear'
    });

    loading.present();

    this.transactionsService.load()
    .then(data => {
      this.allTransactions = data;

      this.setTransactions(this.groupTransactions(this.allTransactions));

      loading.dismiss();
    });
  }

  private setTransactions(groupedTransactions: any[]) {
    this.visibleTransactions = groupedTransactions;
    this.updateSummary();
  }

  public showNavbarMenu(myEvent) {
    let popover = this.popoverCtrl.create(NavbarMenu);
    popover.present({
      ev: myEvent
    });
  }

  private updateSummary() {
    this.calculateTotalBuy();
    this.calculateTotalFee();
    this.calculateTotalSell();
    this.calculateTotalTransactions();
  }

  /**
   * Clean up
   */
  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

}
