const _ = require('lodash');

const fetch = require('node-fetch');

const AcceptedPaymentMethod = require('../../models/acceptedPaymentMethod/AcceptedPaymentMethod');
const Admin = require('../../models/admin/Admin');

const verifyValidSymbol = async (symbol) => {
  try {
    const crypto = await AcceptedPaymentMethod.find({
      symbol,
    });
    console.log('crypto:', crypto);
    if (!_.isEmpty(crypto)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

const getCurrentCryptocurrencyPrice = async (symbol) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=CAD`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

const getCryptocurrencyies = async (limit, sort) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/map?limit=${limit}&sort=${sort}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

const getCryptocurrencyiesInfo = async (symbol) => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/info?symbol=${symbol}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': `${process.env.COIN_MARKET_CAP_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

module.exports = {
  index: (req, res) => {
    AcceptedPaymentMethod.find({
      type: 'cryptocurrency',
    })
      .then((acceptedPaymentMethods) => {
        return res.status(200).send(acceptedPaymentMethods);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getCryptocurrencyies: async (req, res) => {
    const { limit, sort } = req.query;

    const promised = await Promise.all([getCryptocurrencyies(limit, sort)]);

    const promisedWithLogo = promised[0].data.map(async (promise) => {
      const func = await getCryptocurrencyiesInfo(promise.symbol);
      return func;
    });

    const resultPromisedWithLogo = await Promise.all(promisedWithLogo);

    const finalResult = resultPromisedWithLogo.map((test, index) => {
      return {
        index: index,
        symbol: promised[0].data[index].symbol,
        name: promised[0].data[index].name,
        logo: test.data[Object.keys(test.data)[0]].logo,
      };
    });

    return res.json({
      data: finalResult,
    });
  },

  getEthPrice: async (req, res) => {
    const ethPrice = await getCurrentCryptocurrencyPrice('ETH');
    console.log('data:', ethPrice);
    return res.json(ethPrice.data.ETH.quote.CAD.price);
  },

  getBtcPrice: async (req, res) => {
    const btcPrice = await getCurrentCryptocurrencyPrice('BTC');
    console.log('data:', btcPrice);
    return res.json(btcPrice.data.BTC.quote.CAD.price);
  },

  getPrice: async (req, res) => {
    const { symbol } = req.query;

    const cryptoPrice = await getCurrentCryptocurrencyPrice(symbol);
    console.log('data:', cryptoPrice);
    return res.json(cryptoPrice.data[symbol].quote.CAD.price);
  },

  getTotalCryptocurrency: async (req, res) => {
    const { totalInFiat, cryptocurrencySymbol } = req.body;

    const cryptocurrencyPrice = await getCurrentCryptocurrencyPrice(
      cryptocurrencySymbol
    );
    const totalInCryptocurrency = (
      totalInFiat / cryptocurrencyPrice.data[cryptocurrencySymbol].quote.CAD.price
    ).toFixed(8);

    console.log('totalInCryptocurrency:', totalInCryptocurrency);
    return res.status(200).send({ totalInCryptocurrency });
  },

  validateSymbol: async (req, res) => {
    const { symbol } = req.params;
    const verificationRes = await verifyValidSymbol(symbol);
    return res.json({
      valid: verificationRes,
    });
  }
}