import * as fs from 'fs';
import { concat, flattenDeep } from 'lodash';
import { IImporter } from '../interfaces/interfaces';
import { ITransaction } from '../../interfaces/interfaces';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';

class CoinbaseImporter implements IImporter {
  public getTransactions(filePaths: string[]): Promise<ITransaction[]> {
    let promises: Promise<ITransaction[]>[] = [];

    filePaths.forEach((filePath) => {
      promises.push(this.parseFile(filePath));
    });

    return Promise.all(promises).then((transactions) => {
      return flattenDeep(transactions);
    });
  }

  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('coinbase') &&
      filePath.toLowerCase().includes('csv');
  }

  private parseFile(filePath): Promise<ITransaction[]> {
    return new Promise((resolve, reject) => {
      let transactions: ITransaction[] = [];

      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', filePath), 'utf8');
      Papa.parse(file, {
        header: false,
        complete: (results) => {
          let foundTransactions = false;

          try {
            results.data.forEach((transaction, index) => {
              if (transaction && transaction[0] === 'Timestamp') {
                foundTransactions = true;
              } else if (foundTransactions && transaction && transaction[0]) {
                const currency = transaction[8];
                const date = moment(transaction[0], 'YYYY-MM-DD HH:mm:ss');
                const fee = parseFloat(transaction[9]);
                const price = parseFloat(transaction[7]);
                const quantity = parseFloat(transaction[2]);
                const transactionType = quantity > 0 ? 'Buy' : 'Sell';
                const symbol = transaction[3];

                const newTransaction: ITransaction = {
                  Currency: currency,
                  Date: date.toISOString(),
                  Quantity: quantity,
                  Symbol: symbol,
                  Transaction: transactionType,
                  'Unit price': ((price - fee) / quantity) || 0
                };

                transactions.push(newTransaction);
              }
            });
          } catch(err) {
            console.log(err);
          }

          resolve(transactions);
        }
      });
    });
  }
}

export const coinbaseImporter = new CoinbaseImporter();
