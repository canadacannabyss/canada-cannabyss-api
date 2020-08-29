/* eslint-disable array-callback-return */
const express = require('express');

const app = express();
const router = express.Router();
const cors = require('cors');
const multer = require('multer');
// const multerConfig = require('../config/multer');

// const authMiddleware = require('../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Product = require('../models/product/Product');
const ProductComment = require('../models/product/ProductComment');
const ProductCommentReply = require('../models/product/ProductCommentReply');
const ProductMedia = require('../models/product/ProductMedia');
const Bundle = require('../models/bundle/Bundle');
const User = require('../models/user/User');
const UserProfileImage = require('../models/user/UserProfileImage');
const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');
const Banner = require('../models/banner/Banner');
const Promotion = require('../models/promotion/Promotion');
const PromotionMedia = require('../models/promotion/PromotionMedia');

app.get('/main/products', (req, res) => {
  let productsList = [];
  Product.find()
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
      res.json(productsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/main/bundles', (req, res) => {
  let bundlesList = [];
  Bundle.find()
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
      res.json(bundlesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/main/banners', async (req, res) => {
  Banner.find({
    featured: true,
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
      res.status(200).send(banner);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/main/category', (req, res) => {
  Category.find({
    featured: true,
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
      res.json(categories);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/main/newest/products', (req, res) => {
  let productsList = [];
  Product.find()
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
      res.json(productsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/product/:slug', (req, res) => {
  const { slug } = req.params;
  console.log('slug product:', slug);
  Product.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/comments/:productId', async (req, res) => {
  const { productId } = req.params;

  let commentsList = [];

  ProductComment.find({
    product: productId,
  })
    .populate({
      path: 'user',
      model: User,
      populate: {
        path: 'profileImage',
        model: UserProfileImage,
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
          user: {
            name: comment.user.name,
            username: comment.user.username,
            profileImage: {
              url: comment.user.profileImage.url,
            },
          },
          content: comment.content,
          createdOn: comment.createdOn,
          likes: comment.likes,
          dislikes: comment.dislikes,
        });
      });
      res.json(commentsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
