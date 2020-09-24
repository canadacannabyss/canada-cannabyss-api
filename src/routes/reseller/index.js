const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../config/multer');
const slugify = require('slugify');
const _ = require('lodash');

const authMiddleware = require('../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Product = require('../../models/product/Product');
const ProductMedia = require('../../models/product/ProductMedia');
const Category = require('../../models/category/Category');
const CategoryMedia = require('../../models/category/CategoryMedia');
const Bundle = require('../../models/bundle/Bundle');
const Promotion = require('../../models/promotion/Promotion');
const PromotionMedia = require('../../models/promotion/PromotionMedia');
const Banner = require('../../models/banner/Banner');

app.get('/panel/get/all/products', async (req, res) => {
  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .then((products) => {
      res.status(200).send(products);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.get('/panel/get/all/bundles', async (req, res) => {
  Bundle.find({
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
    .then((bundles) => {
      res.status(200).send(bundles);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.get('/panel/get/all/promotions', async (req, res) => {
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .then((promotions) => {
      res.status(200).send(promotions);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.get('/panel/get/all/banners', async (req, res) => {
  Banner.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'promotions',
      model: Promotion,
      populate: {
        path: 'media',
        model: PromotionMedia,
      },
    })
    .then((banners) => {
      res.status(200).send(banners);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.get('/panel/get/categories/products', async (req, res) => {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = [];
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        });
      });
      console.log(categoriesList);
      res.json(categoriesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/categories/promotion', async (req, res) => {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = [];
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        });
      });
      console.log(categoriesList);
      res.json(categoriesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/categories/banner', async (req, res) => {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = [];
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        });
      });
      console.log(categoriesList);
      res.json(categoriesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/products/by/category/:category', async (req, res) => {
  const { category } = req.params;

  Product.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: ProductMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((products) => {
      let productsList = [];
      products.map((product) => {
        if (product.organization.category !== null) {
          if (product.organization.category.slug === category) {
            productsList.push(product);
          }
        }
      });
      res.status(200).send(productsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/bundles/by/category/:category', async (req, res) => {
  const { category } = req.params;
  Bundle.find({
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
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((bundles) => {
      let bundlesList = [];
      bundles.map((bundle) => {
        if (bundle.organization.category !== null) {
          if (bundle.organization.category.slug === category) {
            bundlesList.push(bundle);
          }
        }
      });
      res.status(200).send(bundlesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/promotions/by/category/:category', async (req, res) => {
  const { category } = req.params;
  Promotion.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'media',
      model: PromotionMedia,
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((promotions) => {
      let promotionsList = [];
      promotions.map((promotion) => {
        console.log('promotions:', promotions);
        if (promotion.organization.category !== null) {
          if (promotion.organization.category.slug === category) {
            promotionsList.push(promotion);
          }
        }
      });
      res.status(200).send(promotionsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/banners/by/category/:category', async (req, res) => {
  const { category } = req.params;
  Banner.find({
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'promotions',
      model: Promotion,
      populate: {
        path: 'media',
        model: PromotionMedia,
      },
    })
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((banners) => {
      let bannersList = [];
      banners.map((banner) => {
        if (banner.organization.category !== null) {
          if (banner.organization.category.slug === category) {
            bannersList.push(banner);
          }
        }
      });
      res.status(200).send(bannersList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/categories/bundles', async (req, res) => {
  Category.find({
    'deletion.isDeleted': false,
  })
    // .sort({howManyViewed: 1})
    .then((categories) => {
      let categoriesList = [];
      categories.map((category) => {
        categoriesList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        });
      });
      console.log(categoriesList);
      res.json(categoriesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/bundles/by/category/:category', async (req, res) => {
  const { category } = req.params;

  Bundle.find({
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
    .populate({
      path: 'organization.category',
      model: Category,
    })
    .then((bundles) => {
      let bundlesList = [];
      bundles.map((bundle) => {
        if (bundle.organization.category !== null) {
          if (bundle.organization.category.slug === category) {
            bundlesList.push(bundle);
          }
        }
      });
      res.status(200).send(bundlesList);
    });
});

module.exports = app;
