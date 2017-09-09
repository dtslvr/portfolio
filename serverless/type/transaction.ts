import { ITransaction } from '../service/interfaces/interfaces';
import { TransactionType } from './transaction-type';

export class Transaction {

  private currency: string;
  private date: string;
  private quantity: number;
  private symbol: string;
  private total: number;
  private type: TransactionType;
  private unitPrice: number;

  constructor(data: ITransaction) {
    this.currency = data.currency;
    this.date = data.date;
    this.quantity = data.quantity;
    this.symbol = data.symbol;
    this.type = data.type;
    this.unitPrice = data.unitPrice;

    this.total = this.quantity * data.unitPrice;
  }

  public getCurrency() {
    return this.currency;
  }

  public getDate() {
    return this.date;
  }

  public getQuantity() {
    return this.quantity;
  }

  public getSymbol() {
    return this.symbol;
  }

  public getType() {
    return this.type;
  }

  public getUnitPrice() {
    return this.unitPrice;
  }

}
