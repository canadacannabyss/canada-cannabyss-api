const express = require('express');

const router = express.Router();
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const multer = require('multer');

const multerConfig = require('../../../config/multer');

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../utils/strings/slug');
const {
  getCategory,
  createCategory,
} = require('../../../utils/categories/categories');
const { getTag, createTag } = require('../../../utils/tags/tags');

const Product = require('../../../models/product/Product');
const ProductMedia = require('../../../models/product/ProductMedia');
const Category = require('../../../models/category/Category');
const CategoryMedia = require('../../../models/category/CategoryMedia');
const Tag = require('../../../models/tag/Tag');

const verifyValidSlug = async (slug) => {
  try {
    const product = await Product.find({
      slug,
    });
    console.log('product:', product);
    if (!_.isEmpty(product)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

router.get('', async (req, res) => {
  Product.find()
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((products) => {
      res.status(200).send(products);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/panel/get/:slug', (req, res) => {
  const { slug } = req.params;
  Product.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
      populate: {
        path: 'media',
        model: CategoryMedia,
      },
    })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
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
    media,
    isSlugValid,
    variants,
    productName,
    prices,
    taxableProduct,
    description,
    extraInfo,
    inventory,
    shipping,
    seo,
    organization,
  } = req.body;

  let slug = slugifyString(productName);

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

      const newProduct = new Product({
        reseller: userId,
        media,
        variants,
        productName,
        slug,
        prices,
        taxableProduct,
        description,
        extraInfo,
        inventory,
        shipping: {
          physicalProduct: shipping.physicalProduct,
          weight: {
            unit: shipping.weight.unit,
            amount: shipping.weight.amount,
          },
        },
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
      });

      console.log('newProduct:', newProduct);

      newProduct
        .save()
        .then((product) => {
          res.status(201).send({
            slug: product.slug,
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

router.post(
  '/publish/media',
  multer(multerConfig).single('file'),
  async (req, res) => {
    try {
      const { originalname: name, size, key, location: url = '' } = req.file;
      const id = uuidv4();

      console.log(name, size, key, url);

      const productMedia = await ProductMedia.create({
        id,
        name,
        size,
        key,
        url,
      });

      return res.json(productMedia);
    } catch (err) {
      console.log(err);
    }
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

// Update Product Info
router.put('/update/:id', async (req, res) => {
  const {
    media,
    reseller,
    productName,
    prices,
    taxableProduct,
    description,
    extraInfo,
    inventory,
    shipping,
    variants,
    seo,
    organization,
  } = req.body;
  const { id } = req.params;

  let slug = slugifyString(productName);

  if (!(await verifyValidSlug(slug))) {
    slug = await generateRandomSlug(slug);
  }
  try {
    let newMedia = [];
    const productObj = await Product.findOne({
      _id: id,
    });
    if (media === undefined) {
      newMedia = productObj.media;
    } else {
      newMedia = media;
      if (productObj.slug !== slug) {
        productObj.media.map(async (image) => {
          const productMediaObj = await ProductMedia.findOne({
            _id: image,
          });
          productMediaObj.remove();
        });
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

    await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
        reseller: reseller,
        productName: productName,
        slug: slug,
        prices: {
          price: prices.price,
          compareTo: prices.compareTo,
        },
        taxableProduct: taxableProduct,
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
        variants: {
          variantsOptionNames: variants.variantsOptionNames,
          values: variants.values,
        },
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

    const newUpdatedProduct = await Product.findOne({
      _id: id,
    });
    res.status(200).send({
      slug: newUpdatedProduct.slug,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  console.log('slug:', slug);

  Product.findOne({
    slug: slug,
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
      const errors = [];
      if (!product) errors.push({ error: 'Product not found' });

      if (errors.length > 0) {
        res.status(400).send(errors);
      } else {
        res.status(200).send(product);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ error: 'Server error' });
    });
});

// Delete Podcast
router.delete('/delete/product/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log('productId:', productId);

  try {
    const productObj = await Product.findOne({
      _id: productId,
    });

    productObj.media.map(async (media) => {
      console.log(media);
      const productMediaObj = await ProductMedia.findOne({
        _id: media,
      });
      await productMediaObj.remove();
    });
    productObj.remove();
    res.status(200).send({ ok: true });
  } catch (err) {
    console.log(err);
  }
});

router.delete('/delete/cover/:id', async (req, res) => {
  const { id } = req.params;
  console.log('deleting product image id:', id);
  const coverFile = await ProductMedia.findOne({
    _id: id,
  });

  await coverFile.remove();
  res.status(200).send({
    ok: true,
  });
});

module.exports = router;
