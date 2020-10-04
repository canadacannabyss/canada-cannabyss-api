const express = require('express');
const router = express.Router();
const _ = require('lodash');

const fetch = require('node-fetch');

const AcceptedPaymentMethod = require('../../../models/acceptedPaymentMethod/AcceptedPaymentMethod');
const Admin = require('../../../models/admin/Admin');

const verifyValidSymbol = async (symbol) => {
  try {
    const crypto = await AcceptedPaymentMethod.find({
      'cryptocurrency.symbol': symbol,
      'deletion.isDeleted': false,
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

router.get('', (req, res) => {
  AcceptedPaymentMethod.find({
    type: 'cryptocurrency',
    'deletion.isDeleted': false,
  })
    .then((acceptedPaymentMethods) => {
      res.status(200).send(acceptedPaymentMethods);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/get/cryptocurrencies', async (req, res) => {
  const { limit, sort } = req.query;

  try {
    const promised = await Promise.all([getCryptocurrencyies(limit, sort)]);

    const promisedWithLogo = promised[0].data.map(async (promise) => {
      const func = await getCryptocurrencyiesInfo(promise.symbol);
      return func;
    });

    const resultPromisedWithLogo = await Promise.all(promisedWithLogo);

    console.log('resultPromisedWithLogo:', resultPromisedWithLogo);

    const finalResult = resultPromisedWithLogo.map((test, index) => {
      return {
        index: index,
        symbol: promised[0].data[index].symbol,
        name: promised[0].data[index].name,
        logo: test.data[Object.keys(test.data)[0]].logo,
      };
    });

    res.json({
      data: finalResult,
    });
  } catch (err) {
    console.error(err);
    res.status(200).send({});
  }
});

router.get('/get/eth/price', async (req, res) => {
  const ethPrice = await getCurrentCryptocurrencyPrice('ETH');
  console.log('data:', ethPrice);
  res.json(ethPrice.data.ETH.quote.CAD.price);
});

router.get('/get/btc/price', async (req, res) => {
  const btcPrice = await getCurrentCryptocurrencyPrice('BTC');
  console.log('data:', btcPrice);
  res.json(btcPrice.data.BTC.quote.CAD.price);
});

router.get('/get/price', async (req, res) => {
  const { symbol } = req.query;

  const cryptoPrice = await getCurrentCryptocurrencyPrice(symbol);
  console.log('data:', cryptoPrice);
  res.json(cryptoPrice.data[symbol].quote.CAD.price);
});

router.post('/get/total/cryptocurrency', async (req, res) => {
  const { totalInFiat, cryptocurrencySymbol } = req.body;

  let cryptocurrencyPrice;
  let totalInCryptocurrency;

  if (cryptocurrencySymbol === 'BTC') {
    cryptocurrencyPrice = await getCurrentCryptocurrencyPrice('BTC');
    totalInCryptocurrency = (
      totalInFiat / cryptocurrencyPrice.data.BTC.quote.CAD.price
    ).toFixed(8);
  } else if (cryptocurrencySymbol === 'ETH') {
    cryptocurrencyPrice = await getCurrentCryptocurrencyPrice('ETH');
    totalInCryptocurrency = (
      totalInFiat / cryptocurrencyPrice.data.ETH.quote.CAD.price
    ).toFixed(8);
  }

  console.log('totalInCryptocurrency:', totalInCryptocurrency);
  res.status(200).send({ totalInCryptocurrency });
});

router.get('/validation/symbol/:symbol', (req, res) => {
  const { symbol } = req.params;
  const verificationRes = verifyValidSymbol(symbol);
  res.json({
    valid: verificationRes,
  });
});

router.get('/:symbol', (req, res) => {
  const { symbol } = req.params;
  console.log('sybol:', symbol);

  AcceptedPaymentMethod.findOne({
    'cryptocurrency.symbol': symbol,
    'deletion.isDeleted': false,
  })
    .then((acceptedPaymentMethod) => {
      console.log('acceptedPaymentMethod:', acceptedPaymentMethod);
      res.status(200).send(acceptedPaymentMethod);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post('/create', (req, res) => {
  const { logo, symbol, name, address, admin } = req.body;

  const newAcceptedPaymentMethod = new AcceptedPaymentMethod({
    admin,
    type: 'cryptocurrency',
    cryptocurrency: {
      logo,
      symbol,
      name,
      address,
    },
  });

  newAcceptedPaymentMethod
    .save()
    .then(() => {
      res.status(201).send({
        ok: true,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.put('/delete/cryptocurrency/:id', (req, res) => {
  const { id } = req.params;

  AcceptedPaymentMethod.findOneAndUpdate(
    {
      _id: id,
    },
    {
      'deletion.isDeleted': true,
      'deletion.when': Date.now(),
    },
    {
      runValidators: true,
    }
  )
    .then(() => {
      res.status(200).send({ ok: true });
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;
