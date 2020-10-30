const Product = require('../../../models/product/Product');
const ProductComment = require('../../../models/product/ProductComment');
const ProductCommentReply = require('../../../models/product/ProductCommentReply');
const ProductMedia = require('../../../models/product/ProductMedia');

const Bundle = require('../../../models/bundle/Bundle');
const BundleComment = require('../../../models/bundle/BundleComment');
const BundleCommentReply = require('../../../models/bundle/BundleCommentReply');

module.exports = {
  products: async (req, res) => {
    //   const { userId } = req.params;

    Product.find()
      .sort({ createdOn: -1 })
      .limit(4)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .then((products) => {
        return res.status(200).send(products);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}