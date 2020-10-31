const Product = require('../models/product/Product');
const ProductComment = require('../models/product/ProductComment');
const ProductCommentReply = require('../models/product/ProductCommentReply');
const ProductMedia = require('../models/product/ProductMedia');
const Bundle = require('../models/bundle/Bundle');
const Customer = require('../models/customer/Customer');
const CustomerProfileImage = require('../models/customer/CustomerProfileImage');
const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');
const Banner = require('../models/banner/Banner');
const Promotion = require('../models/promotion/Promotion');
const PromotionMedia = require('../models/promotion/PromotionMedia');

module.exports = {
  mainProducts: (req, res) => {
    let productsList = [];
    Product.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .limit(5)
      .then((products) => {
        products.map((product) => {
          productsList.push({
            id: product._id,
            productName: product.productName,
            slug: product.slug,
            prices: {
              price: product.prices.price,
              compareTo: product.prices.compareTo,
            },
            media: {
              url: product.media[0].url,
            },
          });
        });
        return res.json(productsList);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  mainBundles: (req, res) => {
    let bundlesList = [];
    Bundle.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .limit(5)
      .then((bundles) => {
        bundles.map((bundle) => {
          let bundleProductList = [];
          bundle.products.map((product) => {
            bundleProductList.push({
              media: {
                url: product.media[0].url,
              },
            });
          });
          bundlesList.push({
            id: bundle._id,
            bundleName: bundle.bundleName,
            slug: bundle.slug,
            prices: {
              price: bundle.prices.price,
              compareTo: bundle.prices.compareTo,
            },
            products: bundleProductList,
          });
        });
        return res.json(bundlesList);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  mainBanners: async (req, res) => {
    Banner.find({
      featured: true,
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
        populate: {
          path: 'media',
          model: PromotionMedia,
        },
      })
      .then((banner) => {
        return res.status(200).send(banner);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  mainMostBought: (req, res) => {
    Product.find()
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .sort([['howManyBought', -1]])
      .limit(8)
      .then((products) => {
        const productsList = products.map((product) => {
          return {
            id: product._id,
            productName: product.productName,
            slug: product.slug,
            prices: {
              price: product.prices.price,
              compareTo: product.prices.compareTo,
            },
            media: {
              url: product.media[0].url,
            },
          };
        });
        console.log('produicts:', products)
        return res.status(200).send(productsList)
      }).catch((err) => {
        console.error(err);
      })
  },

  mainCategories: (req, res) => {
    Category.find({
      featured: true,
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: CategoryMedia,
      })
      .sort({
        createdOn: -1,
      })
      .limit(8)
      .then((categories) => {
        return res.json(categories);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  mainNewestProducts: (req, res) => {
    let productsList = [];
    Product.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .limit(4)
      .sort({
        createdOn: -1,
      })
      .then((products) => {
        products.map((product) => {
          productsList.push({
            id: product._id,
            productName: product.productName,
            slug: product.slug,
            prices: {
              price: product.prices.price,
              compareTo: product.prices.compareTo,
            },
            media: {
              url: product.media[0].url,
            },
          });
        });
        return res.json(productsList);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getProductSlug: (req, res) => {
    const { slug } = req.params;
    console.log('slug product:', slug);
    Product.findOne({
      slug,
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .then((product) => {
        return res.json(product);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getComment: async (req, res) => {
    const { productId } = req.params;

    let commentsList = [];

    ProductComment.find({
      product: productId,
    })
      .populate({
        path: 'customer',
        model: Customer,
        populate: {
          path: 'profileImage',
          model: CustomerProfileImage,
        },
      })
      .sort({
        createdOn: '-1',
      })
      .then((comments) => {
        comments.map((comment) => {
          commentsList.push({
            replies: comment.replies,
            updatedOn: comment.updatedOn,
            _id: comment._id,
            customer: {
              name: comment.customer.name,
              username: comment.customer.username,
              profileImage: {
                url: comment.customer.profileImage.url,
              },
            },
            content: comment.content,
            createdOn: comment.createdOn,
            likes: comment.likes,
            dislikes: comment.dislikes,
          });
        });
        return res.json(commentsList);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}