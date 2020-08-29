const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

app.use(cors());

const Product = require('../../../models/product/Product');
const ProductComment = require('../../../models/product/ProductComment');
const Bundle = require('../../../models/bundle/Bundle');
const BundleComment = require('../../../models/bundle/BundleComment');
const User = require('../../../models/user/User');
const UserProfileImage = require('../../../models/user/UserProfileImage');

app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const commentsList = [];
  const commentsProductList = [];
  const commentsBundleList = [];

  try {
    const commentsProductObj = await ProductComment.find({
      user: userId,
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
        path: 'product',
        model: Product,
      });

    commentsProductObj.map((comment) => {
      commentsProductList.push({
        _id: comment._id,
        user: {
          names: {
            firstName: comment.user.names.firstName,
            lastName: comment.user.names.lastName,
          },
          profileImage: {
            url: comment.user.profileImage.url,
          },
        },
        product: {
          productName: comment.product.productName,
          slug: comment.product.slug,
        },
        createdOn: comment.createdOn,
        content: comment.content,
      });
    });

    const commentsBundleObj = await BundleComment.find({
      user: userId,
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
        path: 'bundle',
        model: Bundle,
      });

    commentsBundleObj.map((comment) => {
      commentsBundleList.push({
        _id: comment._id,
        user: {
          names: {
            firstName: comment.user.names.firstName,
            lastName: comment.user.names.lastName,
          },
          profileImage: {
            url: comment.user.profileImage.url,
          },
        },
        bundle: {
          bundleName: comment.bundle.bundleName,
          slug: comment.bundle.slug,
        },
        createdOn: comment.createdOn,
        content: comment.content,
      });
    });

    const resultObj = {
      commentsProduct: commentsProductList,
      commentsBundle: commentsBundleList,
    };

    res.status(200).send(resultObj);
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
