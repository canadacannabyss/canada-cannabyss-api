const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../config/multer');
const slugify = require('slugify');
const _ = require('lodash');

const authMiddleware = require('../../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Bundle = require('../../../models/bundle/Bundle');
const Category = require('../../../models/category/Category');
const CategoryMedia = require('../../../models/category/CategoryMedia');
const Product = require('../../../models/product/Product');
const ProductMedia = require('../../../models/product/ProductMedia');
const Tag = require('../../../models/tag/Tag');

const verifyValidSlug = async (slug) => {
  try {
    const bundle = await Bundle.find({
      slug,
    });
    console.log('bundle:', bundle);
    if (!_.isEmpty(bundle)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

const generateRandomSlug = async (slug) => {
  const id = uuidv4();
  const generatedNewSlug = `${slug}-${id}`;
  return generatedNewSlug;
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

app.get('', async (req, res) => {
  Bundle.find()
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
    .then((product) => {
      res.status(200).send(product);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/panel/get/:slug', (req, res) => {
  const { slug } = req.params;
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
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((bundle) => {
      res.json(bundle);
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
    products,
    isSlugValid,
    variants,
    bundleName,
    prices,
    taxableBundle,
    description,
    extraInfo,
    inventory,
    shipping,
    seo,
    organization,
  } = req.body;

  let slug = stringToSlug(bundleName);
  console.log('promised slug:', slug);
  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug);
  }

  if (await verifyValidSlug(slug)) {
    try {
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

      const newBundle = new Bundle({
        user: userId,
        products: products,
        variants,
        bundleName,
        slug,
        prices,
        taxableBundle,
        description,
        extraInfo,
        inventory,
        shipping,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
      });

      console.log('newBundle:', newBundle);

      newBundle
        .save()
        .then((bundle) => {
          console.log('bundle saved:', bundle);
          res.status(201).send({
            slug: bundle.slug,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.json({ error: 'The provided slug is invalid' });
  }
});

app.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { originalname: name, size, key, location: url = '' } = req.file;
    const id = uuidv4();
    console.log('id:', id);

    const cover = await ProductMedia.create({
      id,
      name,
      size,
      key,
      url,
    });

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
    products,
    variants,
    bundleName,
    prices,
    taxableBundle,
    description,
    extraInfo,
    inventory,
    shipping,
    seo,
    organization,
  } = req.body;
  const { id } = req.params;

  const slug = stringToSlug(bundleName);

  try {
    let categoryObj = await getCategory(organization.category);
    if (_.isEmpty(categoryObj)) {
      categoryObj = await createCategory(organization.category);
    }

    await Bundle.findOneAndUpdate(
      {
        _id: id,
      },
      {
        products: products,
        variants: variants,
        bundleName: bundleName,
        slug: slug,
        prices: {
          price: prices.price,
          compareTo: prices.compareTo,
        },
        taxableBundle: taxableBundle,
        description: description,
        extraInfo: extraInfo,
        inventory: {
          sku: inventory.sku,
          barcode: inventory.barcode,
          quantity: inventory.quantity,
          allowPurchaseOutOfStock: inventory.allowPurchaseOutOfStock,
        },
        shipping: {
          physicalProduct: shipping.physicalProduct,
          weight: {
            unit: shipping.weight.unit,
            amount: shipping.weight.amount,
          },
        },
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
        organization: {
          category: categoryObj,
          tags: organization.tags,
        },
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      }
    );

    const newUpdatedBundle = await Bundle.findOne({
      _id: id,
    });
    res.status(200).send({
      slug: newUpdatedBundle.slug,
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

// Delete Podcast
app.delete('/delete/bundle/:bundleId', async (req, res) => {
  const { bundleId } = req.params;
  console.log('bundleId:', bundleId);

  try {
    const bundleObj = await Bundle.findOne({
      _id: bundleId,
    });

    bundleObj.remove();
    const allBundles = await Bundle.find().populate({
      path: 'products',
      model: Product,
      populate: {
        path: 'media',
        model: ProductMedia,
      },
    });
    console.log(allBundles);
    res.status(200).send(allBundles);
  } catch (err) {
    console.log(err);
  }
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

module.exports = app;
