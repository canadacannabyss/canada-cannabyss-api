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
const User = require('../models/user/User');
const UserProfileImage = require('../models/user/UserProfileImage');
const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');
const Tag = require('../models/tag/Tag');

app.get('', async (req, res) => {
  let productsList = [];

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < (await Product.countDocuments().exec())) {
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
    results.results = await Product.find()
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .exec();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
  }
});

app.get('/navbar/all', (req, res) => {
  let productsList = [];
  Product.find()
    .limit(18)
    .then((products) => {
      products.map((product) => {
        productsList.push({
          slug: product.slug,
          productName: product.productName,
        });
      });
      res.json(productsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/navbar/category/:category', (req, res) => {
  const { category } = req.params;
  console.log('tested category:', category);
  let productsList = [];
  Product.find({
    'organization.category': category,
  })
    .limit(18)
    .then((products) => {
      console.log('products category:', products);
      products.map((product) => {
        productsList.push({
          slug: product.slug,
          productName: product.productName,
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
      path: 'user',
      model: User,
      populate: {
        path: 'profileImage',
        model: UserProfileImage,
      },
    })
    .populate({
      path: 'media',
      model: ProductMedia,
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
      const variantsValues = [];
      for (let i = 0; i < product.variants.variantsOptionNames.length; i += 1) {
        variantsValues.push([]);
      }
      product.variants.variantsOptionNames.map((name, index) => {
        product.variants.values.map((value) => {
          if (value.active) {
            variantsValues[index].push(value.variantValues[index]);
          }
        });
      });
      const uniqueVariantValues = [];
      for (let i = 0; i < product.variants.variantsOptionNames.length; i += 1) {
        uniqueVariantValues.push([]);
      }
      variantsValues.map((valueArray, index) => {
        uniqueVariantValues[index] = valueArray.filter(
          (v, i, a) => a.indexOf(v) === i
        );
      });
      res.json({
        prices: {
          price: product.prices.price,
          compareTo: product.prices.compareTo,
        },
        inventory: {
          sku: product.inventory.sku,
          barcode: product.inventory.barcode,
          quantity: product.inventory.quantity,
          allowPurchaseOutOfStock: product.inventory.allowPurchaseOutOfStock,
        },
        shipping: {
          weight: {
            unit: product.shipping.weight.unit,
            amount: product.shipping.weight.amount,
          },
        },
        variants: {
          variantsOptionNames: product.variants.variantsOptionNames,
          values: product.variants.values,
          uniqueValues: uniqueVariantValues,
        },
        seo: {
          title: product.seo.title,
          slug: product.seo.slug,
          description: product.seo.description,
        },
        organization: {
          categories: product.organization.categories,
          tags: product.organization.tags,
        },
        user: {
          _id: product.user._id,
          names: {
            firstName: product.user.names.firstName,
            lastName: product.user.names.lastName,
          },
          username: product.user.username,
          profileImage: {
            name: product.user.profileImage.name,
            url: product.user.profileImage.url,
          },
        },
        media: product.media,
        howManyViewed: product.howManyViewed,
        productName: product.productName,
        slug: product.slug,
        taxableProduct: product.taxableProduct,
        description: product.description,
        extraInfo: product.extraInfo,
        _id: product._id,
      });
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
        console.log('comment product:', comment.user.names.firstName);
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
  Product.distinct('organization.category', async (error, results) => {
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

app.get('/get/products/category/:category', async (req, res) => {
  const { category } = req.params;
  const categoryObj = await Category.findOne({
    slug: category,
  });

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  console.log(
    'await Product.countDocuments().exec():',
    await Product.find({
      'organization.category': categoryObj,
    })
      .countDocuments()
      .exec()
  );

  if (
    endIndex <
    (await Product.find({
      'organization.category': categoryObj,
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
    results.results = await Product.find({
      'organization.category': categoryObj,
    })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: 'media',
        model: ProductMedia,
      })
      .exec();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
  }
});

app.put('/update/how-many-viewed', async (req, res) => {
  const { slug } = req.body;

  console.log('how many viewed slug:', slug);

  try {
    const product = await Product.findOne({
      slug,
    });

    const howManyViewedNumber = await product.howManyViewed;

    await Product.updateOne(
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
