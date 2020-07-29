const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

app.use(cors());

const Shipping = require('../../../models/shipping/Shipping');

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

  const newShipping = new Shipping({
    user,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  });

  newShipping
    .save()
    .then((shipping) => {
      res.json(shipping);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/shipping/:shippingId', async (req, res) => {
  const { shippingId, userId } = req.params;

  Shipping.findOne({
    _id: shippingId,
    user: userId,
  })
    .then((shipping) => {
      res.json(shipping);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/all/:userId', async (req, res) => {
  const { userId } = req.params;

  Shipping.find({
    user: userId,
  })
    .then((shipping) => {
      res.json(shipping);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
