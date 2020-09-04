const { slugifyString } = require('../strings/slug');

const Category = require('../../models/category/Category');

module.exports = {
  getCategory: async (category) => {
    console.log('getCategory:', category);
    try {
      const categoryObj = await Category.findOne({
        categoryName: category,
      });
      if (categoryObj === null) {
        return {};
      }
      return categoryObj._id;
    } catch (err) {
      console.log(err);
      return {};
    }
  },
  createCategory: async (category) => {
    const slug = slugifyString(category);
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
  },
};
