const uuidv4 = require('uuid/v4');
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

module.exports = {
  index: async (req, res) => {
    Promotion.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: PromotionMedia,
      })
      .then((promotions) => {
        console.log('promotions:', promotions);
        return res.status(200).send(promotions);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getAll: async (req, res) => {
    Promotion.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'media',
        model: PromotionMedia,
      })
      .then((promotions) => {
        console.log('promotions:', promotions);
        return res.status(200).send(promotions);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getBySlug: async (req, res) => {
    const { slug } = req.params;
    Promotion.findOne({
      slug: slug,
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
      .then((promotion) => {
        console.log('promotions:', promotion);
        return res.status(200).send(promotion);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  slug: (req, res) => {
    const { slug } = req.params;

    Promotion.findOne({
      slug: slug,
      'deletion.isDeleted': false,
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
          return res.status(400).send(errors);
        } else {
          return res.status(200).send(bundle);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send({ error: 'Server error' });
      });
  },

  validateSlug: (req, res) => {
    const { slug } = req.params;
    const verificationRes = verifyValidSlug(slug);
    return res.json({
      valid: verificationRes,
    });
  },

  create: async (req, res) => {
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
              categoryObj = await createCategory(category, userId);
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
            return res.status(201).send({
              slug: promotion.slug,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return res.json({ error: 'The provided slug is invalid' });
      }
    } catch (err) {
      console.log(err);
    }
  },

  uploadMedia: async (req, res) => {
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
  },

  setGlobalVariable: async (req, res) => {
    const { type, title } = req.body;
    global.gConfigMulter.type = type;
    global.gConfigMulter.title = title;
    global.gConfigMulter.folder_name = global.gConfigMulter.title;
    global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`;
    return res.status(200).send({
      ok: true,
    });
  },

  update: async (req, res) => {
    const {
      media,
      userId,
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
          categoryObj = await createCategory(category, userId);
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
          reseller: userId,
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
      return res.status(200).send({
        slug: newUpdatedPromotion.slug,
      });
    } catch (err) {
      console.log(err);
    }
  },

  delete: async (req, res) => {
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
            return res.status(200).send({ ok: true });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  oldDelete: (req, res) => {
    const { id } = req.params;
    Product.deleteOne({
      id,
    })
      .then(() => {
        return res.json({
          msg: ' Blog Product deleted successfully!',
        });
      })
      .catch((err) => {
        return res.json({
          errorMgs: err,
        });
      });
  },

  deleteMedia: async (req, res) => {
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
  },

  panelGetSlug: (req, res) => {
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
        return res.json(promotion);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}