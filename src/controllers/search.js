const Product = require('../models/product/Product');
const ProductMedia = require('../models/product/ProductMedia');
const Bundle = require('../models/bundle/Bundle');
const Promotion = require('../models/promotion/Promotion');
const PromotionMedia = require('../models/promotion/PromotionMedia');
const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');

module.exports = {
  search: async (req, res) => {
    const query = req.query.query;
    const type = req.query.type;
    console.log('query:', query);
    console.log('type:', type);

    const finalResult = {};

    if (type === 'all') {
      try {
        const products = await Product.find({
          productName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: ProductMedia,
        });
        const bundles = await Bundle.find({
          bundleName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'products',
          model: Product,
          populate: {
            path: 'media',
            model: ProductMedia,
          },
        });
        const promotions = await Promotion.find({
          promotionName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: PromotionMedia,
        });
        const categories = await Category.find({
          categoryName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: CategoryMedia,
        });
        finalResult.type = 'all';
        finalResult.products = products;
        finalResult.bundles = bundles;
        finalResult.promotions = promotions;
        finalResult.categories = categories;
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'products') {
      try {
        const products = await Product.find({
          productName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: ProductMedia,
        });
        finalResult.type = 'products';
        finalResult.products = products;
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'bundles') {
      try {
        const bundles = await Bundle.find({
          bundleName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'products',
          model: Product,
          populate: {
            path: 'media',
            model: ProductMedia,
          },
        });
        finalResult.type = 'bundles';
        finalResult.bundles = bundles;
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'promotions') {
      try {
        const promotions = await Promotion.find({
          promotionName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: PromotionMedia,
        });
        finalResult.type = 'promotions';
        finalResult.promotions = promotions;
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'categories') {
      try {
        const categories = await Category.find({
          categoryName: { $regex: new RegExp(query, 'i') },
        }).populate({
          path: 'media',
          model: CategoryMedia,
        });
        finalResult.type = 'categories';
        finalResult.categories = categories;
      } catch (err) {
        console.error(err);
      }
    } else if (type === 'tags') {
    }
    return res.status(200).send(finalResult);
  }
}