const Billing = require('../../../models/billing/Billings');

module.exports = {
  create: async (req, res) => {
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
        return res.json(billing);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getById: async (req, res) => {
    const { billingId } = req.params;

    Billing.findOne({
      _id: billingId,
      deleted: false,
    })
      .then((billing) => {
        return res.json(billing);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getAllByUser: async (req, res) => {
    const { userId } = req.params;

    Billing.find({
      customer: userId,
      'deletion.isDeleted': false,
    })
      .then((billing) => {
        return res.json(billing);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  edit: async (req, res) => {
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
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      }
    )
      .then((billing) => {
        console.log('billing:', billing);
        return res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  delete: async (req, res) => {
    const { billingId } = req.params;

    try {
      Billing.findOneAndUpdate(
        {
          _id: billingId,
        },
        {
          'deletion.isDeleted': true,
          'deletion.when': Date.now(),
        },
        {
          runValidators: true,
        }
      ).then(() => {
        return res.status(200).send({ ok: true });
      });
    } catch (err) {
      console.error(err);
    }
  }
}