const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const GstHst = require('../../../utils/taxes/gstHst');

app.use(cors());

const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  PaymentMethod.find({
    customer: userId,
  })
    .then((paymentMethods) => {
      res.json(paymentMethods);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/e-transfer/create', async (req, res) => {
  const { userId } = req.body;

  const newPaymentMethod = new PaymentMethod({
    customer: userId,
    eTransfer: true,
  });

  newPaymentMethod
    .save()
    .then((paymentPayment) => {
      res.status(200).send(paymentPayment);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/e-transfer/get/by/user/:userId', async (req, res) => {
  const { userId } = req.params;
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: true,
  })
    .then((paymentMethod) => {
      let paymentMethodObj = {};
      if (paymentMethod !== null) {
        paymentMethodObj = paymentMethod;
      }
      res.status(200).send(paymentMethodObj);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/e-transfer/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
});

app.post('/cryptocurrency/create', async (req, res) => {
  const { userId, cryptocurrency } = req.body;

  console.log(req.body);

  const newPaymentMethod = new PaymentMethod({
    customer: userId,
    eTransfer: false,
    cryptocurrency: {
      symbol: cryptocurrency.symbol,
      address: cryptocurrency.address,
    },
  });

  newPaymentMethod
    .save()
    .then((paymentPayment) => {
      res.status(200).send(paymentPayment);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/cryptocurrency/get/by/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { symbol, address } = req.query;
  console.log('symbol:', symbol);
  console.log('address:', address);
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: false,
    cryptocurrency: {
      symbol: symbol,
      address: address,
    },
  })
    .then((paymentMethod) => {
      let paymentMethodObj = {};
      if (paymentMethod !== null) {
        paymentMethodObj = paymentMethod;
      }
      res.status(200).send(paymentMethodObj);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/cryptocurrency/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
});

module.exports = app;
