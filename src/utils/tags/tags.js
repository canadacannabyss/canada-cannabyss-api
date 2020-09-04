const { slugifyString } = require('../strings/slug');

const Tag = require('../../models/tag/Tag');

module.exports = {
  getTag: async (tag) => {
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
  },
  createTag: async (tag) => {
    const slug = slugifyString(tag);
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
  },
};
