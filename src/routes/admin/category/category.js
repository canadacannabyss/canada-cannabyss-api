const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../config/multerCategory');
const slugify = require('slugify');
const _ = require('lodash');

const authMiddleware = require('../../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Category = require('../../../models/category/Category');
const CategoryMedia = require('../../../models/category/CategoryMedia');
const Product = require('../../../models/product/Product');
const Bundle = require('../../../models/bundle/Bundle');
const Promotion = require('../../../models/promotion/Promotion');
const Banner = require('../../../models/banner/Banner');

const verifyValidSlug = async (slug) => {
  try {
    const product = await Category.find({
      slug,
    });
    if (!_.isEmpty(product)) {
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

const convertNameToSlug = (name) => {
  return slugify(name.toLowerCase());
};

app.get('/panel/get/all', (req, res) => {
  Category.find()
    .sort({
      createdOn: -1,
    })
    .then((categories) => {
      let categoryList = [];
      categories.map((category) => {
        categoryList.push({
          categoryName: category.categoryName,
          slug: category.slug,
        });
      });
      res.json(categoryList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/panel/get/:slug', (req, res) => {
  const { slug } = req.params;
  Category.findOne({
    slug,
  })
    .populate({
      path: 'media',
      model: CategoryMedia,
    })
    .then((category) => {
      res.json(category);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/sync', async (req, res) => {
  try {
    const categoriesObj = await Category.find();
    categoriesObj.map(async (category) => {
      const productObj = await Product.find({
        organization: {
          category: category._id,
        },
      });
      const bundleObj = await Bundle.find({
        organization: {
          category: category._id,
        },
      });
      const promotionObj = await Promotion.find({
        organization: {
          category: category._id,
        },
      });
      const bannerObj = await Banner.find({
        organization: {
          category: category._id,
        },
      });
      console.log('productObj:', productObj);
      console.log('bundleObj:', bundleObj);
      console.log('promotionObj:', promotionObj);
      console.log('bannerObj:', bannerObj);
      if (
        productObj.length === 0 &&
        bundleObj.length === 0 &&
        promotionObj.length === 0 &&
        bannerObj.length === 0
      ) {
        category.remove();
      }
    });
    const newCategories = await Category.find().populate({
      path: 'media',
      model: CategoryMedia,
    });
    console.log('newCategories:', newCategories);
    res.status(200).send(newCategories);
  } catch (err) {
    console.log(err);
  }
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
  const { media, isSlugValid, categoryName, description, seo } = req.body;

  let errors = [];
  if (
    _.isEmpty(media) ||
    !typeof isSlugValid === 'boolean' ||
    !categoryName ||
    !description ||
    !seo.title ||
    !seo.slug ||
    !seo.description
  ) {
    if (!typeof isSlugValid === 'boolean') {
      errors.push({
        value: isSlugValid,
        errMsg: 'isSluValid should be boolean',
      });
    } else if (!categoryName) {
      errors.push({
        value: categoryName,
        errMsg: 'categoryName must have at least 1 character',
      });
    } else if (!description) {
      errors.push({
        value: description,
        errMsg: 'description must have at least 1 character',
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
    }
  }

  if (errors.length > 0) {
    res.json({
      errors,
    });
  } else {
    const slug = slugify(categoryName).toLowerCase();

    if (await verifyValidSlug(slug)) {
      const newCategory = new Category({
        media,
        categoryName,
        slug,
        description,
        seo,
      });

      newCategory
        .save()
        .then((category) => {
          res.status(201).send({
            _id: category._id,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.json({ error: 'The provided slug is invalid' });
    }
  }
});

app.put('/update/:id', async (req, res) => {
  const { media, categoryName, featured, description, seo } = req.body;
  const { id } = req.params;

  console.log(media, categoryName, featured, description, seo);

  const slug = convertNameToSlug(categoryName);

  try {
    let newMedia = [];

    const categoryObj = await Category.findOne({
      _id: id,
    });

    if (media === undefined) {
      newMedia = categoryObj.media;
    } else {
      newMedia = media;
      if (categoryObj.slug !== slug) {
        categoryObj.media.map(async (image) => {
          const categoryMediaObj = await CategoryMedia.findOne({
            _id: image,
          });
          categoryMediaObj.remove();
        });
      }
    }

    await Category.findOneAndUpdate(
      {
        _id: id,
      },
      {
        media: newMedia,
        categoryName: categoryName,
        slug: slug,
        featured: featured,
        description: description,
        seo: {
          title: seo.title,
          slug: seo.slug,
          description: seo.description,
        },
      },
      {
        runValidators: true,
      }
    );

    const newUpdatedCategory = await Category.findOne({
      _id: id,
    });
    res.status(200).send({
      slug: newUpdatedCategory.slug,
    });
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
    console.log('id:', id);

    const cover = await CategoryMedia.create({
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

// Update Category Cover
app.get('/get/cover/:id', async (req, res) => {
  const { id } = req.params;
  CategoryMedia.findOne({
    _id: id,
  })
    .then((cover) => {
      res.json(cover);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Update Category Cover
app.put('/update/cover/:id', async (req, res) => {
  const { id } = req.params;
  const coverFile = await CategoryMedia.findOne({
    _id: id,
  });
  console.log('id:', id);
  console.log('coverFile:', coverFile);
  await coverFile.remove();
  return res.send({
    msg: 'Blog Category cover file successfully deleted',
  });
});

// Delete Category
app.delete('/delete/category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  console.log('categoryId:', categoryId);

  try {
    const categoryObj = await Category.findOne({
      _id: categoryId,
    });

    const categoryMediaObj = await CategoryMedia.findOne({
      _id: categoryObj.media,
    });
    if (categoryMediaObj !== null) {
      categoryMediaObj.remove();
    }
    categoryObj.remove();
    const allCategories = await Category.find();

    res.status(200).send(allCategories);
  } catch (err) {
    console.log(err);
  }
});

// Delete Category Cover
app.delete('/delete/media/:id', async (req, res) => {
  const { id } = req.params;
  const coverFile = await CategoryMedia.findOne({
    id: id,
  });
  await coverFile.remove();
  return res.send({
    msg: 'Blog Category cover file successfully deleted',
  });
});

module.exports = app;
