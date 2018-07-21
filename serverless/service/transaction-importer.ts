import { awsManager } from './aws-manager';
import { config } from '../config/config';
import { helper } from './helper';
import { coinbaseImporter } from './importer/coinbase/coinbase-importer';
import { concat, find, last, reject as rejectArray, sortBy } from 'lodash';
import * as moment from 'moment';
import * as path from 'path';
import { postfinanceImporter } from './importer/postfinance/postfinance-importer';
import { symbolService } from './symbol-service';
import { Transaction } from '../type/transaction';
import { TransactionType } from '../type/transaction-type';

class TransactionImporter {
  private transactions: Transaction[];

  private async addTransaction(
    aUserId: string,
    aTransaction
  ): Promise<Transaction> {
    return new Promise<Transaction>(async (resolve, reject) => {
      const transaction = new Transaction({
        currency: aTransaction.currency,
        date: aTransaction.date,
        fee: aTransaction.fee,
        quantity: aTransaction.quantity,
        symbol: aTransaction.symbol,
        type: <TransactionType>aTransaction.type,
        unitPrice: aTransaction.unitPrice
      });

      const params = {
        Bucket: config.aws.s3Bucket,
        Key: `accounts/${aUserId}/transactions.json`
      };

      awsManager.getS3().getObject(params, (error, data) => {
        if (error) {
          return reject(error);
        }

        const rawTransactions = JSON.parse(data.Body.toString('utf8'));

        rawTransactions.push(transaction.getData());

        const params2 = {
          Body: JSON.stringify(rawTransactions),
          Bucket: config.aws.s3Bucket,
          Key: `accounts/${aUserId}/transactions.json`
        };

        awsManager.getS3().putObject(params2, (error) => {
          if (error) {
            return reject(error);
          }

          resolve(transaction);
        });
      });
    });
  }

