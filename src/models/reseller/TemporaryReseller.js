const mongoose = require('mongoose');

var db2 = mongoose.createConnection(
  process.env.ATLAS_URI_CANADA_CANNABYSS_USER,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
);

const TemporaryResellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
  },
  isCanadaCannabyssTeam: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
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

const TemporaryReseller = db2.model(
  'TemporaryReseller',
  TemporaryResellerSchema
);

module.exports = TemporaryReseller;
