import { exchangeRateDataService } from './exchange-rate-data-service';
import { helper } from './helper';
import { find } from 'lodash';

class PortfolioService {
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

  public getResponse(portfolio, result) {
    let volumeToday = 0;
    let volumeStart = 0;

    for (const symbol in portfolio) {
      volumeStart +=
        portfolio[symbol].quantity *
        portfolio[symbol].averagePrice *
        exchangeRateDataService.getRateToBaseCurrency(
          result[symbol].price.currency
        );
      volumeToday +=
        portfolio[symbol].quantity *
        result[symbol].price.regularMarketPrice *
        exchangeRateDataService.getRateToBaseCurrency(
          result[symbol].price.currency
        );
      result[symbol].quantity = portfolio[symbol].quantity;
      result[symbol].price.averagePortfolioPrice =
        portfolio[symbol].averagePrice;
    }

    const quotes = Object.keys(result).map((key) => {
      return {
        averagePrice: portfolio[key].averagePrice,
        currency: result[key].price.currency,
        currencySymbol: result[key].price.currencySymbol,
        exchangeName: result[key].price.exchangeName,
        industry:
          (result[key].summaryProfile && result[key].summaryProfile.industry) ||
          'Unknown',
        marketState: result[key].price.marketState,
        name: result[key].price.longName || result[key].price.shortName,
        portfolioShareAcquisition:
          (portfolio[key].quantity * portfolio[key].averagePrice) / volumeStart,
        portfolioShareToday:
          (portfolio[key].quantity * result[key].price.regularMarketPrice) /
          volumeToday,
        price: {
          allTime: {
            portfolioMarketChange:
              portfolio[key].quantity *
              (result[key].price.regularMarketPrice -
                portfolio[key].averagePrice),
            portfolioMarketPrice:
              portfolio[key].quantity * result[key].price.regularMarketPrice,
            regularMarketChange:
              result[key].price.regularMarketPrice -
              portfolio[key].averagePrice,
            regularMarketChangePercent:
              (result[key].price.regularMarketPrice -
                portfolio[key].averagePrice) /
              portfolio[key].averagePrice,
            regularMarketPrice: result[key].price.regularMarketPrice
          },
          today: Object.assign(result[key].price, {
            portfolioMarketChange:
              portfolio[key].quantity * result[key].price.regularMarketChange,
            portfolioMarketPrice:
              portfolio[key].quantity * result[key].price.regularMarketPrice
          })
        },
        quantity: portfolio[key].quantity,
        sector:
          (result[key].summaryProfile && result[key].summaryProfile.sector) ||
          'Unknown',
        symbol: key,
        type:
          helper.capitalizeFirstLetter(result[key].price.quoteType) || 'Unknown'
      };
    });

    let volumePerformanceToday = 0;
    Object.keys(portfolio).map((key) => {
      const quote = find(quotes, { symbol: key });
      if (quote && quote.marketState === 'REGULAR') {
        // Calculate performance of today only if market is open
        volumePerformanceToday +=
          portfolio[key].quantity *
          quote.price.today.regularMarketChange *
          exchangeRateDataService.getRateToBaseCurrency(
            quote.price.today.currency
          );
      }
    });

    return {
      statusCode: 200,
      headers: helper.getCORSHeaders(),
      body: JSON.stringify({
        quotes,
        volume: {
          currency: exchangeRateDataService.getBaseCurrency(),
          currencySymbol: exchangeRateDataService.getBaseCurrencySymbol(),
          price: {
            allTime: {
              performance: volumeToday - volumeStart,
              performancePercent: (volumeToday - volumeStart) / volumeStart,
              price: volumeToday
            },
            today: {
              performance: volumePerformanceToday,
              performancePercent: volumePerformanceToday / volumeToday,
              price: volumeToday
            }
          }
        }
      })
    };
  }
}

export const portfolioService = new PortfolioService();
