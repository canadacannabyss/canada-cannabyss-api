const Category = require('../models/category/Category');
const CategoryMedia = require('../models/category/CategoryMedia');

module.exports = {
  index: (req, res) => {
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
        return res.json(categoriesList);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}