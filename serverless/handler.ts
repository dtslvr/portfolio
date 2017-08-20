'use strict';

import { exchangeRateDataService } from './service/exchange-rate-data-service';
import * as moment from 'moment';
import { portfolioService } from './service/portfolio-service';
import { transactionImporter } from './service/transaction-importer';
import * as yahooFinance from 'yahoo-finance';


export async function portfolio(event, context, callback) {
  const currentDate = moment();

  exchangeRateDataService.loadCurrencies().then(() => {
    const portfolio = transactionImporter.getPortfolio(currentDate);
    const symbols = Object.keys(portfolio);

    if (symbols.length > 0) {
      yahooFinance.quote({
        symbols: symbols,
        modules: ['price']
      }).then((result) => {
        callback(null, portfolioService.getResponse(portfolio, result));
      });
    } else {
      callback(null, portfolioService.getEmptyResponse());
    }
  });
};

export async function transactions(event, context, callback) {
  callback(null, transactionImporter.getTransactions());
};
