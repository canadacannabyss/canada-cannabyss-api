const _ = require('lodash');

const fetch = require('node-fetch');

const AcceptedPaymentMethod = require('../../../models/acceptedPaymentMethod/AcceptedPaymentMethod');
const Admin = require('../../../models/admin/Admin');

const verifyValidETransfer = async (recipientEmail) => {
  try {
    const crypto = await AcceptedPaymentMethod.find({
      'eTransfer.recipient': recipientEmail,
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

module.exports = {
  index: (req, res) => {
    AcceptedPaymentMethod.find({
      type: 'e-transfer',
      'deletion.isDeleted': false,
    })
      .then((acceptedPaymentMethods) => {
        return res.status(200).send(acceptedPaymentMethods);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  validateRecipientEmail: async (req, res) => {
    const { recipientEmail } = req.params;
    const verificationRes = await verifyValidETransfer(recipientEmail);
    console.log('verificationRes:', verificationRes);
    return res.json({
      valid: verificationRes,
    });
  },

  create: (req, res) => {
    const { recipient, admin } = req.body;

    const newAcceptedPaymentMethod = new AcceptedPaymentMethod({
      admin,
      type: 'e-transfer',
      eTransfer: {
        recipient,
      },
    });

    newAcceptedPaymentMethod
      .save()
      .then(() => {
        return res.status(201).send({
          ok: true,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  delete: (req, res) => {
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
        return res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}