import * as yahooFinance from 'yahoo-finance';

class ExchangeRateDataService {

  private baseCurrency;
  private baseCurrencySymbol;
  private currencies = {};

  private pairs: string[] = [];

  private addPair(aCurrency) {
    if (aCurrency !== this.baseCurrency) {
      this.pairs.push(`${aCurrency}${this.baseCurrency}=X`);
    }
  }

  public loadCurrencies(aBaseCurrency?: string) {
    this.baseCurrency = aBaseCurrency || 'USD';
    this.baseCurrencySymbol = aBaseCurrency || 'USD';

    this.addPair('CHF');
    this.addPair('EUR');
    this.addPair('USD');

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
