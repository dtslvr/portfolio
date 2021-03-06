import { AbstractImporter } from '../abstract-importer';
import * as fs from 'fs';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { Transaction } from '../../../type/transaction';
import { TransactionType } from '../../../type/transaction-type';

class PostfinanceImporter extends AbstractImporter {
  public isValid(filePath: string) {
    return (
      filePath.toLowerCase().includes('postfinance') &&
      filePath.toLowerCase().includes('csv')
    );
  }

  public parseFile(filePath): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const transactions: Transaction[] = [];

      // Parse local CSV file
      const file = fs.readFileSync(path.join(filePath), 'utf8');
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          results.data.forEach((result) => {
            try {
              const currency = result['Currency'];
              const date = moment(result['Date'], 'DD-MM-YYYY HH:mm:ss');
              const fee = result['Costs'];
              const quantity = parseFloat(result['Quantity'].replace(/'/g, ''));

              let transactionType;
              if (result['Transaction'] === 'Corporate Action') {
                transactionType = TransactionType.CorporateAction;
              } else if (result['Transaction'] === 'Buy') {
                transactionType = TransactionType.Buy;
              } else if (result['Transaction'] === 'Dividend') {
                transactionType = TransactionType.Dividend;
              } else if (result['Transaction'] === 'Sell') {
                transactionType = TransactionType.Sell;
              } else if (result['Transaction'] === 'Split') {
                transactionType = TransactionType.Split;
              }

              const symbol = result['Symbol'];
              const unitPrice = parseFloat(
                result['Unit price'].replace(/'/g, '')
              );

              if (symbol && transactionType) {
                const transaction = new Transaction({
                  currency,
                  date: date.toISOString(),
                  fee,
                  quantity,
                  symbol,
                  type: transactionType,
                  unitPrice
                });

                transactions.push(transaction);
              }
            } catch (error) {}
          });

          resolve(transactions);
        }
      });
    });
  }
}

export const postfinanceImporter = new PostfinanceImporter();
