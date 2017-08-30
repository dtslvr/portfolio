import { coinbaseImporter } from './importer/coinbase/coinbase-importer';
import * as fs from 'fs';
import { helper } from './helper';
import { ITransaction } from './interfaces/interfaces';
import { concat, last, sortBy } from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { postfinanceImporter } from './importer/postfinance/postfinance-importer';

class TransactionImporter {

  public async getPortfolio(aDate) {
    return new Promise(async (resolve, reject) => {
      let portfolio = {};
      const transactions: ITransaction[] = await this.getAllTransactions();
      let currentPrice;

      transactions.forEach((transaction: any) => {
        if (transaction.Date && transaction.Date.length > 0 &&
          moment(transaction.Date).isBefore(aDate)) {
          if (transaction.Symbol && !portfolio[transaction.Symbol]) {
            portfolio[transaction.Symbol] = {
              quantity: 0,
              quantities: [],
              prices: []
            };
          }

          if (transaction.Transaction === 'Buy' ||
            transaction.Transaction === 'Split') {
            portfolio[transaction.Symbol].quantity += transaction.Quantity;
            portfolio[transaction.Symbol].quantities.push(transaction.Quantity);
            portfolio[transaction.Symbol].prices.push(transaction['Unit price']);
          } else if (transaction.Transaction === 'Corporate Action') {
            // Rename symbol (move old price to new symbol)
            if (transaction.Quantity >= 0) {
              portfolio[transaction.Symbol].quantity += transaction.Quantity;
              portfolio[transaction.Symbol].quantities.push(transaction.Quantity);
              portfolio[transaction.Symbol].prices.push(currentPrice);
            } else {
              // Store current prize to add in next round
              currentPrice = last(portfolio[transaction.Symbol].prices);

              portfolio[transaction.Symbol].quantity += transaction.Quantity;
              portfolio[transaction.Symbol].quantities.push(transaction.Quantity);
              portfolio[transaction.Symbol].prices.push(transaction['Unit price']);
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

  private convertPortfolioToYahoo(portfolio) {
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

  private async getAllTransactions() {
    return new Promise<ITransaction[]>(async (resolve, reject) => {
      let filePathsPostfinance: string[] = [];
      let filePathsCoinbase: string[] = [];
      let transactions: ITransaction[] = [];

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
        return moment(transaction.Date).format('YYYYMMDD');
      });

      // return transactions;
      resolve(transactions);
    });
  }
}

export const transactionImporter = new TransactionImporter();
