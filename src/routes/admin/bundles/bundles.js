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
    return false;
  }
};

const createCategory = async (category) => {
  const slug = stringToSlug(category);
  let categoryId = '';
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

  console.log(
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
    organization
  );

  let errors = [];
  if (
    _.isEmpty(products) ||
    !typeof isSlugValid === 'boolean' ||
    !bundleName ||
    !typeof prices.price === 'number' ||
    !typeof prices.compareTo === 'number' ||
    !typeof taxableBundle === 'boolean' ||
    !description ||
    !inventory.sku ||
    !inventory.quantity ||
    !typeof inventory.allowPurchaseOutOfStock === 'boolean' ||
    !typeof shipping.physicalProduct === 'boolean' ||
    !shipping.weight.unit ||
    !shipping.weight.amount ||
    !seo.title ||
    !seo.slug ||
    !seo.description ||
    !organization.category ||
    !organization.tags
  ) {
    if (!typeof isSlugValid === 'boolean') {
      errors.push({
        value: isSlugValid,
        errMsg: 'isSluValid should be boolean',
      });
    } else if (!bundleName) {
      errors.push({
        value: bundleName,
        errMsg: 'bundleName must have at least 1 character',
      });
    } else if (!typeof prices.price === 'number') {
      errors.push({
        value: prices.price,
        errMsg: 'prices.price should be a number',
      });
    } else if (!typeof prices.compareTo === 'number') {
      errors.push({
        value: prices.compareTo,
        errMsg: 'prices.compareTo should be a number',
      });
    } else if (!typeof taxableBundle === 'boolean') {
      errors.push({
        value: taxableBundle,
        errMsg: 'taxableBundle should be boolean',
      });
    } else if (!description) {
      errors.push({
        value: description,
        errMsg: 'description must have at least 1 character',
      });
    } else if (!inventory.sku) {
      errors.push({
        value: inventory.sku,
        errMsg: 'inventory.sku must have at least 1 character',
      });
    } else if (!inventory.quantity) {
      errors.push({
        value: inventory.quantity,
        errMsg: 'inventory.quantity must have at least 1 character',
      });
    } else if (!typeof inventory.allowPurchaseOutOfStock === 'boolean') {
      errors.push({
        value: inventory.allowPurchaseOutOfStock,
        errMsg: 'inventory.allowPurchaseOutOfStock should be boolean',
      });
    } else if (!typeof shipping.physicalProduct === 'boolean') {
      errors.push({
        value: shipping.physicalProduct,
        errMsg: 'shipping.physicalProduct should be boolean',
      });
    } else if (!shipping.weight.unit) {
      errors.push({
        value: shipping.weight.unit,
        errMsg: 'shipping.weight.unit must have at least 1 character',
      });
    } else if (!shipping.weight.amount) {
      errors.push({
        value: shipping.weight.amount,
        errMsg: 'shipping.weight.amount should be a number',
      });
    } else if (!seo.title) {
      errors.push({
        value: seo.title,
        errMsg: 'seo.title must have at least 1 character',
      });
    } else if (!seo.slug) {
      errors.push({
        value: seo.slug,
        errMsg: 'seo.slug must have at least 1 character',
      });
    } else if (!seo.description) {
      errors.push({
        value: seo.description,
        errMsg: 'seo.description must have at least 1 character',
      });
    } else if (!organization.category) {
      errors.push({
        value: organization.category,
        errMsg: 'organization.category must have at least 1 character',
      });
    } else if (!organization.tags) {
      errors.push({
        value: organization.tags,
        errMsg: 'organization.tags must have at least 1 character',
      });
    } else if (_.isEmpty(products)) {
      errors.push({
        value: products,
        errMsg: 'products must have at least 1 product selected',
      });
    }
  }

  if (errors.length > 0) {
    res.json({
      errors,
    });
  } else {
    let slug = stringToSlug(bundleName);
    console.log('promised slug:', slug);
    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

    if (await verifyValidSlug(slug)) {
      try {
        let categoryObj = await getCategory(organization.category);
        console.log('categoryObj get:', categoryObj);

        if (_.isEmpty(categoryObj)) {
          categoryObj = await createCategory(organization.category);
        }
        console.log('categoryObj new:', categoryObj);

        const newBundle = new Bundle({
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
            category: categoryObj,
            tags: organization.tags,
          },
        });

        console.log('newBundle:', newBundle);

        newBundle
          .save()
          .then((bundle) => {
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
