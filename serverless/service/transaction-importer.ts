import { coinbaseImporter } from './importer/coinbase/coinbase-importer';
import { helper } from './helper';
import { concat, last, sortBy } from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';
import { postfinanceImporter } from './importer/postfinance/postfinance-importer';
import { Transaction } from '../type/transaction';
import { TransactionType } from '../type/transaction-type';

class TransactionImporter {

  public async getPortfolio(aDate) {
    return new Promise(async (resolve, reject) => {
      let portfolio = {};
      const transactions: Transaction[] = await this.getAllTransactions();
      let currentPrice;

      transactions.forEach((transaction: Transaction) => {
        if (transaction.getDate() && transaction.getDate().length > 0 &&
          moment(transaction.getDate()).isBefore(aDate)) {
          if (transaction.getSymbol() && !portfolio[transaction.getSymbol()]) {
            portfolio[transaction.getSymbol()] = {
              quantity: 0,
              quantities: [],
              prices: []
            };
          }

          if (transaction.getType() === TransactionType.Buy ||
            transaction.getType() === TransactionType.Split) {
            portfolio[transaction.getSymbol()].quantity += transaction.getQuantity();
            portfolio[transaction.getSymbol()].quantities.push(transaction.getQuantity());
            portfolio[transaction.getSymbol()].prices.push(transaction.getUnitPrice());
          } else if (transaction.getType() === TransactionType.Sell) {
            portfolio[transaction.getSymbol()].quantity -= transaction.getQuantity();
            portfolio[transaction.getSymbol()].quantities.push(-transaction.getQuantity());
            portfolio[transaction.getSymbol()].prices.push(transaction.getUnitPrice());
          } else if (transaction.getType() === TransactionType.CorporateAction) {
            // Rename symbol (move old price to new symbol)
            if (transaction.getQuantity() >= 0) {
              portfolio[transaction.getSymbol()].quantity += transaction.getQuantity();
              portfolio[transaction.getSymbol()].quantities.push(transaction.getQuantity());
              portfolio[transaction.getSymbol()].prices.push(currentPrice);
            } else {
              // Store current prize to add in next round
              currentPrice = last(portfolio[transaction.getSymbol()].prices);

              portfolio[transaction.getSymbol()].quantity += transaction.getQuantity();
              portfolio[transaction.getSymbol()].quantities.push(transaction.getQuantity());
              portfolio[transaction.getSymbol()].prices.push(transaction.getUnitPrice());
            }
          }
        }
      });

      // Remove items with 0 from portfolio
      Object.keys(portfolio).forEach((key) => (portfolio[key].quantity === 0) && delete portfolio[key]);

      portfolio = this.convertPortfolioToYahoo(portfolio);

      // calculate averagePrice and total quantity
      for (var key in portfolio) {
        let sum = 0;
        let total = 0;

        portfolio[key].quantities
        .forEach((quantity, index) => {
          if (quantity > 0) {
            sum += (quantity * portfolio[key].prices[index]);
            total += quantity;
          }
        });

        portfolio[key].averagePrice = (sum / total);
      }

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

  private convertPortfolioToYahoo(portfolio): any {
    const portfolioYahoo = {};
    const yahooSymbol = {
      '8GC': '8GC.F', // '8GC.DE'
      'BTC': 'BTC-EUR',
      'GALN': 'GALN.VX',
      'ETH': 'ETH-EUR',
      'LTC': 'LTC-EUR',
      'NOVC': 'NOVA.DE',
      'VIFN': 'VIFN.VX',
      'VOW3': 'VOW3.DE',
      'ZGLD': 'ZGLD.SW'
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

  private async getAllTransactions(): Promise<Transaction[]> {
    return new Promise<Transaction[]>(async (resolve, reject) => {
      let filePathsPostfinance: string[] = [];
      let filePathsCoinbase: string[] = [];
      let transactions: Transaction[] = [];

      helper.recursiveReaddirSync(path.join(__dirname, '..', 'data')).forEach((filePath) => {
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
        return moment(transaction.getDate()).unix();
      });

      resolve(transactions);
    });
  }

}

export const transactionImporter = new TransactionImporter();
