import { AbstractImporter } from '../abstract-importer';
import * as fs from 'fs';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { Transaction } from '../../../type/transaction';
import { TransactionType } from '../../../type/transaction-type';

class CoinbaseImporter extends AbstractImporter {

  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('coinbase') &&
      filePath.toLowerCase().includes('csv');
  }

  public parseFile(filePath): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      let transactions: Transaction[] = [];

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

                let transactionType;
                const note = transaction[5];
                if (note.includes('Bought')) {
                  transactionType = TransactionType.Buy;
                } else if (note.includes('Sold')) {
                  transactionType = TransactionType.Sell;
                } else if (note.includes('Congrats')) {
                  transactionType = TransactionType.Bonus;
                }

                const symbol = transaction[3];

                if (symbol && transactionType) {
                  const newTransaction = new Transaction({
                    currency: currency,
                    date: date.toISOString(),
                    quantity: quantity,
                    symbol: symbol,
                    type: transactionType,
                    unitPrice: ((price - fee) / quantity) || 0
                  });

                  transactions.push(newTransaction);
                }
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
