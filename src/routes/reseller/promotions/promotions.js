const express = require('express');

const router = express.Router();
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../config/multerPromotion');
const slugify = require('slugify');
const _ = require('lodash');

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../utils/strings/slug');
const {
  getCategory,
  createCategory,
} = require('../../../utils/categories/categories');
const { getTag, createTag } = require('../../../utils/tags/tags');

const Promotion = require('../../../models/promotion/Promotion');
const PromotionMedia = require('../../../models/promotion/PromotionMedia');
const Product = require('../../../models/product/Product');
const Bundle = require('../../../models/bundle/Bundle');
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

router.get('', async (req, res) => {
  Promotion.find({
    'deletion.isDeleted': false,
  })
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

router.get('/get/all', async (req, res) => {
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

router.get('/get/slug/:slug', async (req, res) => {
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

router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  Promotion.findOne({
    slug: slug,
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
      path: 'bundles',
      model: Bundle,
      populate: {
        path: 'products',
        model: Product,
        populate: {
          path: 'media',
          model: ProductMedia,
        },
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
    .then((bundle) => {
      console.log('bundle found:', bundle);
      const errors = [];
      if (!bundle) errors.push({ error: 'Bundle not found' });

      if (errors.length > 0) {
        res.status(400).send(errors);
      } else {
        res.status(200).send(bundle);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ error: 'Server error' });
    });
});

// Check if Podcast slug is valid
router.get('/validation/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const verificationRes = verifyValidSlug(slug);
  res.json({
    valid: verificationRes,
  });
});

router.post('/publish', async (req, res) => {
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
    let slug = slugifyString(promotionName);

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

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
        reseller: userId,
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

router.post(
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

router.post('/set/global-variable', async (req, res) => {
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
router.put('/update/:id', async (req, res) => {
  const {
    media,
    promotionName,
    description,
    products,
    bundles,
    seo,
    organization,
  } = req.body;
  const { id } = req.params;

  let slug = slugifyString(promotionName);

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug);
  }

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

    const promisesCategories = organization.categories.map(async (category) => {
      let categoryObj = await getCategory(category);

      if (_.isEmpty(categoryObj)) {
        categoryObj = await createCategory(category);
      }
      return categoryObj;
    });

    const resultsAsyncCategoriesArray = await Promise.all(promisesCategories);

    const promisesTags = organization.tags.map(async (tag) => {
      let tagObj = await getTag(tag);

      if (_.isEmpty(tagObj)) {
        tagObj = await createTag(tag);
      }
      return tagObj;
    });

    const resultsAsyncTagsArray = await Promise.all(promisesTags);

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
        bundles: bundles,
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        updatedOn: Date.now(),
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
router.delete('/delete/promotion/:promotionId', async (req, res) => {
  const { promotionId } = req.params;

  Promotion.findOne({
    _id: promotionId,
  })
    .then(async (promotion) => {
      await PromotionMedia.findOneAndUpdate(
        {
          _id: promotion.media,
        },
        {
          'deletion.isDeleted': true,
          'deletion.when': Date.now(),
        },
        {
          runValidators: true,
        }
      );

      promotion
        .updateOne(
          {
            'deletion.isDeleted': true,
            'deletion.when': Date.now(),
          },
          {
            runValidators: true,
          }
        )
        .then(() => {
          res.status(200).send({ ok: true });
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

// Delete Podcast
router.delete('/delete/:id', (req, res) => {
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

router.delete('/delete/cover/:id', async (req, res) => {
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

router.get('/panel/get/:slug', (req, res) => {
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

module.exports = router;
