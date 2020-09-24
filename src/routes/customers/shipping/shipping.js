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
    customer: user,
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
    customer: userId,
    deleted: false,
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
    customer: userId,
    deleted: false,
  })
    .then((shipping) => {
      res.json(shipping);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/edit/:shippingId', async (req, res) => {
  const {
    id,
    name,
    country,
    provinceState,
    city,
    addressLine1,
    addressLine2,
    postalCode,
  } = req.body;

  Shipping.findOneAndUpdate(
    {
      _id: id,
    },
    {
      name: {
        first: name.first,
        last: name.last,
      },
      country: country,
      provinceState: provinceState,
      city: city,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      postalCode: postalCode,
    },
    {
      runValidators: true,
    }
  )
    .then((billing) => {
      console.log('billing:', billing);
      res.status(200).send({ ok: true });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.put('/delete/:shippingId', async (req, res) => {
  const { shippingId } = req.params;

  try {
    Shipping.findOneAndUpdate(
      {
        _id: shippingId,
      },
      {
        'deletion.isDeleted': true,
        'deletion.when': Date.now(),
      },
      {
        runValidators: true,
      }
    ).then(() => {
      res.status(200).send({ ok: true });
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
