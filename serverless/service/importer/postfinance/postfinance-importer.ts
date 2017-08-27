import * as fs from 'fs';
import { IImporter } from '../interfaces/interfaces';
import { ITransaction } from '../../interfaces/interfaces';
import { concat } from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';

class PostfinanceImporter implements IImporter {
  public getTransactions(filePaths: string[]): ITransaction[] {
    let transactions: ITransaction[] = [];

    filePaths.forEach((filePath) => {
      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', filePath), 'utf8');
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          transactions = concat(transactions, results.data);
        }
      });
    });

    return transactions;
  }

  public isValid(filePath: string) {
    return filePath.toLowerCase().includes('postfinance') &&
      filePath.toLowerCase().includes('csv');
  }
}

export const postfinanceImporter = new PostfinanceImporter();
