import * as request from 'request';

class ExchangeRateDataService {
	private baseCurrency = 'CHF';
	private baseCurrencySymbol = 'CHF';
	private currencies = {};

	private pairs = [
		'USD' + this.baseCurrency,
		'EUR' + this.baseCurrency
	];

	public loadCurrencies() {
		return new Promise((resolve, reject) => {
			request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDCHF%22%2C%20%22EURCHF%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', (error, response, body) => {
				if (!error && response.statusCode == 200) {
					JSON.parse(body).query.results.rate.forEach((pair) => {
						this.currencies[pair.id] = parseFloat(pair.Rate);
					});

		    	resolve();
		  	} else {
					reject(error);
				}
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
