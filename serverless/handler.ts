'use strict';

import { exchangeRateDataService } from './service/exchange-rate-data-service';
import { helper } from './service/helper';
import { transform } from 'lodash';
import * as moment from 'moment';
import { chartService } from './service/chart-service';
import { portfolioService } from './service/portfolio-service';
import { symbolService } from './service/symbol-service';
import { transactionImporter } from './service/transaction-importer';
import * as yahooFinance from 'yahoo-finance';

export async function deleteTransaction(event, context, callback) {
  // make headers lowercase
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  callback(null, await transactionImporter
    .deleteTransaction(event.headers['user-id'], event.pathParameters.id));
};

export async function getChart(event, context, callback) {
  const NUMBER_OF_DATAPOINTS = 200;
  const portfolios = {};
  const response = await transactionImporter.getPortfolio(event.pathParameters.id, moment());
  const portfolio = response.portfolio;
  let symbols: string[] = [];

  let currentDate = moment(response.startDate);

  if (event.queryStringParameters) {
    if (event.queryStringParameters.range === 'YTD') {
      currentDate = moment().startOf('year');
    } else if (event.queryStringParameters.range === '1Y') {
      currentDate = moment().subtract(1, 'year');
    } else if (event.queryStringParameters.range === '5Y') {
      currentDate = moment().subtract(5, 'years');
    }
  }

  let currentPortfolio;

  let dayCount = moment().diff(currentDate, 'days');
  let steps = 1;

  if (dayCount > NUMBER_OF_DATAPOINTS) {
    steps = Math.round(dayCount / NUMBER_OF_DATAPOINTS);
  }

  while (currentDate.format('YYYYMMDD') < moment().format('YYYYMMDD')) {
    currentPortfolio = await transactionImporter.getPortfolio(event.pathParameters.id, currentDate);
    symbols = symbols.concat(Object.keys(currentPortfolio.portfolio));
    portfolios[currentDate.format('YYYYMMDD')] = currentPortfolio;
    currentDate = currentDate.add(steps, 'days');
  }

  // Add today
  currentPortfolio = await transactionImporter.getPortfolio(event.pathParameters.id, moment().format('YYYYMMDD'));
  symbols = symbols.concat(Object.keys(currentPortfolio.portfolio));
  portfolios[moment().format('YYYYMMDD')] = currentPortfolio;

  // unique
  symbols = Array.from(new Set(symbols));

  try {
    yahooFinance.historical({
      symbols: symbols,
      from: moment(response.startDate).format('YYYY-MM-DD'),
      to: moment().format('YYYY-MM-DD')
    }).then((result) => {
      callback(null, chartService.getResponse(portfolios, result));
    });
  } catch (error) {
    console.log(error);
    callback((null), {
      statusCode: error.statusCode,
      headers: {
        'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
        'Content-Type': 'application/json'
      },
      body: {
        message: error.message
      }
    });
    return;
  }
};

export async function getPortfolio(event, context, callback) {
  // make headers lowercase
  const headers = Object.keys(event.headers);
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  exchangeRateDataService
    .loadCurrencies(event.headers['currency']).then(async () => {
    let portfolio;

    try {
      const response = await transactionImporter.getPortfolio(event.pathParameters.id, moment());
      portfolio = response.portfolio;
    } catch (error) {
      callback((null), {
        statusCode: error.statusCode,
        headers: {
          'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
          'Content-Type': 'application/json'
        },
        body: {
          message: error.message
        }
      });
      return;
    }

    const symbols = Object.keys(portfolio);

    if (symbols.length > 0) {
      yahooFinance.quote({
        symbols: symbols,
        modules: ['price', 'summaryProfile']
      }).then((result) => {
        callback(null, portfolioService.getResponse(portfolio, result));
      }).catch((error) => {
        // callback(new Error(`[500] ${error}`));
        callback((null), {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
            'Content-Type': 'application/json'
          },
          body: {
            message: error
          }
        });
        return;
      });
    } else {
      callback(null, portfolioService.getEmptyResponse());
    }
  }).catch((error) => {
    // callback(new Error(`[500] ${error}`));
    callback((null), {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
        'Content-Type': 'application/json'
      },
      body: {
        message: error
      }
    });
    return;
  });
};

export async function getSymbols(event, context, callback) {
  try {
    callback(null, await symbolService.loadSymbols());
  } catch(error) {
    console.log(error);
    callback((null), {
      statusCode: error.statusCode,
      headers: {
        'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
        'Content-Type': 'application/json'
      },
      body: {
        message: error.message
      }
    });
    return;
  }
};

export async function getTransactions(event, context, callback) {
  // make headers lowercase
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  exchangeRateDataService
    .loadCurrencies(event.headers['currency']).then(async () => {
    callback(null, await transactionImporter.getTransactions(event.pathParameters.id));
  }).catch((error) => {
    // callback(new Error(`[500] ${error}`));
    callback(null, {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Content-Type': 'application/json'
      },
      body: {
        message: error
      }
    });
    return;
  });
};

export async function postTransaction(event, context, callback) {
  // make headers lowercase
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  callback(null, await transactionImporter.postTransaction(event.headers['user-id'], JSON.parse(event.body)));
};
