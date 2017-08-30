import { ITransaction } from '../../interfaces/interfaces';

export interface IImporter {
  getTransactions(filePaths: string[]): Promise<ITransaction[]>;
  isValid(filePath: string): boolean;
}
