const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../../config/multer');
const slugify = require('slugify');
const _ = require('lodash');

const authMiddleware = require('../../../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Banner = require('../../../../models/banner/Banner');
const Promotion = require('../../../../models/promotion/Promotion');
const PromotionMedia = require('../../../../models/promotion/PromotionMedia');
const Category = require('../../../../models/category/Category');
const Tag = require('../../../../models/tag/Tag');

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

const stringToSlug = (string) => {
  return slugify(string).toLowerCase();
};

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
    bannerName,
    description,
    promotions,
    seo,
    featured,
    organization,
  } = req.body;

  console.log(bannerName, description, promotions, seo, featured, organization);

  try {
    const slug = slugify(bannerName).toLowerCase();
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

      const newBanner = new Banner({
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
          res.status(200).send({
            _id: banner._id,
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

// Delete Podcast
app.delete('/delete/banner/:bannerId', async (req, res) => {
  const { bannerId } = req.params;

  try {
    const bannerObj = await Banner.findOne({
      _id: bannerId,
    });

    bannerObj.remove();
    const allBanners = await Banner.find().populate({
      path: 'promotions',
      model: Promotion,
      populate: {
        path: 'media',
        model: PromotionMedia,
      },
    });

    res.status(200).send(allBanners);
  } catch (err) {
    console.log(err);
  }
});

// Update Podcast Info
app.put('/update/:id', async (req, res) => {
  const {
    bannerName,
    description,
    featured,
    promotions,
    seo,
    organization,
  } = req.body;
  const { id } = req.params;

  const slug = stringToSlug(bannerName);

  try {
    let categoryObj = await getCategory(organization.category);

    if (_.isEmpty(categoryObj)) {
      categoryObj = await createCategory(organization.category);
    }

    await Banner.findOneAndUpdate(
      {
        _id: id,
      },
      {
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
          category: categoryObj,
          tags: organization.tags,
        },
      },
      {
        runValidators: true,
      }
    );

    const newUpdatedBanner = await Banner.findOne({
      _id: id,
    });
    res.status(200).send({
      slug: newUpdatedBanner.slug,
    });
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
  const coverFile = await ProductMedia.findOne({
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
      res.json(banner);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
