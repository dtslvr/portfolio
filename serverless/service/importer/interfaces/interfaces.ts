import { ITransaction } from '../../interfaces/interfaces';

export interface IImporter {
  getTransactions(filePaths: string[]): ITransaction[];
  isValid(filePath: string): boolean;
}
