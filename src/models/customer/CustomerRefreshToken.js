const mongoose = require('mongoose');

var db2 = mongoose.createConnection(
  process.env.ATLAS_URI_CANADA_CANNABYSS_USER,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
);

const CustomerRefreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true,
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
    default: Date.now,
  },
});

const CustomerRefreshToken = db2.model(
  'CustomerRefreshToken',
  CustomerRefreshTokenSchema
);

module.exports = CustomerRefreshToken;