  public async deleteTransaction(aUserId: string, aTransactionId: any) {
    const userId = aUserId.toLowerCase();

    await this.removeTransaction(userId, aTransactionId);
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify({ message: 'OK' })
    };
  }

  public async getPortfolio(aUserId: string, aDate) {
    const userId = aUserId.toLowerCase();
    let minimumDate = moment().toISOString();

    return new Promise<any>(async (resolve, reject) => {
      const portfolio = {};
      let transactions: Transaction[] = [];
      try {
        transactions = await this.loadTransactions(userId);
      } catch (error) {
        return reject(error);
      }

      let currentPrice;

      transactions.forEach((transaction: Transaction) => {
        if (
          transaction.getDate() &&
          transaction.getDate().length > 0 &&
          moment(transaction.getDate()).isBefore(aDate)
        ) {
          if (transaction.getSymbol() && !portfolio[transaction.getSymbol()]) {
            portfolio[transaction.getSymbol()] = {
              quantity: 0,
              quantities: [],
              prices: []
            };
          }

          if (
            transaction.getType() === TransactionType.Buy ||
            transaction.getType() === TransactionType.Split
          ) {
            portfolio[
              transaction.getSymbol()
            ].quantity += transaction.getQuantity();
            portfolio[transaction.getSymbol()].quantities.push(
              transaction.getQuantity()
            );
            portfolio[transaction.getSymbol()].prices.push(
              transaction.getUnitPrice()
            );
          } else if (transaction.getType() === TransactionType.Sell) {
            portfolio[
              transaction.getSymbol()
            ].quantity -= transaction.getQuantity();
            portfolio[transaction.getSymbol()].quantities.push(
              -transaction.getQuantity()
            );
            portfolio[transaction.getSymbol()].prices.push(
              transaction.getUnitPrice()
            );
          } else if (
            transaction.getType() === TransactionType.CorporateAction
          ) {
            // Rename symbol (move old price to new symbol)
            if (transaction.getQuantity() >= 0) {
              portfolio[
                transaction.getSymbol()
              ].quantity += transaction.getQuantity();
              portfolio[transaction.getSymbol()].quantities.push(
                transaction.getQuantity()
              );
              portfolio[transaction.getSymbol()].prices.push(currentPrice);
            } else {
              // Store current prize to add in next round
              currentPrice = last(portfolio[transaction.getSymbol()].prices);

              portfolio[
                transaction.getSymbol()
              ].quantity += transaction.getQuantity();
              portfolio[transaction.getSymbol()].quantities.push(
                transaction.getQuantity()
              );
              portfolio[transaction.getSymbol()].prices.push(
                transaction.getUnitPrice()
              );
            }
          }

          if (moment(transaction.getDate()).isBefore(minimumDate)) {
            minimumDate = transaction.getDate();
          }
        }
      });

      // Remove items with 0 from portfolio
      Object.keys(portfolio).forEach(
        (key: string) => portfolio[key].quantity === 0 && delete portfolio[key]
      );

      this.convertPortfolioToYahoo(portfolio).then((portfolio) => {
        // calculate averagePrice and total quantity
        for (const key in portfolio) {
          let sum = 0;
          let total = 0;

          portfolio[key].quantities.forEach((quantity, index) => {
            if (quantity > 0) {
              sum += quantity * portfolio[key].prices[index];
              total += quantity;
            }
          });

          portfolio[key].averagePrice = sum / total;
        }

        resolve({
          portfolio,
          startDate: minimumDate
        });
      });
    });
  }

  public async getTransactions(aUserId: string) {
    const userId = aUserId.toLowerCase();

    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(await this.loadTransactions(userId))
    };
  }

  private convertPortfolioToYahoo(portfolio): Promise<any> {
    return new Promise<any>(async (resolve) => {
      symbolService.getSymbols().then((symbols: any) => {
        const portfolioYahoo = {};
        const yahooSymbol = {
          '8GC': '8GC.F', // '8GC.DE'
          GALN: 'GALN.VX',
          NNN1: 'NNN1.F',
          NOVC: 'NOVA.DE',
          VIFN: 'VIFN.VX',
          VOW3: 'VOW3.DE',
          ZGLD: 'ZGLD.SW'
        };

        for (const key in portfolio) {
          if (find(symbols, { id: key })) {
            // add currency for cryptocurrencies
            portfolioYahoo[`${key}-USD`] = portfolio[key];
          } else if (yahooSymbol[key]) {
            // Map yahoo symbols
            portfolioYahoo[yahooSymbol[key]] = portfolio[key];
          } else {
            // No mapping needed
            portfolioYahoo[key] = portfolio[key];
          }
        }

        resolve(portfolioYahoo);
      });
    });
  }

  // TODO: use for importing transactions from differnet platforms
  private async importTransactions(): Promise<Transaction[]> {
    return new Promise<Transaction[]>(async (resolve) => {
      const filePathsPostfinance: string[] = [];
      const filePathsCoinbase: string[] = [];
      let transactions: Transaction[] = [];

      helper
        .recursiveReaddirSync(path.join(__dirname, '..', 'data'))
        .forEach((filePath) => {
          if (coinbaseImporter.isValid(filePath)) {
            filePathsCoinbase.push(filePath);
          } else if (postfinanceImporter.isValid(filePath)) {
            filePathsPostfinance.push(filePath);
          }
        });

      transactions = concat(
        transactions,
        await coinbaseImporter.getTransactions(filePathsCoinbase)
      );
      transactions = concat(
        transactions,
        await postfinanceImporter.getTransactions(filePathsPostfinance)
      );

      // sort transactions by date asc
      transactions = sortBy(transactions, (transaction) => {
        return moment(transaction.getDate()).unix();
      });

      resolve(transactions);
    });
  }

  private async loadTransactions(aUserId: string): Promise<Transaction[]> {
    return new Promise<Transaction[]>(async (resolve, reject) => {
      if (this.transactions) {
        resolve(this.transactions);
      } else {
        this.transactions = [];
        const params = {
          Bucket: config.aws.s3Bucket,
          Key: `accounts/${aUserId}/transactions.json`
        };

        awsManager.getS3().getObject(params, (error, data) => {
          if (error) {
            if (error.statusCode === 404) {
              const params = {
                Bucket: config.aws.s3Bucket,
                Key: `accounts/${aUserId}/transactions.json`,
                Body: JSON.stringify([])
              };
              const putObjectPromise = awsManager
                .getS3()
                .putObject(params)
                .promise();
              putObjectPromise
                .then(() => {
                  return resolve([]);
                })
                .catch((error) => {
                  return reject(error);
                });
            } else {
              return reject(error);
            }

            return;
          }

          const rawTransactions = JSON.parse(data.Body.toString('utf8'));

          rawTransactions.forEach((rawTransaction) => {
            const transaction = new Transaction({
              currency: rawTransaction.currency,
              date: rawTransaction.date,
              fee: rawTransaction.fee,
              id: rawTransaction.id,
              quantity: rawTransaction.quantity,
              symbol: rawTransaction.symbol,
              type: <TransactionType>rawTransaction.type,
              unitPrice: rawTransaction.unitPrice
            });

            this.transactions.push(transaction);
          });

          resolve(this.transactions);
        });
      }
    });
  }

  public async postTransaction(aUserId: string, aTransaction: any) {
    const userId = aUserId.toLowerCase();

    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(await this.addTransaction(userId, aTransaction))
    };
  }

  private async removeTransaction(
    aUserId: string,
    aTransactionId: string
  ): Promise<any> {
    return new Promise<Transaction>(async (resolve, reject) => {
      const params = {
        Bucket: config.aws.s3Bucket,
        Key: `accounts/${aUserId}/transactions.json`
      };

      awsManager.getS3().getObject(params, (error, data) => {
        if (error) {
          return reject(error);
        }

        let rawTransactions = JSON.parse(data.Body.toString('utf8'));

        rawTransactions = rejectArray(rawTransactions, {
          id: aTransactionId
        });

        const params2 = {
          Body: JSON.stringify(rawTransactions),
          Bucket: config.aws.s3Bucket,
          Key: `accounts/${aUserId}/transactions.json`
        };

        awsManager.getS3().putObject(params2, (error) => {
          if (error) {
            return reject(error);
          }

          resolve();
        });
      });
    });
  }
}

export const transactionImporter = new TransactionImporter();
