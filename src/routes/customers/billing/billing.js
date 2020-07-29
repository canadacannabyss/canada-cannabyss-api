const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

app.use(cors());

const Billing = require('../../../models/billing/Billings');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.post('/create', async (req, res) => {
  const {
    user,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  } = req.body;
  const newBilling = new Billing({
    user,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  });

  newBilling
    .save()
    .then((billing) => {
      res.json(billing);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/billing/:billingId', async (req, res) => {
  const { billingId } = req.params;

  Billing.findOne({
    _id: billingId,
  })
    .then((billing) => {
      res.json(billing);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/all/:userId', async (req, res) => {
  const { userId } = req.params;

  Billing.find({
    user: userId,
  })
    .then((billing) => {
      res.json(billing);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
