import { coinbaseImporter } from './importer/coinbase/coinbase-importer';
import * as fs from 'fs';
import { helper } from './helper';
import { concat, last, sortBy } from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { postfinanceImporter } from './importer/postfinance/postfinance-importer';

class TransactionImporter {

  public async getPortfolio(aDate) {
    return new Promise(async (resolve, reject) => {
      let portfolio = {};
      let currentPrice;

              quantity: 0,
              quantities: [],
              prices: []
            };
          }

            // Rename symbol (move old price to new symbol)
            } else {
              // Store current prize to add in next round

            }
          }
        }
      });

      // Remove items with 0 from portfolio
      Object.keys(portfolio).forEach((key) => (portfolio[key].quantity === 0) && delete portfolio[key]);

      portfolio = this.convertPortfolioToYahoo(portfolio);

      // calculate averagePrice and total quantity
      for (var key in portfolio) {
        var sum = 0;
        var total = 0;
        for (var i = 0; i < portfolio[key].quantities.length; i++) {
          sum += (portfolio[key].quantities[i] * portfolio[key].prices[i]);
          total += portfolio[key].quantities[i];
        }

        portfolio[key].averagePrice = (sum / total);
      }

      // return portfolio;
      resolve(portfolio);
    });
  }

  public async getTransactions() {
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(await this.getAllTransactions())
    };
  }

    const portfolioYahoo = {};
    const yahooSymbol = {
      '8GC': '8GC.F', // '8GC.DE'
      'BTC': 'BTCEUR=X',
      'GALN': 'GALN.VX',
      'ETH': 'ETHEUR=X',
      'NOVC': 'NOVA.DE',
      'VIFN': 'VIFN.VX',
      'VOW3': 'VOW3.DE'
    };

    for (var key in portfolio) {
      if (yahooSymbol[key]) {
        portfolioYahoo[yahooSymbol[key]] = portfolio[key];
      } else {
        // use the same key
        portfolioYahoo[key] = portfolio[key];
      }
    }

    return portfolioYahoo;
  }

      let filePathsPostfinance: string[] = [];
      let filePathsCoinbase: string[] = [];

      fs.readdirSync(path.join(__dirname, '..', 'data')).forEach((filePath) => {
        if (coinbaseImporter.isValid(filePath)) {
          filePathsCoinbase.push(filePath);
        } else if (postfinanceImporter.isValid(filePath)) {
          filePathsPostfinance.push(filePath);
        }
      });

      transactions = concat(transactions, await coinbaseImporter.getTransactions(filePathsCoinbase));
      transactions = concat(transactions, await postfinanceImporter.getTransactions(filePathsPostfinance));

      // sort transactions by date asc
      transactions = sortBy(transactions, (transaction) => {
      });

      // return transactions;
      resolve(transactions);
    });
  }
}

export const transactionImporter = new TransactionImporter();
