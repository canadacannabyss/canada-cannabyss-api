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
    customer: user,
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
    deleted: false,
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
    customer: userId,
    deleted: false,
  })
    .then((billing) => {
      res.json(billing);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/edit/:billingId', async (req, res) => {
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

  Billing.findOneAndUpdate(
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

app.put('/delete/:billingId', async (req, res) => {
  const { billingId } = req.params;

  try {
    Billing.findOneAndUpdate(
      {
        _id: billingId,
      },
      {
        deleted: true,
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
