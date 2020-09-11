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
const Tag = require('../models/tag/Tag');

app.get('/product/products/:userId', (req, res) => {
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
      res.status(200).send(products);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/bundle/bundles/:userId', (req, res) => {
  const { userId } = req.params;
  Bundle.find({
    user: userId,
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
      res.status(200).send(products);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
