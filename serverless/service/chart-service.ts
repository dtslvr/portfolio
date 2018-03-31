import { exchangeRateDataService } from './exchange-rate-data-service';
import { helper } from './helper';
import { find } from 'lodash';
import * as moment from 'moment';

class ChartService {
  public getEmptyResponse() {
    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify({
        quotes: [],
        volume: {
          currency: exchangeRateDataService.getBaseCurrency(),
          currencySymbol: exchangeRateDataService.getBaseCurrencySymbol(),
          price: {
            allTime: {
              performance: 0,
              performancePercent: 0,
              price: 0
            },
            today: {
              performance: 0,
              performancePercent: 0,
              price: 0
            }
          }
        }
      })
    };
  }

  public getResponse(portfolios, result) {
    const resultMap = {};

    Object.keys(result).forEach((symbol) => {
      resultMap[symbol] = {};
      result[symbol].forEach((item) => {
        resultMap[symbol][moment(item.date).format('YYYYMMDD')] = item;
      });
    });

    const response = {};

    let missingPriceCount = 0;

    for (const timestamp in portfolios) {
      let price = 0;

      for (const symbol in portfolios[timestamp].portfolio) {
        // Calculate performance
        if (
          resultMap &&
          resultMap[symbol] &&
          resultMap[symbol][timestamp] &&
          resultMap[symbol][timestamp].close
        ) {
          price +=
            portfolios[timestamp].portfolio[symbol].quantity *
            (resultMap[symbol][timestamp].close -
              portfolios[timestamp].portfolio[symbol].averagePrice);
        } else {
          let priceClose = 0;

          for (let i = 1; i < 10; i++) {
            // Go back (decrementally) to find an earlier price and fill gaps of weekends
            const tempTimestamp = moment(timestamp, 'YYYYMMDD')
              .subtract(i, 'days')
              .format('YYYYMMDD');

            if (
              resultMap &&
              resultMap[symbol] &&
              resultMap[symbol][tempTimestamp] &&
              resultMap[symbol][tempTimestamp].close
            ) {
              priceClose = resultMap[symbol][tempTimestamp].close;
              break;
            }
          }

          if (priceClose !== 0) {
            price +=
              portfolios[timestamp].portfolio[symbol].quantity *
              (priceClose -
                portfolios[timestamp].portfolio[symbol].averagePrice);
          } else {
            // TODO
            // console.warn(`Warning: ${timestamp} price missing for ${symbol} (using average price)`);
            price += 0;
            missingPriceCount++;
          }
        }
      }

      if (price !== 0) {
        response[timestamp] = {
          price
        };
      }
    }

    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify(response)
    };
  }
}

export const chartService = new ChartService();
