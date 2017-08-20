'use strict';

const exchangeRateDataService = require('./service/exchange-rate-data-service');
const moment = require('moment');
const portfolioService = require('./service/portfolio-service');
const transactionImporter = require('./service/transaction-importer');
const yahooFinance = require('yahoo-finance');


module.exports.portfolio = (event, context, callback) => {
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

module.exports.transactions = (event, context, callback) => {
  callback(null, transactionImporter.getTransactions());
};
