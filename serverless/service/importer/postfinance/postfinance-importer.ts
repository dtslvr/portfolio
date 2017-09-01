import { AbstractImporter } from '../abstract-importer';
import * as fs from 'fs';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { Transaction } from '../../../type/transaction';

class PostfinanceImporter extends AbstractImporter {

  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('postfinance') &&
      filePath.toLowerCase().includes('csv');
  }

  public parseFile(filePath): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      let transactions: Transaction[] = [];

      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', filePath), 'utf8');
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          results.data.forEach((result) => {
            try {
              const currency = result.Currency;
              const date = moment(result.Date, 'DD-MM-YYYY HH:mm:ss');
              const quantity = parseFloat(result.Quantity.replace(/'/g,''));
              const transactionType = result.Transaction;
              const symbol = result.Symbol;
              const unitPrice = parseFloat(result['Unit price'].replace(/'/g,''));

              if (symbol) {
                const transaction = new Transaction({
                  currency: currency,
                  date: date.toISOString(),
                  quantity: quantity,
                  symbol: symbol,
                  type: transactionType,
                  unitPrice: unitPrice
                });

                transactions.push(transaction);
              }
            } catch(err) {
            }
          });

          resolve(transactions);
        }
      });
    });
  }

}

export const postfinanceImporter = new PostfinanceImporter();
