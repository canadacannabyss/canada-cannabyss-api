const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../config/multerPromotion');
const slugify = require('slugify');
const _ = require('lodash');

const authMiddleware = require('../../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Promotion = require('../../../models/promotion/Promotion');
const PromotionMedia = require('../../../models/promotion/PromotionMedia');
const Product = require('../../../models/product/Product');
const ProductMedia = require('../../../models/product/ProductMedia');
const Category = require('../../../models/category/Category');
const Tag = require('../../../models/tag/Tag');

const verifyValidSlug = async (slug) => {
  try {
    const promotion = await Promotion.find({
      slug,
    });
    console.log('promotion:', promotion);
    if (!_.isEmpty(promotion)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

const stringToSlug = (string) => {
  return slugify(string).toLowerCase();
};

const getCategory = async (category) => {
  try {
    const categoryObj = await Category.findOne({
      categoryName: category,
    });
    console.log('categoryObj:', categoryObj);
    if (categoryObj === null) {
      return {};
    }
    return categoryObj._id;
  } catch (err) {
    console.log(err);
    return {};
  }
};

const createCategory = async (category) => {
  const slug = stringToSlug(category);
  const newCategory = new Category({
    categoryName: category,
    slug,
    howManyViewed: 0,
    description: 'Description',
    seo: {
      title: category,
      slug,
      description: 'Seo Description',
    },
  });
  const newCategoryCreated = await newCategory.save();
  return newCategoryCreated._id;
};

const getTag = async (tag) => {
  try {
    const tagObj = await Tag.findOne({
      tagName: tag,
    });
    console.log('tagObj:', tagObj);
    if (tagObj === null) {
      return {};
    }
    return tagObj._id;
  } catch (err) {
    console.log(err);
    return {};
  }
};

const createTag = async (tag) => {
  const slug = stringToSlug(tag);
  const newTag = new Tag({
    tagName: tag,
    slug,
    howManyViewed: 0,
    description: 'Description',
    seo: {
      title: tag,
      slug,
      description: 'Seo Description',
    },
  });
  const newTagCreated = await newTag.save();
  return newTagCreated._id;
};

app.get('/get/all', async (req, res) => {
  Promotion.find()
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotions) => {
      console.log('promotions:', promotions);
      res.status(200).send(promotions);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/get/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  Promotion.findOne({
    slug: slug,
  })
    .populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    })
    .then((promotion) => {
      console.log('promotions:', promotion);
      res.status(200).send(promotion);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Check if Podcast slug is valid
app.get('/validation/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const verificationRes = verifyValidSlug(slug);
  res.json({
    valid: verificationRes,
  });
});

app.post('/publish', async (req, res) => {
  const {
    userId,
    isSlugValid,
    promotionName,
    media,
    products,
    bundles,
    description,
    seo,
    organization,
  } = req.body;

  try {
    const slug = slugify(promotionName).toLowerCase();
    if (await verifyValidSlug(slug)) {
      const promisesCategories = organization.categories.map(
        async (category) => {
          let categoryObj = await getCategory(category);

          if (_.isEmpty(categoryObj)) {
            categoryObj = await createCategory(category);
          }
          return categoryObj;
        }
      );

      const resultsAsyncCategoriesArray = await Promise.all(promisesCategories);

      const promisesTags = organization.tags.map(async (tag) => {
        let tagObj = await getTag(tag);

        if (_.isEmpty(tagObj)) {
          tagObj = await createTag(tag);
        }
        return tagObj;
      });

      const resultsAsyncTagsArray = await Promise.all(promisesTags);

      const newPromotion = new Promotion({
        user: userId,
        media,
        promotionName,
        slug,
        description,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
      });

      newPromotion
        .save()
        .then((promotion) => {
          res.status(201).send({
            slug: promotion.slug,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.json({ error: 'The provided slug is invalid' });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { originalname: name, size, key, location: url = '' } = req.file;
    const id = uuidv4();

    const cover = await PromotionMedia.create({
      id,
      name,
      size,
      key,
      url,
    });

    console.log(cover);

    return res.json(cover);
  }
);

app.post('/set/global-variable', async (req, res) => {
  const { type, title } = req.body;
  global.gConfigMulter.type = type;
  global.gConfigMulter.title = title;
  global.gConfigMulter.folder_name = global.gConfigMulter.title;
  global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`;
  res.status(200).send({
    ok: true,
  });
});

// Update Podcast Info
app.put('/update/:id', async (req, res) => {
  const {
    media,
    promotionName,
    description,
    products,
    seo,
    organization,
  } = req.body;
  const { id } = req.params;

  const slug = stringToSlug(promotionName);

  try {
    let newMedia = [];
    const promotionObj = await Promotion.findOne({
      _id: id,
    });
    if (media === undefined) {
      newMedia = promotionObj.media;
    } else {
      newMedia = media;
      if (promotionObj.slug !== slug) {
        const promotionMediaObj = await PromotionMedia.findOne({
          _id: promotionObj.media,
        });
        promotionMediaObj.remove();
      }
    }

    let categoryObj = await getCategory(organization.category);
    if (_.isEmpty(categoryObj)) {
      categoryObj = await createCategory(organization.category);
    }

    await Promotion.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
        promotionName: promotionName,
        slug: slug,
        description: description,
        products: products,
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
        organization: {
          category: categoryObj,
          tags: organization.tags,
        },
      },
      {
        runValidators: true,
      }
    );

    const newUpdatedPromotion = await Promotion.findOne({
      _id: id,
    });
    res.status(200).send({
      slug: newUpdatedPromotion.slug,
    });
  } catch (err) {
    console.log(err);
  }
});

// Delete Podcast
app.delete('/delete/promotion/:promotionId', async (req, res) => {
  const { promotionId } = req.params;

  try {
    const promotionObj = await Promotion.findOne({
      _id: promotionId,
    });

    promotionObj.remove();
    const allPromotions = await Promotion.find().populate({
      path: 'media',
      model: PromotionMedia,
    });

    res.status(200).send(allPromotions);
  } catch (err) {
    console.log(err);
  }
});

// Delete Podcast
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  Product.deleteOne({
    id,
  })
    .then(() => {
      res.json({
        msg: ' Blog Product deleted successfully!',
      });
    })
    .catch((err) => {
      res.json({
        errorMgs: err,
      });
    });
});

app.delete('/delete/cover/:id', async (req, res) => {
  const { id } = req.params;
  const coverFile = await PromotionMedia.findOne({
    _id: id,
  });
  console.log('id:', id);
  console.log('coverFile:', coverFile);
  await coverFile.remove();
  return res.send({
    msg: 'Blog Product cover file successfully deleted',
  });
});

app.get('/panel/get/:slug', (req, res) => {
  const { slug } = req.params;
  Promotion.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
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
      path: 'organization.category',
      model: Category,
    })
    .then((promotion) => {
      res.json(promotion);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
