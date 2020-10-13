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
  const { userId, recipient } = req.body;

  const newPaymentMethod = new PaymentMethod({
    customer: userId,
    eTransfer: {
      recipient: recipient,
      isETransfer: true,
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

app.get('/e-transfer/get/by/user/:userId/:recipient', async (req, res) => {
  const { userId, recipient } = req.params;
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: {
      recipient: recipient,
      isETransfer: true,
    },
    deletion: {
      isDeleted: false,
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
      logo: cryptocurrency.logo,
      symbol: cryptocurrency.symbol,
      name: cryptocurrency.name,
      customerAddress: cryptocurrency.customerAddress,
      companyAddress: cryptocurrency.companyAddress,
      discount: {
        type: cryptocurrency.discount.type,
        amount: cryptocurrency.discount.amount,
      },
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
  const { logo, symbol, name, customerAddress, companyAddress } = req.query;
  console.log('req.body:', req.query);
  PaymentMethod.findOne({
    customer: userId,
    eTransfer: false,
    cryptocurrency: {
      logo,
      symbol,
      name,
      customerAddress,
      companyAddress,
    },
    'deletion.isDeleted': false,
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
