import * as yahooFinance from 'yahoo-finance';

class ExchangeRateDataService {
  private baseCurrency = 'CHF';
  private baseCurrencySymbol = 'CHF';
  private currencies = {};

  private pairs = [
    `USD${this.baseCurrency}=X`,
    `EUR${this.baseCurrency}=X`
  ];

  public loadCurrencies() {
    return new Promise((resolve, reject) => {
      yahooFinance.quote({
        symbols: this.pairs,
        modules: ['price']
      }).then((result) => {
        for (var pair in result) {
          this.currencies[pair.replace('=X', '')] =
            result[pair].price.regularMarketPrice;
        }

        resolve();
      }).catch((error) => {
        reject();
      });
    });
  }

  public getRateToBaseCurrency(currency) {
    if (currency === this.baseCurrency) {
      // base currency has rate 1:1
      return 1;
    } else {
      return this.currencies[currency + this.baseCurrency];
    }
  }

  public getBaseCurrency() {
    return this.baseCurrency;
  }

  public getBaseCurrencySymbol() {
    return this.baseCurrencySymbol;
  }
}

export const exchangeRateDataService = new ExchangeRateDataService();
