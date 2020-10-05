const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const PostalServiceSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
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
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const PostalService = db.model('PostalService', PostalServiceSchema);

module.exports = PostalService;
