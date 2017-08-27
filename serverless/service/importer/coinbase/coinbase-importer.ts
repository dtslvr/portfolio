import * as fs from 'fs';
import { concat } from 'lodash';
import { IImporter } from '../interfaces/interfaces';
import { ITransaction } from '../../interfaces/interfaces';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';

class CoinbaseImporter implements IImporter {
  public getTransactions(filePaths: string[]): ITransaction[] {
    let transactions: ITransaction[] = [];

    filePaths.forEach((filePath) => {
      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', filePath), 'utf8');
      Papa.parse(file, {
        header: false,
        complete: (results) => {
          const currency = results.data[5][8];
          const date = results.data[5][0];
          const fee = results.data[5][9];
          const price = results.data[5][7];
          const quantity = results.data[5][2];
          const transactionType = results.data[5][5].includes('Bought') ? 'Buy' : 'Sell';
          const symbol = results.data[2][1].substring(0, 3);

          const transaction: ITransaction = {
            Currency: currency,
            Date: moment(date).format('DD-MM-YYYY 00:00:00'),
            Quantity: quantity.toString(),
            Symbol: symbol,
            Transaction: transactionType,
            'Unit price': ((price - fee) / quantity).toString()
          };

          transactions = concat(transactions, transaction);
        }
      });
    });

    return transactions;
  }

  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('coinbase') &&
      filePath.toLowerCase().includes('csv');
  }
}

export const coinbaseImporter = new CoinbaseImporter();
