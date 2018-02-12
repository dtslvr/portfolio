import { awsManager } from './aws-manager';
import { config } from '../config/config';
import { helper } from './helper';
import { coinbaseImporter } from './importer/coinbase/coinbase-importer';
import { concat, last, reject as rejectArray, sortBy } from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { postfinanceImporter } from './importer/postfinance/postfinance-importer';
import { Transaction } from '../type/transaction';
import { TransactionType } from '../type/transaction-type';

class SymbolService {

  public async loadSymbols() {
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(await this.getSymbols())
    };
  }

  private async getSymbols(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      const params = {
        Bucket: config.aws.s3Bucket,
        Key: `symbols.json`
      };

      awsManager.getS3().getObject(params, (error, data) => {
        if (error) {
          console.log(error);
          return reject(error);
        }

        let symbols = JSON.parse(data.Body.toString('utf8'));
        symbols = sortBy(symbols, ['id']);

        resolve(symbols);
      });
    });
  }

}

export const symbolService = new SymbolService();
