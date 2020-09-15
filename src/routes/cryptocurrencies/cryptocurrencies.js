const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

const getCurrentEthPrice = async () => {
  const response = await fetch(
    `${process.env.COIN_MARKET_CAP_API}/v1/cryptocurrency/quotes/latest?symbol=ETH`,
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

router.get('/get/eth/price', async (req, res) => {
  const ethPrice = await getCurrentEthPrice();
  console.log('data:', ethPrice);
  res.json(ethPrice.data.ETH.quote.USD.price);
});

module.exports = router;
