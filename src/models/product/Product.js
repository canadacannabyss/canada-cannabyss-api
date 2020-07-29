const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const ProductSchema = new mongoose.Schema({
  media: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductMedia',
      required: false,
    },
  ],
  productName: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  howManyViewed: {
    type: Number,
    required: true,
    default: 0,
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
  taxableProduct: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  extraInfo: [
    {
      title: {
        type: String,
        required: false,
        default: '',
      },
      description: {
        type: String,
        required: false,
        default: '',
      },
    },
  ],
  inventory: {
    sku: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    allowPurchaseOutOfStock: {
      type: Boolean,
      required: true,
    },
  },
  shipping: {
    physicalProduct: {
      type: Boolean,
      required: true,
    },
    weight: {
      unit: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  },
  variants: {
    variantsOptionNames: {
      type: [String],
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  },
  seo: {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  organization: {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
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

const Product = db.model('Product', ProductSchema);

module.exports = Product;
