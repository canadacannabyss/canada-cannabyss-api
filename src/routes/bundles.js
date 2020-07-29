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
const ProductMedia = require('../models/product/ProductMedia');
const Bundle = require('../models/bundle/Bundle');
const BundleComment = require('../models/bundle/BundleComment');
const BundleCommentReply = require('../models/bundle/BundleCommentReply');
const User = require('../models/user/User');
const UserProfileImage = require('../models/user/UserProfileImage');
const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');

app.get('/', (req, res) => {
  let productsList = [];
  Bundle.find()
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/bundle/:slug', (req, res) => {
  const { slug } = req.params;
  console.log('slug product:', slug);
  Bundle.findOne({
    slug,
  })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/comments/:bundleId', async (req, res) => {
  const { bundleId } = req.params;

  let commentsList = [];

  BundleComment.find({
    bundle: bundleId,
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
      publishedOn: '-1',
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
          publishedOn: comment.publishedOn,
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

app.get('/get/categories', async (req, res) => {
  let categoriesList = [];
  Bundle.distinct('organization.category', async (error, results) => {
    const categories = await Category.find({
      _id: results,
    });
    categories.map((category) => {
      categoriesList.push({
        id: category._id,
        categoryName: category.categoryName,
        slug: category.slug,
      });
    });
    res.status(200).send(categoriesList);
  });
});

app.get('/get/bundles/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const categoryObj = await Category.findOne({
      slug: category,
    });
    console.log('categoryObj:', categoryObj);

    const BundlessList = await Bundle.find({
      'organization.category': categoryObj._id,
    }).populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    });

    console.log('BundlessList:', BundlessList);
    if (BundlessList !== null) {
      res.status(200).send(BundlessList);
    } else {
      res.status(200).send([]);
    }
  } catch (err) {
    console.log(err);
  }
});

app.put('/update/how-many-viewed', async (req, res) => {
  const { slug } = req.body;

  try {
    const bundle = await Bundle.findOne({
      slug,
    });

    const howManyViewedNumber = await bundle.howManyViewed;

    await Bundle.updateOne(
      {
        slug,
      },
      {
        howManyViewed: howManyViewedNumber + 1,
      },
      {
        runValidators: true,
      }
    );
    res.status(200).send({ howManyViewedNumber: howManyViewedNumber + 1 });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
