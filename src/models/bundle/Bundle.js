const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const BundleSchema = new mongoose.Schema({
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: true,
  },
  // products: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Product',
  //     required: true,
  //   },
  // ],
  products: [
    {
      _id: {
        type: String,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
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
  bundleName: {
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
  taxableBundle: {
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
      required: false,
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
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
      },
    ],
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

const Bundle = db.model('Bundle', BundleSchema);

module.exports = Bundle;
