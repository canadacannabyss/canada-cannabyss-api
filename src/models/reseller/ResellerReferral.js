const mongoose = require('mongoose');

var db2 = mongoose.createConnection(
  process.env.ATLAS_URI_CANADA_CANNABYSS_USER,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
);

const ResellerReferralSchema = new mongoose.Schema({
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: true,
  },
  referredResellers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reseller',
      required: false,
    },
  ],
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
  updatedOn: {
    type: Date,
    required: false,
  },
});

const ResellerReferral = db2.model('ResellerReferral', ResellerReferralSchema);

module.exports = ResellerReferral;
