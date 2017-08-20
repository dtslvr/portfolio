module.exports = {};

const request = require('request');

const internals = {
	baseCurrency: 'CHF',
	baseCurrencySymbol: 'CHF',
	currencies: {}
};

internals.pairs = [
	'USD' + internals.baseCurrency,
	'EUR' + internals.baseCurrency
];


module.exports.loadCurrencies = () => {
	return new Promise((resolve, reject) => {
		request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDCHF%22%2C%20%22EURCHF%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', function(error, response, body) {
			if (!error && response.statusCode == 200) {
				JSON.parse(body).query.results.rate.forEach((pair) => {
					internals.currencies[pair.id] = parseFloat(pair.Rate);
				});

	    	resolve();
	  	} else {
				reject(error);
			}
		});
	});
};

module.exports.getRateToBaseCurrency = (currency) => {
	if (currency === internals.baseCurrency) {
		// base currency has rate 1:1
		return 1;
	} else {
		return internals.currencies[currency + internals.baseCurrency];
	}
};

module.exports.getBaseCurrency = function() {
	return internals.baseCurrency;
};

module.exports.getBaseCurrencySymbol = function() {
	return internals.baseCurrencySymbol;
};
