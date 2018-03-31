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

  return callback(null, await transactionImporter
    .deleteTransaction(event.headers['user-id'], event.pathParameters.id));
};

export async function getChart(event, context, callback) {
  // make headers lowercase
  const headers = Object.keys(event.headers);
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

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

  try {
    while (currentDate.format('YYYYMMDD') < moment().format('YYYYMMDD')) {
      currentPortfolio = await transactionImporter.getPortfolio(event.pathParameters.id, currentDate);
      symbols = symbols.concat(Object.keys(currentPortfolio.portfolio));
      portfolios[currentDate.format('YYYYMMDD')] = currentPortfolio;
      currentDate = currentDate.add(steps, 'days');
    }
  } catch (error) {
    return callback(null, {
      statusCode: error.statusCode,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify({
        message: error.message
      })
    });
  }

  // Add today
  currentPortfolio = await transactionImporter.getPortfolio(event.pathParameters.id, moment().format('YYYYMMDD'));
  symbols = symbols.concat(Object.keys(currentPortfolio.portfolio));
  portfolios[moment().format('YYYYMMDD')] = currentPortfolio;

  // unique
  symbols = Array.from(new Set(symbols));

  yahooFinance.historical({
    symbols: symbols,
    from: moment(response.startDate).format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD')
  })
  .then((result) => {
    return callback(null, chartService.getResponse(portfolios, result));
  })
  .catch((error) => {
    const resp = {
      statusCode: 200,
      body: JSON.stringify({
        currentPortfolio: currentPortfolio,
        id: event.pathParameters.id,
        error: error
      }),
      headers: helper.getCORSHeaders()
    };
    return callback(null, resp);
  });
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
      return callback((null), {
        statusCode: error.statusCode,
        headers: helper.getCORSHeaders(),
        body: {
          message: error.message
        }
      });
    }

    const symbols = Object.keys(portfolio);

    if (symbols.length > 0) {
      yahooFinance.quote({
        symbols: symbols,
        modules: ['price', 'summaryProfile']
      }).then((result) => {
        return callback(null, portfolioService.getResponse(portfolio, result));
      }).catch((error) => {
        return callback((null), {
          statusCode: 500,
          headers: helper.getCORSHeaders(),
          body: {
            message: error
          }
        });
      });
    } else {
      return callback(null, portfolioService.getEmptyResponse());
    }
  }).catch((error) => {
    return callback((null), {
      statusCode: 500,
      headers: helper.getCORSHeaders(),
      body: {
        message: error
      }
    });
  });
};

export async function getSymbols(event, context, callback) {
  try {
    return callback(null, await symbolService.loadSymbols());
  } catch(error) {
    return callback(null, {
      statusCode: error.statusCode,
      headers: helper.getCORSHeaders(),
      body: {
        message: error.message
      }
    });
  }
};

export async function getTransactions(event, context, callback) {
  // make headers lowercase
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  exchangeRateDataService.loadCurrencies(event.headers['currency'])
  .then(async () => {
    return callback(null, await transactionImporter.getTransactions(event.pathParameters.id));
  }).catch((error) => {
    return callback(null, {
      statusCode: 500,
      headers: helper.getCORSHeaders(),
      body: {
        message: error
      }
    });
  });
};

export async function postTransaction(event, context, callback) {
  // make headers lowercase
  event.headers = transform(event.headers, (result, val, key) => {
    result[key.toLowerCase()] = val
  });

  return callback(null, await transactionImporter.postTransaction(event.headers['user-id'], JSON.parse(event.body)));
};
