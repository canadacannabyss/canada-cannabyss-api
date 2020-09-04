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
const Tag = require('../models/tag/Tag');

app.get('', async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < (await Bundle.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  try {
    results.results = await Bundle.find()
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .exec();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
  }
});

app.get('/navbar/all', (req, res) => {
  let bundlesList = [];
  Bundle.find()
    .limit(18)
    .then((bundles) => {
      bundles.map((bundle) => {
        bundlesList.push({
          slug: bundle.slug,
          bundleName: bundle.bundleName,
        });
      });
      res.json(bundlesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/navbar/category/:category', (req, res) => {
  const { category } = req.params;
  let bundlesList = [];
  Bundle.find({
    'organization.category': category,
  })
    .limit(18)
    .then((bundles) => {
      bundles.map((bundle) => {
        bundlesList.push({
          slug: bundle.slug,
          bundleName: bundle.bundleName,
        });
      });
      res.json(bundlesList);
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
      path: 'user',
      model: User,
      populate: {
        path: 'profileImage',
        model: UserProfileImage,
      },
    })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .populate({
      path: 'organization.categories',
      model: Category,
    })
    .populate({
      path: 'organization.tags',
      model: Tag,
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
      createdOn: '-1',
    })
    .then((comments) => {
      comments.map((comment) => {
        console.log('comment.user:', comment.user.names);
        // console.log(
        //   'comment.user.names.lastName:',
        //   comment.user.names.lastName
        // );
        commentsList.push({
          replies: comment.replies,
          updatedOn: comment.updatedOn,
          _id: comment._id,
          user: {
            names: {
              firstName: comment.user.names.firstName,
              lastName: comment.user.names.lastName,
            },
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
  const categoryObj = await Category.findOne({
    slug: category,
  });

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (
    endIndex <
    (await Bundle.find({
      'organization.category': categoryObj._id,
    })
      .countDocuments()
      .exec())
  ) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  try {
    results.results = await Bundle.find({
      'organization.category': categoryObj._id,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
      })
      .exec();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
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
