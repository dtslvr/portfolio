'use strict';

import { exchangeRateDataService } from './service/exchange-rate-data-service';
import * as moment from 'moment';
import { portfolioService } from './service/portfolio-service';
import { transactionImporter } from './service/transaction-importer';
import * as yahooFinance from 'yahoo-finance';


export async function portfolio(event, context, callback) {
  exchangeRateDataService.loadCurrencies().then(async () => {
    const portfolio = await transactionImporter.getPortfolio(moment());
    const symbols = Object.keys(portfolio);

    if (symbols.length > 0) {
      yahooFinance.quote({
        symbols: symbols,
        modules: ['price']
      }).then((result) => {
        callback(null, portfolioService.getResponse(portfolio, result));
      }).catch((error) => {
        // callback(new Error(`[500] ${error}`));
        return;
      });
    } else {
      callback(null, portfolioService.getEmptyResponse());
    }
  }).catch((error) => {
    // callback(new Error(`[500] ${error}`));
    callback(null, {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        message: error
      }
    });
    return;
  });
};

export async function transactions(event, context, callback) {
  callback(null, await transactionImporter.getTransactions());
};
