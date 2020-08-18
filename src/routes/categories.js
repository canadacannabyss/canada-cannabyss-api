const express = require('express');
const router = express.Router();

const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');

router.get('', (req, res) => {
  const categoriesList = [];
  Category.find()
    .populate({
      path: 'media',
      model: CategoryMedia,
    })
    .then((categories) => {
      categories.map((category) => {
        console.log('category:', category);
        let categoryMediaUrl = '';
        if (category.media === null || category.media === undefined) {
          categoryMediaUrl = '';
        } else {
          categoryMediaUrl = category.media.url;
        }
        categoriesList.push({
          id: category._id,
          categoryName: category.categoryName,
          slug: category.slug,
          media: {
            url: categoryMediaUrl,
          },
        });
      });
      res.json(categoriesList);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
