import { ITransaction } from '../interfaces/interfaces';
import { flattenDeep } from 'lodash';

export abstract class AbstractImporter {
  public getTransactions(filePaths: string[]): Promise<ITransaction[]> {
    let promises: Promise<ITransaction[]>[] = [];

    filePaths.forEach((filePath) => {
      promises.push(this.parseFile(filePath));
    });

    return Promise.all(promises).then((transactions) => {
      return flattenDeep(transactions);
    });
  }

  public abstract isValid(filePath: string): boolean;

  public abstract parseFile(filePath): Promise<ITransaction[]>;
}
