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

const Product = require('../../../models/product/Product');
const ProductMedia = require('../../../models/product/ProductMedia');
const Category = require('../../../models/category/Category');
const CategoryMedia = require('../../../models/category/CategoryMedia');

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

const verifyValidSlugCategory = async (slug) => {
  try {
    const category = await Category.find({
      slug,
    });
    console.log('category:', category);
    if (!_.isEmpty(category)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

const convertNameToSlug = (name) => {
  return slugify(name.toLowerCase());
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

app.get('', async (req, res) => {
  Product.find()
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((products) => {
      console.log('products:', products);
      res.status(200).send(products);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/panel/get/:slug', (req, res) => {
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
app.get('/validation/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const verificationRes = verifyValidSlug(slug);
  res.json({
    valid: verificationRes,
  });
});

app.post('/publish', async (req, res) => {
  const {
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
  console.log(
    'product:',
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
    organization
  );

  let slug = stringToSlug(productName);
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

      const newProduct = new Product({
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
          category: categoryObj,
          tags: organization.tags,
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

app.post(
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

// Update Product Info
app.put('/update/:id', async (req, res) => {
  const {
    media,
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

  console.log('variants updated:', variants);

  const slug = convertNameToSlug(productName);

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

    let categoryObj = await getCategory(organization.category);

    if (_.isEmpty(categoryObj)) {
      categoryObj = await createCategory(organization.category);
    }

    await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
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
          category: categoryObj,
          tags: organization.tags,
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

// Delete Podcast
app.delete('/delete/product/:productId', async (req, res) => {
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
    const allProducts = await Product.find().populate({
      path: 'media',
      model: ProductMedia,
    });
    console.log(allProducts);
    res.status(200).send(allProducts);
  } catch (err) {
    console.log(err);
  }
});

app.delete('/delete/cover/:id', async (req, res) => {
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

module.exports = app;
