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

app.get('/', (req, res) => {
  let productsList = [];
  Product.find()
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
      const variantsValues = [];
      for (let i = 0; i < product.variants.variantsOptionNames.length; i += 1) {
        variantsValues.push([]);
      }
      product.variants.variantsOptionNames.map((name, index) => {
        product.variants.values.map((value) => {
          variantsValues[index].push(value.variantValues[index]);
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
          tags: product.organization.tags,
          category: product.organization.category,
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
      publishedOn: '-1',
    })
    .then((comments) => {
      comments.map((comment) => {
        commentsList.push({
          replies: comment.replies,
          updatedOn: comment.updatedOn,
          _id: comment._id,
          user: {
            names: {
              firstName: comment.user.names.firstName,
              lastName: comment.user.lastName,
            },
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
  console.log('category:', category);

  try {
    const categoryObj = await Category.findOne({
      slug: category,
    });
    console.log('categoryObj:', categoryObj);

    const productsList = await Product.find({
      'organization.category': categoryObj._id,
    }).populate({
      path: 'media',
      model: ProductMedia,
    });

    console.log('productsList:', productsList);
    if (productsList !== null) {
      res.status(200).send(productsList);
    } else {
      res.status(200).send([]);
    }
  } catch (err) {
    console.log(err);
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
