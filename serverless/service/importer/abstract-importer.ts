import { flattenDeep } from 'lodash';
import { Transaction } from '../../type/transaction';

export abstract class AbstractImporter {
  public getTransactions(filePaths: string[]): Promise<Transaction[]> {
    const promises: Promise<Transaction[]>[] = [];

    filePaths.forEach((filePath) => {
      promises.push(this.parseFile(filePath));
    });

    return Promise.all(promises).then((transactions) => {
      return flattenDeep(transactions);
    });
  }

  public abstract isValid(filePath: string): boolean;

  public abstract parseFile(filePath): Promise<Transaction[]>;
}
