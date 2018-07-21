import { awsManager } from './aws-manager';
import { config } from '../config/config';
import { helper } from './helper';
import { sortBy } from 'lodash';

class SymbolService {
  private symbols: any[];

  public async loadSymbols() {
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(await this.getSymbols())
    };
  }

  public async getSymbols(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      if (this.symbols) {
        // already cached, return immediately
        return resolve(this.symbols);
      }

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

        // cache symbols
        this.symbols = symbols;

        resolve(symbols);
      });
    });
  }
}

export const symbolService = new SymbolService();
