const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const AcceptedPaymentMethodSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cryptocurrency: {
    logo: {
      type: String,
      required: false,
      default: null,
    },
    symbol: {
      type: String,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
  },
  eTransfer: {
    recipient: {
      type: String,
      required: false,
      default: null,
    },
  },
  deletion: {
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    when: {
      type: Date,
      required: false,
    },
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const AcceptedPaymentMethod = db.model(
  'AcceptedPaymentMethod',
  AcceptedPaymentMethodSchema
);

module.exports = AcceptedPaymentMethod;
