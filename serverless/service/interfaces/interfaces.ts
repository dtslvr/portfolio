import { TransactionType } from '../../type/transaction-type';

export interface ITransaction {
  currency: string;
  date: string;
  fee: number;
  id?: string;
  quantity: number;
  symbol: string;
  type: TransactionType;
  unitPrice: number;
}
