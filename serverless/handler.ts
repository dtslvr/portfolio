'use strict';

import { exchangeRateDataService } from './service/exchange-rate-data-service';
import { helper } from './service/helper';
import { transform } from 'lodash';
import * as moment from 'moment';
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
      portfolio = await transactionImporter.getPortfolio(event.pathParameters.id, moment());
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
