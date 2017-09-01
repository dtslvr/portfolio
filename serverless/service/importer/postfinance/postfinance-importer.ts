import { AbstractImporter } from '../abstract-importer';
import * as fs from 'fs';
import { ITransaction } from '../../interfaces/interfaces';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';

class PostfinanceImporter extends AbstractImporter {
  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('postfinance') &&
      filePath.toLowerCase().includes('csv');
  }

  public parseFile(filePath): Promise<ITransaction[]> {
    return new Promise((resolve, reject) => {
      let transactions: ITransaction[] = [];

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
                const transaction: ITransaction = {
                  Currency: currency,
                  Date: date.toISOString(),
                  Quantity: quantity,
                  Symbol: symbol,
                  Transaction: transactionType,
                  'Unit price': unitPrice
                };

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
