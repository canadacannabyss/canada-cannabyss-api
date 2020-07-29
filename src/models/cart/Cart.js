const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const CartSchema = new mongoose.Schema({
  items: [
    {
      _id: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      itemName: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      variant: {
        type: [String],
        default: null,
      },
      prices: {
        price: {
          type: Number,
          required: true,
        },
        compareTo: {
          type: Number,
          required: false,
        },
      },
      quantity: {
        type: Number,
        required: true,
        default: 0,
      },
      media: {
        url: {
          type: String,
          required: true,
        },
      },
      variantName: {
        type: [String],
        require: true,
      },
      variant: {
        type: [String],
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paid: {
    type: Boolean,
    required: true,
    default: false,
  },
  completed: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const Cart = db.model('Cart', CartSchema);

module.exports = Cart;
