import * as fs from 'fs';
import { helper } from './helper';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import * as path from 'path';

class TransactionImporter {

  public getPortfolio(aDate) {
    let portfolio = {};
    const transactions = this.getRawTransactions();
    let currentPrice;

    transactions.forEach((transaction: any) => {
      if (transaction.Date && transaction.Date.length > 0 && moment(transaction.Date, 'DD-MM-YYYY HH:mm:ss').isBefore(aDate)) {
        if (transaction.Symbol && !portfolio[transaction.Symbol]) {
          portfolio[transaction.Symbol] = {
            quantity: 0,
            quantities: [],
            prices: []
          };
        }

        if (transaction.Transaction === 'Buy' ||
          transaction.Transaction === 'Split') {
          portfolio[transaction.Symbol].quantity += parseFloat(transaction.Quantity);
          portfolio[transaction.Symbol].quantities.push(parseFloat(transaction.Quantity));
          portfolio[transaction.Symbol].prices.push(parseFloat(transaction['Unit price'].replace(/'/g,'')));
        } else if (transaction.Transaction === 'Corporate Action') {
          // Rename symbol (move old price to new symbol)
          if (parseFloat(transaction.Quantity.replace(/'/g,'')) >= 0) {
            portfolio[transaction.Symbol].quantity += parseFloat(transaction.Quantity);
            portfolio[transaction.Symbol].quantities.push(parseFloat(transaction.Quantity));
            portfolio[transaction.Symbol].prices.push(currentPrice);
          } else {
            // Store current prize to add in next round
            currentPrice = _.last(portfolio[transaction.Symbol].prices);

            portfolio[transaction.Symbol].quantity += parseFloat(transaction.Quantity);
            portfolio[transaction.Symbol].quantities.push(parseFloat(transaction.Quantity));
            portfolio[transaction.Symbol].prices.push(parseFloat(transaction['Unit price'].replace(/'/g,'')));
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

    return portfolio;
  }

  public getTransactions() {
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(this.getRawTransactions())
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

  private getRawTransactions() {
    let filePaths: string[] = [];
    let filePathsCoinbase: string[] = [];
    let transactions = [];

    fs.readdirSync(path.join(__dirname, '..', 'data')).forEach((filePath) => {
      if (filePath.includes('.csv')) {
        if (filePath.includes('Coinbase')) {
          filePathsCoinbase.push(filePath);
        } else {
          filePaths.push(filePath);
        }
      }
    });

    filePaths.forEach((filePath) => {
      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', 'data', filePath), 'utf8');
      Papa.parse(file, {
        header: true,
        complete: function(results) {
          transactions = _.concat(transactions, results.data);
        }
      });
    });

    filePathsCoinbase.forEach((filePathCoinbase) => {
      // Parse local CSV file
      const file = fs.readFileSync(path.join(__dirname, '..', 'data', filePathCoinbase), 'utf8');
      Papa.parse(file, {
        header: false,
        complete: function(results) {
          const currency = results.data[5][8];
          const date = results.data[5][0];
          const fee = results.data[5][9];
          const price = results.data[5][7];
          const quantity = results.data[5][2];
          const transactionType = results.data[5][5].includes('Bought') ? 'Buy' : 'Sell';
          const symbol = results.data[2][1].substring(0, 3);

          const transaction = {
            Currency: currency,
            Date: moment(date).format('DD-MM-YYYY 00:00:00'),
            Quantity: quantity.toString(),
            Symbol: symbol,
            Transaction: transactionType,
            'Unit price': ((price - fee) / quantity).toString()
          };

          transactions = _.concat(transactions, transaction);
        }
      });
    });

    // sort transactions by date asc
    transactions = _.sortBy(transactions, (transaction) => { return moment(transaction.Date, 'DD-MM-YYYY HH:mm:ss'); });

    return transactions;
  }
}

export const transactionImporter = new TransactionImporter();
