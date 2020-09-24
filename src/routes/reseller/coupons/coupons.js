const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {
  slugifyString,
  generateRandomSlug,
} = require('../../../utils/strings/slug');
const {
  getCategory,
  createCategory,
} = require('../../../utils/categories/categories');
const { getTag, createTag } = require('../../../utils/tags/tags');

const Coupon = require('../../../models/coupon/Coupon');
const Category = require('../../../models/category/Category');
const CategoryMedia = require('../../../models/category/CategoryMedia');
const Tag = require('../../../models/tag/Tag');

const verifyValidSlug = async (slug) => {
  try {
    const coupon = await Coupon.find({
      slug,
    });
    console.log('product:', coupon);
    if (!_.isEmpty(coupon)) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
};

router.get('/get/all', async (req, res) => {
  Coupon.find({
    'deletion.isDeleted': false,
  })
    .then((coupons) => {
      res.status(200).send(coupons);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/validate/couponName/:couponName', async (req, res) => {
  const { couponName } = req.params;

  Coupon.findOne({
    couponName,
  })
    .then((coupon) => {
      console.log('coupon:', coupon);
      if (!coupon) {
        res.json(true);
      } else {
        res.json(false);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/get/coupon/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log('slug:', slug);

  Coupon.findOne({
    slug,
  })
    .populate({
      path: 'organization.categories',
      model: Category,
    })
    .populate({
      path: 'organization.tags',
      model: Tag,
    })
    .then((coupon) => {
      console.log('coupon:', coupon);
      res.status(200).send(coupon);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post('/create', async (req, res) => {
  const {
    resellerId,
    couponName,
    description,
    featured,
    freeShipping,
    availableAt,
    quantity,
    discount,
    seo,
    organization,
    products,
    bundles,
  } = req.body;

  console.log('req.body:', req.body);

  try {
    let slug = slugifyString(couponName);
    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
    }

    if (await verifyValidSlug(slug)) {
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

      const newCoupon = new Coupon({
        reseller: resellerId,
        couponName,
        slug,
        description,
        availableAt,
        featured,
        freeShipping,
        quantity,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        discount: {
          type: discount.type,
          amount: discount.amount,
        },
      });

      newCoupon
        .save()
        .then(() => {
          res.status(200).send({ ok: true });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  } catch (err) {
    console.error(err);
  }
});

router.put('/edit', async (req, res) => {
  const {
    id,
    couponName,
    description,
    featured,
    freeShipping,
    availableAt,
    quantity,
    discount,
    seo,
    organization,
    products,
    bundles,
  } = req.body;

  try {
    let slug = slugifyString(couponName);

    if (!(await verifyValidSlug(slug))) {
      slug = await generateRandomSlug(slug);
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

    Coupon.findOneAndUpdate(
      {
        _id: id,
      },
      {
        couponName,
        slug,
        description,
        availableAt,
        featured,
        freeShipping,
        quantity,
        products,
        bundles,
        seo,
        organization: {
          categories: resultsAsyncCategoriesArray,
          tags: resultsAsyncTagsArray,
        },
        discount: {
          type: discount.type,
          amount: discount.amount,
        },
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      }
    )
      .then(() => {
        res.status(200).send({ ok: true });
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error(err);
  }
});

// Delete Podcast
router.put('/delete/coupon/:couponId', async (req, res) => {
  const { couponId } = req.params;

  Coupon.findOneAndUpdate(
    {
      _id: couponId,
    },
    {
      'deletion.isDeleted': true,
      'deletion.when': Date.now(),
    },
    {
      runValidators: true,
    }
  )
    .then(() => {
      res.status(200).send({ ok: true });
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;
