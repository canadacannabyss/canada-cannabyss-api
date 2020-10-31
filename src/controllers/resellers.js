const Product = require('../models/product/Product');
const ProductMedia = require('../models/product/ProductMedia');
const Bundle = require('../models/bundle/Bundle');

module.exports = {
  productProducts: (req, res) => {
    const { userId } = req.params;
    Product.find({
      reseller: userId,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .limit(4)
      .then((products) => {
        return res.status(200).send(products);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  bundleBundles: (req, res) => {
    const { userId } = req.params;
    Bundle.find({
      reseller: userId,
    })
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .limit(4)
      .then((products) => {
        return res.status(200).send(products);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}