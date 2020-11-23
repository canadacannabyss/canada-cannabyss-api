const slugify = require('slugify');
const _ = require('lodash');

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../../utils/strings/slug');
const {
  getCategory,
  createCategory,
} = require('../../../../utils/categories/categories');
const { getTag, createTag } = require('../../../../utils/tags/tags');

const Banner = require('../../../../models/banner/Banner');
const Promotion = require('../../../../models/promotion/Promotion');
const PromotionMedia = require('../../../../models/promotion/PromotionMedia');
const Category = require('../../../../models/category/Category');
const Tag = require('../../../../models/tag/Tag');
const { find } = require('lodash');
const { validateSlug } = require('../promotions');

const verifyValidSlug = async (slug) => {
  try {
    const banner = await Banner.find({
      slug,
    });
    console.log('banner:', banner);
    if (!_.isEmpty(banner)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  index: (req, res) => {
    Banner.find({
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
      })
      .populate({
        path: 'organization.categories',
        model: Category,
      })
      .populate({
        path: 'organization.tags',
        model: Tag,
      })
      .then((banner) => {
        return res.json(banner);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  validateSlug: (req, res) => {
    const { slug } = req.params;
    const verificationRes = verifyValidSlug(slug);
    return res.json({
      valid: verificationRes,
    });
  },

  publish: async (req, res) => {
    const {
      reseller,
      bannerName,
      description,
      promotions,
      seo,
      featured,
      organization,
    } = req.body;

    console.log(bannerName, description, promotions, seo, featured, organization);

    try {
      let slug = slugifyString(bannerName);

      if (!(await verifyValidSlug(slug))) {
        slug = await generateRandomSlug(slug);
      }

      if (await verifyValidSlug(slug)) {
        const promisesCategories = organization.categories.map(
          async (category) => {
            let categoryObj = await getCategory(category);

            if (_.isEmpty(categoryObj)) {
              categoryObj = await createCategory(category, reseller);
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

        const newBanner = new Banner({
          reseller,
          bannerName: bannerName,
          slug: slug,
          description: description,
          promotions: promotions,
          featured: featured,
          seo,
          organization: {
            categories: resultsAsyncCategoriesArray,
            tags: resultsAsyncTagsArray,
          },
        });

        newBanner
          .save()
          .then((banner) => {
            return res.status(200).send({
              _id: banner._id,
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

  delete: async (req, res) => {
    const { bannerId } = req.params;

    Banner.findOneAndUpdate(
      {
        _id: bannerId,
      },
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
  },

  update: async (req, res) => {
    const {
      reseller,
      bannerName,
      description,
      featured,
      promotions,
      seo,
      organization,
    } = req.body;
    const { id } = req.params;

    try {
      let slug = slugifyString(bannerName);

      if (!(await verifyValidSlug(slug))) {
        slug = await generateRandomSlug(slug);
      }
      if (await verifyValidSlug(slug)) {
        const promisesCategories = organization.categories.map(
          async (category) => {
            let categoryObj = await getCategory(category);

            if (_.isEmpty(categoryObj)) {
              categoryObj = await createCategory(category, reseller);
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

        await Banner.findOneAndUpdate(
          {
            _id: id,
          },
          {
            reseller: reseller,
            bannerName: bannerName,
            slug: slug,
            description: description,
            promotions: promotions,
            featured: featured,
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

        const newUpdatedBanner = await Banner.findOne({
          _id: id,
        });
        return res.status(200).send({
          slug: newUpdatedBanner.slug,
        });
      } else {
        return res.json({ error: 'The provided slug is invalid' });
      }
    } catch (err) {
      console.log(err);
    }
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
    const coverFile = await ProductMedia.findOne({
      _id: id,
    });
    console.log('id:', id);
    console.log('coverFile:', coverFile);
    await coverFile.remove();
    return res.send({
      msg: 'Blog Product cover file successfully deleted',
    });
  },

  panelGetBySlug: (req, res) => {
    const { slug } = req.params;
    Banner.findOne({
      slug,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
      })
      .populate({
        path: 'organization.category',
        model: Category,
      })
      .then((banner) => {
        return res.json(banner);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getSlug: (req, res) => {
    const { slug } = req.params;
    Banner.findOne({
      slug,
      'deletion.isDeleted': false,
    })
      .populate({
        path: 'promotions',
        model: Promotion,
      })
      .populate({
        path: 'organization.categories',
        model: Category,
      })
      .populate({
        path: 'organization.tags',
        model: Tag,
      })
      .then((banner) => {
        return res.json(banner);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}